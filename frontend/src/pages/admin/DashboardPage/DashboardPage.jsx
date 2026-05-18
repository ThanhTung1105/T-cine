import React, { useState, useEffect } from 'react';
import {
  MdAttachMoney, MdLocalActivity, MdMovie, MdTheaters,
  MdReceipt, MdTrendingUp,
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../../api/axiosClient';
import styles from './DashboardPage.module.scss';

const statusMap = { pending: 'Chờ thanh toán', paid: 'Đã thanh toán', cancelled: 'Đã hủy' };

const formatVND = (v) => `${Number(v || 0).toLocaleString('vi-VN')} VNĐ`;

const DashboardPage = () => {
  const navigate = useNavigate();

  // Global stats
  const [dashboardData, setDashboardData] = useState(null);

  // Revenue (theo khoảng ngày)
  const [revenueData, setRevenueData] = useState([]);
  const [movieRevenues, setMovieRevenues] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [loadingRevenue, setLoadingRevenue] = useState(true);

  const fetchDashboard = async () => {
    setLoadingDashboard(true);
    try {
      const res = await axiosClient.get('/admin/dashboard');
      setDashboardData(res.data);
    } catch (e) { console.error(e); }
    finally { setLoadingDashboard(false); }
  };

  const fetchRevenue = async () => {
    setLoadingRevenue(true);
    try {
      const params = {};
      if (dateFrom) params.from = dateFrom;
      if (dateTo) params.to = dateTo;

      const [revenueRes, movieRes] = await Promise.all([
        axiosClient.get('/admin/revenue', { params }),
        axiosClient.get('/admin/revenue/by-movie', { params }),
      ]);

      const data = revenueRes.data || [];
      setRevenueData(data);
      setMovieRevenues(movieRes.data || []);
      setTotalRevenue(data.reduce((sum, d) => sum + Number(d.revenue || 0), 0));
      setTotalBookings(data.reduce((sum, d) => sum + Number(d.count || 0), 0));
    } catch (e) { console.error(e); }
    finally { setLoadingRevenue(false); }
  };

  useEffect(() => {
    fetchDashboard();
    fetchRevenue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = () => fetchRevenue();

  const handleReset = () => {
    setDateFrom('');
    setDateTo('');
    setTimeout(fetchRevenue, 0);
  };

  if (loadingDashboard) {
    return <div style={{ textAlign: 'center', padding: '60px', color: '#aaa' }}>Đang tải dữ liệu...</div>;
  }
  if (!dashboardData) {
    return <div style={{ textAlign: 'center', padding: '60px', color: '#aaa' }}>Không thể tải dữ liệu Tổng quan.</div>;
  }

  const hasDateFilter = dateFrom || dateTo;

  // Stats cards — kết hợp dashboard + revenue
  const stats = [
    {
      title: hasDateFilter ? 'Doanh thu (đã lọc)' : 'Tổng doanh thu',
      value: formatVND(hasDateFilter ? totalRevenue : dashboardData.total_revenue || 0),
      icon: <MdAttachMoney />,
      color: '#10b981',
    },
    {
      title: hasDateFilter ? 'Đơn hàng (đã lọc)' : 'Tổng đơn đã thanh toán',
      value: hasDateFilter ? `${totalBookings} đơn` : `${dashboardData.total_paid_bookings ?? totalBookings} đơn`,
      icon: <MdReceipt />,
      color: '#3b82f6',
    },
    {
      title: 'Đơn chờ xử lý',
      value: dashboardData.pending_bookings || 0,
      icon: <MdLocalActivity />,
      color: '#f59e0b',
    },
    {
      title: 'Tổng số phim',
      value: dashboardData.total_movies || 0,
      icon: <MdMovie />,
      color: '#8b5cf6',
    },
    {
      title: 'Tổng số rạp',
      value: dashboardData.total_cinemas || 0,
      icon: <MdTheaters />,
      color: '#ec4899',
    },
    {
      title: 'Doanh thu TB/Đơn',
      value: formatVND(totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0),
      icon: <MdTrendingUp />,
      color: '#06b6d4',
    },
  ];

  const maxRevenue = Math.max(...revenueData.map(d => Number(d.revenue)), 1);
  const chartData = revenueData.slice(-14); // 14 ngày gần nhất

  return (
    <div className={styles.dashboard}>
      {/* Header + filter ngày (cho phần doanh thu) */}
      <div className={styles.pageHeader}>
        <div>
          <h2>Tổng quan</h2>
          <p className={styles.subtitle}>Thống kê hoạt động & doanh thu của hệ thống T-CINE</p>
        </div>
        <div className={styles.filterBox}>
          <label className={styles.filterLabel}>Lọc doanh thu:</label>
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className={styles.dateInput}
          />
          <span className={styles.dash}>→</span>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className={styles.dateInput}
          />
          <button className={styles.filterBtn} onClick={handleFilter} disabled={loadingRevenue}>
            {loadingRevenue ? 'Đang lọc...' : 'Lọc'}
          </button>
          {hasDateFilter && (
            <button className={styles.resetBtn} onClick={handleReset}>Bỏ lọc</button>
          )}
        </div>
      </div>

      {/* Stats cards */}
      <div className={styles.statsGrid}>
        {stats.map((stat, index) => (
          <div key={index} className={styles.statCard}>
            <div
              className={styles.statIcon}
              style={{ backgroundColor: `${stat.color}20`, color: stat.color }}
            >
              {stat.icon}
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statTitle}>{stat.title}</span>
              <span className={styles.statValue}>{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Biểu đồ doanh thu theo ngày */}
      <div className={styles.chartSection}>
        <div className={styles.sectionHeader}>
          <h3>Biểu đồ doanh thu theo ngày {hasDateFilter && <span className={styles.tagFilter}>(đã lọc)</span>}</h3>
          <span className={styles.note}>{chartData.length > 0 ? `${chartData.length} ngày gần nhất` : ''}</span>
        </div>
        {loadingRevenue ? (
          <p style={{ textAlign: 'center', padding: '60px', color: '#aaa' }}>Đang tải...</p>
        ) : chartData.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '60px', color: '#aaa' }}>Chưa có dữ liệu doanh thu</p>
        ) : (
          <div className={styles.chartMock}>
            {chartData.map((d, i) => (
              <div key={i} className={styles.barContainer}>
                <div
                  className={styles.bar}
                  style={{ height: `${(Number(d.revenue) / maxRevenue) * 100}%` }}
                  title={`${new Date(d.date).toLocaleDateString('vi-VN')}: ${formatVND(d.revenue)}`}
                ></div>
                <span>{new Date(d.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Layout 2 cột: Doanh thu theo phim | Đơn đặt vé gần đây */}
      <div className={styles.twoCol}>
        {/* Doanh thu theo phim */}
        <div className={styles.tableSection}>
          <div className={styles.sectionHeader}>
            <h3>Top phim theo doanh thu</h3>
          </div>
          <div className={styles.tableResponsive}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th style={{ width: 60 }}>Top</th>
                  <th>Tên Phim</th>
                  <th style={{ width: 80 }}>Số đơn</th>
                  <th>Doanh thu</th>
                </tr>
              </thead>
              <tbody>
                {movieRevenues.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#aaa' }}>
                      Chưa có dữ liệu
                    </td>
                  </tr>
                ) : movieRevenues.slice(0, 8).map((movie, index) => (
                  <tr key={movie.id}>
                    <td><strong>#{index + 1}</strong></td>
                    <td><strong>{movie.title}</strong></td>
                    <td>{movie.booking_count}</td>
                    <td className={styles.revenueText}>{formatVND(movie.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Đơn đặt vé gần đây */}
        <div className={styles.tableSection}>
          <div className={styles.sectionHeader}>
            <h3>Đơn đặt vé gần đây</h3>
            <button className={styles.viewAllBtn} onClick={() => navigate('/admin/don-hang')}>
              Xem tất cả
            </button>
          </div>
          <div className={styles.tableResponsive}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Phim</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {(dashboardData.recent_bookings || []).length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#aaa' }}>
                      Chưa có đơn hàng
                    </td>
                  </tr>
                ) : dashboardData.recent_bookings.map((order) => (
                  <tr key={order.id}>
                    <td><strong>{order.booking_code}</strong></td>
                    <td>{order.user?.name || 'N/A'}</td>
                    <td>{order.showtime?.movie?.title || 'N/A'}</td>
                    <td>{formatVND(order.final_amount)}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${order.status === 'paid' ? styles.statusSuccess : order.status === 'cancelled' ? styles.statusCancelled : styles.statusPending}`}>
                        {statusMap[order.status] || order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
