import React, { useState } from 'react';
import { MdAdd, MdEdit, MdDelete, MdClose, MdSearch } from 'react-icons/md';
import styles from './UserManagePage.module.scss';

const UserManagePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users] = useState([
    { id: 1, name: 'Nguyễn Văn A', email: 'nva@gmail.com', phone: '0901234567', role: 'Khách hàng', status: 'Hoạt động' },
    { id: 2, name: 'Admin Tổng', email: 'admin@tcine.vn', phone: '0987654321', role: 'Quản trị viên', status: 'Hoạt động' },
    { id: 3, name: 'Trần Thị B', email: 'ttb_test@yahoo.com', phone: '0912345678', role: 'Khách hàng', status: 'Bị khóa' },
  ]);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <div className={styles.userManage}>
      <div className={styles.header}>
        <h2>Quản lý Người dùng</h2>
        <div className={styles.headerRight}>
          <div className={styles.searchBar}>
            <input type="text" placeholder="Tìm theo tên, email..." />
            <button><MdSearch /></button>
          </div>
          <button className={styles.addBtn} onClick={handleOpenModal}>
            <MdAdd /> Thêm Tài khoản
          </button>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td><strong>{user.name}</strong></td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>
                  <span className={`${styles.roleBadge} ${user.role === 'Quản trị viên' ? styles.roleAdmin : styles.roleUser}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={`${styles.statusBadge} ${user.status === 'Hoạt động' ? styles.statusActive : styles.statusLocked}`}>
                    {user.status}
                  </span>
                </td>
                <td>
                  <div className={styles.actionBtns}>
                    <button className={styles.editBtn} title="Chỉnh sửa"><MdEdit /></button>
                    <button className={styles.deleteBtn} title="Khóa/Xóa tài khoản"><MdDelete /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Thêm Tài khoản mới</h3>
              <button className={styles.closeBtn} onClick={handleCloseModal}><MdClose /></button>
            </div>
            
            <div className={styles.modalBody}>
              <form className={styles.form}>
                <div className={styles.formGroup}>
                  <label>Họ và tên</label>
                  <input type="text" placeholder="Nhập họ tên" />
                </div>
                <div className={styles.formGroup}>
                  <label>Email</label>
                  <input type="email" placeholder="example@gmail.com" />
                </div>
                <div className={styles.formGroup}>
                  <label>Mật khẩu tạm thời</label>
                  <input type="password" placeholder="Nhập mật khẩu" />
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Số điện thoại</label>
                    <input type="text" placeholder="Nhập SĐT" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Vai trò</label>
                    <select>
                      <option>Khách hàng</option>
                      <option>Quản trị viên</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={handleCloseModal}>Hủy</button>
              <button className={styles.saveBtn} onClick={handleCloseModal}>Lưu Tài khoản</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagePage;
