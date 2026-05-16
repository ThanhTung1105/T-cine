import React from 'react';
import { MdAttachMoney, MdLocalActivity, MdMovie, MdTheaters } from 'react-icons/md';
import styles from './DashboardPage.module.scss';

const DashboardPage = () => {
  // Mock data cho thống kê
  const stats = [
    { title: 'Tổng doanh thu', value: '124.500.000 VNĐ', icon: <MdAttachMoney />, color: '#10b981' },
    { title: 'Số vé bán ra', value: '1,245', icon: <MdLocalActivity />, color: '#3b82f6' },
    { title: 'Phim đang chiếu', value: '12', icon: <MdMovie />, color: '#8b5cf6' },
    { title: 'Tổng số rạp', value: '5', icon: <MdTheaters />, color: '#f59e0b' },
  ];

  // Mock data cho đơn hàng gần đây
  const recentOrders = [
    { id: 'TC123456', user: 'Nguyễn Văn A', movie: 'Mai', tickets: 2, total: '190.000', status: 'Đã thanh toán' },
    { id: 'TC123457', user: 'Trần Thị B', movie: 'Đào, Phở và Piano', tickets: 1, total: '85.000', status: 'Đã thanh toán' },
    { id: 'TC123458', user: 'Lê Văn C', movie: 'Kung Fu Panda 4', tickets: 3, total: '270.000', status: 'Đang xử lý' },
    { id: 'TC123459', user: 'Phạm Thị D', movie: 'Mai', tickets: 4, total: '380.000', status: 'Đã thanh toán' },
  ];

  return (
    <div className={styles.dashboard}>
      <div className={styles.statsGrid}>
        {stats.map((stat, index) => (
          <div key={index} className={styles.statCard}>
            <div className={styles.statIcon} style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
              {stat.icon}
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statTitle}>{stat.title}</span>
              <span className={styles.statValue}>{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.recentOrdersSection}>
        <div className={styles.sectionHeader}>
          <h3>Đơn đặt vé gần đây</h3>
          <button className={styles.viewAllBtn}>Xem tất cả</button>
        </div>
        
        <div className={styles.tableResponsive}>
          <table className={styles.ordersTable}>
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Phim</th>
                <th>Số vé</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order, index) => (
                <tr key={index}>
                  <td><strong>{order.id}</strong></td>
                  <td>{order.user}</td>
                  <td>{order.movie}</td>
                  <td>{order.tickets}</td>
                  <td>{order.total} VNĐ</td>
                  <td>
                    <span className={`${styles.statusBadge} ${order.status === 'Đã thanh toán' ? styles.statusSuccess : styles.statusPending}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
