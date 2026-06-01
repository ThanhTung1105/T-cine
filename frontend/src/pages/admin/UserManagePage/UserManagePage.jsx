import React, { useState, useEffect } from 'react';
import { MdEdit, MdDelete, MdClose, MdSearch } from 'react-icons/md';
import axiosClient from '../../../api/axiosClient';
import { getErrorMessage } from '../../../utils/helpers';
import { notify, confirmDialog } from '../../../utils/notify';
import styles from './UserManagePage.module.scss';

const roleMap = { admin: 'Quản trị viên', customer: 'Khách hàng' };

const UserManagePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ name: '', phone: '', role: 'customer' });
  const [errors, setErrors] = useState({});

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/admin/users', { params: { per_page: 100, search: searchTerm || undefined } });
      setUsers(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({ name: user.name, phone: user.phone || '', role: user.role });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setErrors({});
  };

  const handleDelete = async (id) => {
    const ok = await confirmDialog({
      title: 'Xóa người dùng này?',
      message: 'Hành động này không thể hoàn tác. Người dùng sẽ bị xóa khỏi hệ thống.',
      confirmText: 'Xóa',
      danger: true,
    });
    if (!ok) return;

    try {
      await axiosClient.delete(`/admin/users/${id}`);
      notify.success('Đã xóa người dùng thành công');
      fetchUsers();
    } catch (e) {
      console.error(e);
      notify.error(getErrorMessage(e), 'Xóa thất bại!');
    }
  };

  const handleSave = async () => {
    const newErrors = {};
    if (!formData.name?.trim()) {
      newErrors.name = 'Họ và tên không được để trống';
    }
    
    const phoneVal = formData.phone?.trim();
    if (phoneVal && !/^[0-9]{10,11}$/.test(phoneVal)) {
      newErrors.phone = 'Số điện thoại phải từ 10 đến 11 số';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      await axiosClient.put(`/admin/users/${editingUser.id}`, {
        name: formData.name.trim(),
        phone: phoneVal,
        role: formData.role,
      });
      notify.success('Cập nhật thông tin người dùng thành công');
      handleCloseModal();
      fetchUsers();
    } catch (e) {
      console.error(e);
      notify.error(getErrorMessage(e), 'Cập nhật thất bại!');
    } finally {
      setSaving(false);
    }
  };

  const handleSearch = () => fetchUsers();

  return (
    <div className={styles.userManage}>
      <div className={styles.header}>
        <h2>Quản lý Người dùng</h2>
        <div className={styles.headerRight}>
          <div className={styles.searchBar}>
            <input type="text" placeholder="Tìm theo tên, email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
            <button onClick={handleSearch}><MdSearch /></button>
          </div>
        </div>
      </div>

      <div className={styles.tableContainer}>
        {loading ? <p style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>Đang tải...</p> : (
          <table className={styles.table}>
            <thead><tr><th>ID</th><th>Họ tên</th><th>Email</th><th>Số điện thoại</th><th>Vai trò</th><th>Thao tác</th></tr></thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#aaa' }}>Không có người dùng</td></tr>
              ) : users.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td><strong>{user.name}</strong></td>
                  <td>{user.email}</td>
                  <td>{user.phone || '-'}</td>
                  <td>
                    <span className={`${styles.roleBadge} ${user.role === 'admin' ? styles.roleAdmin : styles.roleUser}`}>
                      {roleMap[user.role] || user.role}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionBtns}>
                      <button className={styles.editBtn} title="Chỉnh sửa" onClick={() => handleEdit(user)}><MdEdit /></button>
                      <button className={styles.deleteBtn} title="Xóa" onClick={() => handleDelete(user.id)}><MdDelete /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && editingUser && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Chỉnh sửa: {editingUser.name}</h3>
              <button className={styles.closeBtn} onClick={handleCloseModal}><MdClose /></button>
            </div>
            <div className={styles.modalBody}>
              <form className={styles.form} onSubmit={e => e.preventDefault()} noValidate>
                <div className={styles.formGroup}>
                  <label>Họ và tên *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className={errors.name ? 'inputErrorGlobal' : ''} />
                  {errors.name && <span className="errorTextGlobal">{errors.name}</span>}
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Số điện thoại</label>
                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} className={errors.phone ? 'inputErrorGlobal' : ''} />
                    {errors.phone && <span className="errorTextGlobal">{errors.phone}</span>}
                  </div>
                  <div className={styles.formGroup}>
                    <label>Vai trò</label>
                    <select name="role" value={formData.role} onChange={handleChange}>
                      <option value="customer">Khách hàng</option>
                      <option value="admin">Quản trị viên</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={handleCloseModal}>Hủy</button>
              <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>{saving ? 'Đang lưu...' : 'Cập Nhật'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagePage;
