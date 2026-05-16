import React, { useState } from 'react';
import { MdVisibility, MdSearch, MdClose } from 'react-icons/md';
import styles from './OrderManagePage.module.scss';

const OrderManagePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [orders] = useState([
    { id: 'TC123456', user: 'Nguyễn Văn A', movie: 'Mai', showtime: '14:40 - 05/05/2026', seats: 'E8, F7, F8', combos: '1 x Combo 2 Big', total: '190.000', status: 'Thành công', date: '04/05/2026 10:15' },
    { id: 'TC123457', user: 'Trần Thị B', movie: 'Đào, Phở và Piano', showtime: '18:30 - 05/05/2026', seats: 'A1', combos: 'Không', total: '85.000', status: 'Thành công', date: '04/05/2026 11:20' },
    { id: 'TC123458', user: 'Lê Văn C', movie: 'Kung Fu Panda 4', showtime: '20:00 - 06/05/2026', seats: 'G9, G10', combos: '2 x Combo 1 Big', total: '270.000', status: 'Đã hủy', date: '04/05/2026 14:05' },
  ]);

  const handleOpenModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <div className={styles.orderManage}>
      <div className={styles.header}>
        <h2>Quản lý Đơn hàng (Vé)</h2>
        <div className={styles.searchBar}>
          <input type="text" placeholder="Tìm mã đơn hàng..." />
          <button><MdSearch /></button>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Phim</th>
              <th>Suất chiếu</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td><strong>{order.id}</strong></td>
                <td>{order.user}</td>
                <td>{order.movie}</td>
                <td>{order.showtime}</td>
                <td>{order.total} VNĐ</td>
                <td>
                  <span className={`${styles.statusBadge} ${order.status === 'Thành công' ? styles.statusSuccess : styles.statusCancel}`}>
                    {order.status}
                  </span>
                </td>
                <td>
                  <button className={styles.viewBtn} title="Xem chi tiết" onClick={() => handleOpenModal(order)}>
                    <MdVisibility />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && selectedOrder && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Chi tiết Đơn hàng: {selectedOrder.id}</h3>
              <button className={styles.closeBtn} onClick={handleCloseModal}><MdClose /></button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.detailRow}>
                <span className={styles.label}>Ngày đặt:</span>
                <span className={styles.value}>{selectedOrder.date}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.label}>Khách hàng:</span>
                <span className={styles.value}>{selectedOrder.user}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.label}>Phim:</span>
                <span className={styles.value}><strong>{selectedOrder.movie}</strong></span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.label}>Suất chiếu:</span>
                <span className={styles.value}>{selectedOrder.showtime}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.label}>Ghế đã chọn:</span>
                <span className={styles.value}>{selectedOrder.seats}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.label}>Bắp nước (Combo):</span>
                <span className={styles.value}>{selectedOrder.combos}</span>
              </div>
              <div className={styles.divider}></div>
              <div className={styles.detailRow}>
                <span className={styles.label}>Tổng tiền thanh toán:</span>
                <span className={styles.totalValue}>{selectedOrder.total} VNĐ</span>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={handleCloseModal}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagePage;
