import React, { useState, useEffect } from 'react';
import { MdVisibility, MdSearch, MdClose, MdCheckCircle, MdCancel } from 'react-icons/md';
import axiosClient from '../../../api/axiosClient';
import styles from './OrderManagePage.module.scss';

const statusMap = { pending: 'Chờ thanh toán', paid: 'Đã thanh toán', cancelled: 'Đã hủy' };

const OrderManagePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/admin/bookings', { params: { per_page: 50 } });
      setOrders(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleOpenModal = (order) => { setSelectedOrder(order); setIsModalOpen(true); };
  const handleCloseModal = () => setIsModalOpen(false);

  const handleUpdateStatus = async (id, status) => {
    if (!window.confirm(`Bạn muốn chuyển trạng thái sang "${statusMap[status]}"?`)) return;
    try {
      await axiosClient.put(`/admin/bookings/${id}/status`, { status });
      fetchOrders();
      if (isModalOpen) handleCloseModal();
    } catch (e) { alert('Cập nhật thất bại!'); }
  };

  const filteredOrders = orders.filter(o =>
    (o.booking_code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.orderManage}>
      <div className={styles.header}>
        <h2>Quản lý Đơn hàng (Vé)</h2>
        <div className={styles.searchBar}>
          <input type="text" placeholder="Tìm mã đơn, tên khách..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          <button><MdSearch /></button>
        </div>
      </div>

      <div className={styles.tableContainer}>
        {loading ? <p style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>Đang tải...</p> : (
          <table className={styles.table}>
            <thead><tr><th>Mã đơn</th><th>Khách hàng</th><th>Phim</th><th>Tổng tiền</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#aaa' }}>Không có đơn hàng</td></tr>
              ) : filteredOrders.map(order => (
                <tr key={order.id}>
                  <td><strong>{order.booking_code}</strong></td>
                  <td>{order.user?.name || 'N/A'}</td>
                  <td>{order.showtime?.movie?.title || 'N/A'}</td>
                  <td>{Number(order.final_amount).toLocaleString('vi-VN')} VNĐ</td>
                  <td>
                    <span className={`${styles.statusBadge} ${order.status === 'paid' ? styles.statusSuccess : order.status === 'cancelled' ? styles.statusCancel : styles.statusPending}`}>
                      {statusMap[order.status] || order.status}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionBtns || styles.viewBtn}>
                      <button className={styles.viewBtn} title="Xem chi tiết" onClick={() => handleOpenModal(order)}><MdVisibility /></button>
                      {order.status === 'pending' && (
                        <>
                          <button style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 6px', cursor: 'pointer', marginLeft: 4 }} title="Xác nhận thanh toán" onClick={() => handleUpdateStatus(order.id, 'paid')}><MdCheckCircle /></button>
                          <button style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 6px', cursor: 'pointer', marginLeft: 4 }} title="Hủy đơn" onClick={() => handleUpdateStatus(order.id, 'cancelled')}><MdCancel /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && selectedOrder && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Chi tiết Đơn hàng: {selectedOrder.booking_code}</h3>
              <button className={styles.closeBtn} onClick={handleCloseModal}><MdClose /></button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailRow}><span className={styles.label}>Ngày đặt:</span><span className={styles.value}>{new Date(selectedOrder.created_at).toLocaleString('vi-VN')}</span></div>
              <div className={styles.detailRow}><span className={styles.label}>Khách hàng:</span><span className={styles.value}>{selectedOrder.user?.name} ({selectedOrder.user?.email})</span></div>
              <div className={styles.detailRow}><span className={styles.label}>Phim:</span><span className={styles.value}><strong>{selectedOrder.showtime?.movie?.title}</strong></span></div>
              <div className={styles.detailRow}><span className={styles.label}>Rạp:</span><span className={styles.value}>{selectedOrder.showtime?.room?.cinema?.name} - {selectedOrder.showtime?.room?.name}</span></div>
              <div className={styles.detailRow}><span className={styles.label}>Suất chiếu:</span><span className={styles.value}>{selectedOrder.showtime?.start_time ? new Date(selectedOrder.showtime.start_time).toLocaleString('vi-VN') : 'N/A'}</span></div>
              <div className={styles.detailRow}><span className={styles.label}>Ghế:</span><span className={styles.value}>{selectedOrder.tickets?.map(t => t.seat_label).join(', ') || 'N/A'}</span></div>
              <div className={styles.detailRow}><span className={styles.label}>Combo:</span><span className={styles.value}>{selectedOrder.booking_combos?.length > 0 ? selectedOrder.booking_combos.map(bc => `${bc.quantity}x ${bc.combo?.name}`).join(', ') : 'Không'}</span></div>
              <div className={styles.divider}></div>
              <div className={styles.detailRow}><span className={styles.label}>Tổng tiền:</span><span className={styles.totalValue}>{Number(selectedOrder.final_amount).toLocaleString('vi-VN')} VNĐ</span></div>
              <div className={styles.detailRow}><span className={styles.label}>Trạng thái:</span><span className={styles.value}>{statusMap[selectedOrder.status]}</span></div>
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
