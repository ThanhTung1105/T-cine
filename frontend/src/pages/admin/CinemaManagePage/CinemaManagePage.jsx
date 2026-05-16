import React, { useState } from 'react';
import { MdAdd, MdEdit, MdDelete, MdClose } from 'react-icons/md';
import styles from './CinemaManagePage.module.scss';

const CinemaManagePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cinemas] = useState([
    { id: 1, name: 'T-CINE Landmark 81', address: 'Vincom Center Landmark 81, Quận Bình Thạnh, TP.HCM', rooms: 6, status: 'Hoạt động' },
    { id: 2, name: 'T-CINE Giga Mall', address: 'TTTM Giga Mall, Phạm Văn Đồng, TP. Thủ Đức', rooms: 5, status: 'Hoạt động' },
    { id: 3, name: 'T-CINE Aeon Tân Phú', address: 'Aeon Mall Tân Phú Celadon, Tân Phú, TP.HCM', rooms: 8, status: 'Bảo trì' },
  ]);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <div className={styles.cinemaManage}>
      <div className={styles.header}>
        <h2>Quản lý Rạp Chiếu Phim</h2>
        <button className={styles.addBtn} onClick={handleOpenModal}>
          <MdAdd /> Thêm Rạp Mới
        </button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Tên Rạp</th>
              <th>Địa chỉ</th>
              <th>Số phòng chiếu</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {cinemas.map(cinema => (
              <tr key={cinema.id}>
                <td><strong>{cinema.name}</strong></td>
                <td>{cinema.address}</td>
                <td>{cinema.rooms} phòng</td>
                <td>
                  <span className={`${styles.statusBadge} ${cinema.status === 'Hoạt động' ? styles.statusActive : styles.statusMaintenance}`}>
                    {cinema.status}
                  </span>
                </td>
                <td>
                  <div className={styles.actionBtns}>
                    <button className={styles.editBtn} title="Sửa"><MdEdit /></button>
                    <button className={styles.deleteBtn} title="Xóa"><MdDelete /></button>
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
              <h3>Thêm Rạp Mới</h3>
              <button className={styles.closeBtn} onClick={handleCloseModal}><MdClose /></button>
            </div>
            
            <div className={styles.modalBody}>
              <form className={styles.form}>
                <div className={styles.formGroup}>
                  <label>Tên Rạp</label>
                  <input type="text" placeholder="VD: T-CINE Landmark 81" />
                </div>

                <div className={styles.formGroup}>
                  <label>Địa chỉ chi tiết</label>
                  <textarea rows="2" placeholder="Nhập địa chỉ đầy đủ của rạp"></textarea>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Hotline</label>
                    <input type="text" placeholder="1900 xxxx" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Trạng thái</label>
                    <select>
                      <option>Hoạt động</option>
                      <option>Bảo trì</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={handleCloseModal}>Hủy</button>
              <button className={styles.saveBtn} onClick={handleCloseModal}>Lưu Rạp</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CinemaManagePage;
