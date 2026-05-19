import React, { useState, useEffect } from 'react';
import { MdAdd, MdEdit, MdDelete, MdClose } from 'react-icons/md';
import cinemaApi from '../../../api/cinemaApi';
import { getErrorMessage } from '../../../utils/helpers';
import { notify, confirmDialog } from '../../../utils/notify';
import styles from './CinemaManagePage.module.scss';

const CinemaManagePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCinema, setEditingCinema] = useState(null);
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ name: '', address: '', city: '' });

  const fetchCinemas = async () => {
    setLoading(true);
    try {
      const res = await cinemaApi.getAll();
      setCinemas(res.data || []);
    } catch (e) {
      console.error('[CinemaManagePage] fetchCinemas error:', e);
      notify.error(getErrorMessage(e), 'Tải danh sách rạp thất bại');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchCinemas(); }, []);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleOpenModal = () => {
    setEditingCinema(null);
    setFormData({ name: '', address: '', city: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (cinema) => {
    setEditingCinema(cinema);
    setFormData({ name: cinema.name, address: cinema.address, city: cinema.city || '' });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => { setIsModalOpen(false); setEditingCinema(null); };

  const handleDelete = async (id) => {
    const ok = await confirmDialog({
      title: 'Xóa rạp này?',
      message: 'Toàn bộ phòng chiếu & ghế trong rạp cũng có thể bị ảnh hưởng. Hành động không thể hoàn tác.',
      confirmText: 'Xóa',
      danger: true,
    });
    if (!ok) return;
    try {
      await cinemaApi.delete(id);
      notify.success('Đã xóa rạp');
      fetchCinemas();
    } catch (e) {
      console.error('[CinemaManagePage] delete error:', e);
      notify.error(getErrorMessage(e), 'Xóa rạp thất bại');
    }
  };

  const handleSave = async () => {
    if (!formData.name?.trim() || !formData.address?.trim() || !formData.city?.trim()) {
      notify.warning('Vui lòng nhập đầy đủ Tên rạp, Địa chỉ và Thành phố!');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
      };
      if (editingCinema) {
        await cinemaApi.update(editingCinema.id, payload);
        notify.success('Đã cập nhật rạp');
      } else {
        await cinemaApi.create(payload);
        notify.success('Đã thêm rạp mới');
      }
      handleCloseModal();
      fetchCinemas();
    } catch (e) {
      console.error('[CinemaManagePage] save error:', e);
      notify.error(getErrorMessage(e), 'Lưu rạp thất bại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.cinemaManage}>
      <div className={styles.header}>
        <h2>Quản lý Rạp Chiếu Phim</h2>
        <button className={styles.addBtn} onClick={handleOpenModal}><MdAdd /> Thêm Rạp Mới</button>
      </div>

      <div className={styles.tableContainer}>
        {loading ? <p style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>Đang tải...</p> : (
          <table className={styles.table}>
            <thead><tr><th>Tên Rạp</th><th>Địa chỉ</th><th>Thành phố</th><th>Số phòng chiếu</th><th>Thao tác</th></tr></thead>
            <tbody>
              {cinemas.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#aaa' }}>Chưa có rạp nào</td></tr>
              ) : cinemas.map(cinema => (
                <tr key={cinema.id}>
                  <td><strong>{cinema.name}</strong></td>
                  <td>{cinema.address}</td>
                  <td>{cinema.city || '-'}</td>
                  <td>{cinema.rooms_count ?? 0} phòng</td>
                  <td>
                    <div className={styles.actionBtns}>
                      <button className={styles.editBtn} title="Sửa" onClick={() => handleEdit(cinema)}><MdEdit /></button>
                      <button className={styles.deleteBtn} title="Xóa" onClick={() => handleDelete(cinema.id)}><MdDelete /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>{editingCinema ? 'Sửa Rạp' : 'Thêm Rạp Mới'}</h3>
              <button className={styles.closeBtn} onClick={handleCloseModal}><MdClose /></button>
            </div>
            <div className={styles.modalBody}>
              <form className={styles.form} onSubmit={e => e.preventDefault()}>
                <div className={styles.formGroup}><label>Tên Rạp *</label><input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="VD: T-CINE Landmark 81" /></div>
                <div className={styles.formGroup}><label>Địa chỉ *</label><textarea rows="2" name="address" value={formData.address} onChange={handleChange} placeholder="Nhập địa chỉ đầy đủ"></textarea></div>
                <div className={styles.formGroup}><label>Thành phố *</label><input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="VD: Hà Nội" /></div>
              </form>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={handleCloseModal}>Hủy</button>
              <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu Rạp'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CinemaManagePage;
