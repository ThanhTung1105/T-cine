import React, { useState } from 'react';
import { MdAdd, MdEdit, MdDelete, MdClose } from 'react-icons/md';
import styles from './ShowtimeManagePage.module.scss';

const ShowtimeManagePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showtimes] = useState([
    { id: 1, movie: 'Mai', cinema: 'T-CINE Landmark 81', room: 'Phòng 1 (Standard)', date: '05/05/2026', time: '14:40', price: '90,000' },
    { id: 2, movie: 'Đào, Phở và Piano', cinema: 'T-CINE Giga Mall', room: 'Phòng 2 (VIP)', date: '05/05/2026', time: '18:30', price: '120,000' },
    { id: 3, movie: 'Kung Fu Panda 4', cinema: 'T-CINE Aeon Tân Phú', room: 'Phòng 5 (IMAX)', date: '06/05/2026', time: '20:00', price: '150,000' },
  ]);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <div className={styles.showtimeManage}>
      <div className={styles.header}>
        <h2>Quản lý Lịch chiếu</h2>
        <button className={styles.addBtn} onClick={handleOpenModal}>
          <MdAdd /> Thêm Lịch chiếu
        </button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Phim</th>
              <th>Rạp</th>
              <th>Phòng chiếu</th>
              <th>Ngày chiếu</th>
              <th>Giờ chiếu</th>
              <th>Giá vé mặc định</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {showtimes.map(st => (
              <tr key={st.id}>
                <td><strong>{st.movie}</strong></td>
                <td>{st.cinema}</td>
                <td>{st.room}</td>
                <td>{st.date}</td>
                <td><span className={styles.timeTag}>{st.time}</span></td>
                <td>{st.price} VNĐ</td>
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
              <h3>Thêm Lịch chiếu mới</h3>
              <button className={styles.closeBtn} onClick={handleCloseModal}><MdClose /></button>
            </div>
            
            <div className={styles.modalBody}>
              <form className={styles.form}>
                <div className={styles.formGroup}>
                  <label>Chọn Phim</label>
                  <select>
                    <option value="">-- Lựa chọn Phim --</option>
                    <option>Mai</option>
                    <option>Đào, Phở và Piano</option>
                    <option>Kung Fu Panda 4</option>
                  </select>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Chọn Rạp</label>
                    <select>
                      <option value="">-- Lựa chọn Rạp --</option>
                      <option>T-CINE Landmark 81</option>
                      <option>T-CINE Giga Mall</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Phòng chiếu</label>
                    <select>
                      <option value="">-- Lựa chọn Phòng --</option>
                      <option>Phòng 1 (Standard)</option>
                      <option>Phòng 2 (VIP)</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Ngày chiếu</label>
                    <input type="date" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Giờ chiếu</label>
                    <input type="time" />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Giá vé mặc định (VNĐ)</label>
                  <input type="number" placeholder="90000" />
                  <small className={styles.helperText}>Giá vé cho ghế thường. Ghế VIP/Couple sẽ tự tính theo hệ số.</small>
                </div>
              </form>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={handleCloseModal}>Hủy</button>
              <button className={styles.saveBtn} onClick={handleCloseModal}>Lưu Lịch chiếu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowtimeManagePage;
