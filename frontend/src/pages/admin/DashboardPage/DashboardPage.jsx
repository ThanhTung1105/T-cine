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
  const [cinemaRevenues, setCinemaRevenues] = useState([]);
  const [ticketStats, setTicketStats] = useState(null);
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

      const [revenueRes, movieRes, cinemaRes, ticketRes] = await Promise.all([
        axiosClient.get('/admin/revenue', { params }),
        axiosClient.get('/admin/revenue/by-movie', { params }),
        axiosClient.get('/admin/revenue/by-cinema', { params }),
        axiosClient.get('/admin/stats/tickets', { params }),
      ]);

      const data = revenueRes.data || [];
      setRevenueData(data);
      setMovieRevenues(movieRes.data || []);
      setCinemaRevenues(cinemaRes.data || []);
      setTicketStats(ticketRes.data || null);
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

      {/* Doanh thu theo phim */}
      <div className={styles.tableSection}>
        <div className={styles.sectionHeader}>
          <h3>Top phim theo doanh thu {hasDateFilter && <span className={styles.tagFilter}>(đã lọc)</span>}</h3>
        </div>
        <div className={styles.tableResponsive}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th style={{ width: 80 }}>Hạng</th>
                <th>Tên Phim Phổ Biến</th>
                <th style={{ width: 150 }}>Số đơn đặt thành công</th>
                <th>Tổng Doanh Thu Phim</th>
              </tr>
            </thead>
            <tbody>
              {movieRevenues.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#aaa' }}>
                    Chưa có dữ liệu doanh thu phim
                  </td>
                </tr>
              ) : movieRevenues.slice(0, 10).map((movie, index) => (
                <tr key={movie.id}>
                  <td><strong>#{index + 1}</strong></td>
                  <td><strong>{movie.title}</strong></td>
                  <td>{movie.booking_count} đơn</td>
                  <td className={styles.revenueText}>{formatVND(movie.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cấu trúc 2 cột mới cho Thống kê Rạp và Loại Ghế */}
      <div className={styles.statsTwoCol}>
        {/* Cột trái: Thống kê doanh thu theo cụm rạp */}
        <div className={styles.statsBox}>
          <div className={styles.sectionHeader}>
            <h3>Xếp hạng doanh thu theo Cụm rạp {hasDateFilter && <span className={styles.tagFilter}>(đã lọc)</span>}</h3>
          </div>
          {cinemaRevenues.length === 0 ? (
            <p className={styles.emptyText}>Chưa có dữ liệu doanh thu rạp</p>
          ) : (
            <div className={styles.leaderboardList}>
              {cinemaRevenues.map((cinema, idx) => {
                const percent = totalRevenue > 0 
                  ? Math.min(100, Math.round((Number(cinema.revenue) / totalRevenue) * 100)) 
                  : 0;
                return (
                  <div key={cinema.id} className={styles.leaderboardItem}>
                    <div className={styles.itemMeta}>
                      <span className={styles.rank}>#{idx + 1}</span>
                      <span className={styles.name}>{cinema.name}</span>
                      <span className={styles.value}>{formatVND(cinema.revenue)} ({cinema.booking_count} đơn)</span>
                    </div>
                    <div className={styles.progressBarContainer}>
                      <div 
                        className={styles.progressBar} 
                        style={{ width: `${percent}%`, backgroundColor: '#3b82f6' }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Cột phải: Tỷ lệ vé bán theo loại ghế */}
        <div className={styles.statsBox}>
          <div className={styles.sectionHeader}>
            <h3>Tỷ lệ vé bán ra theo Loại ghế {hasDateFilter && <span className={styles.tagFilter}>(đã lọc)</span>}</h3>
          </div>
          {!ticketStats || !ticketStats.by_type || ticketStats.by_type.length === 0 ? (
            <p className={styles.emptyText}>Chưa có dữ liệu vé bán</p>
          ) : (
            <div className={styles.seatTypeList}>
              {(() => {
                const totalTickets = ticketStats.total_tickets || 0;
                const typeLabelMap = {
                  normal: { name: 'Ghế thường (Standard)', color: '#10b981' },
                  vip: { name: 'Ghế VIP', color: '#f59e0b' },
                  couple: { name: 'Ghế đôi (Couple)', color: '#ef4444' }
                };
                
                return ticketStats.by_type.map((typeStat) => {
                  const labelMeta = typeLabelMap[typeStat.seat_type] || { name: typeStat.seat_type, color: '#9ca3af' };
                  const percent = totalTickets > 0 
                    ? Math.min(100, Math.round((typeStat.count / totalTickets) * 100)) 
                    : 0;
                  return (
                    <div key={typeStat.seat_type} className={styles.seatTypeItem}>
                      <div className={styles.itemMeta}>
                        <span className={styles.dot} style={{ backgroundColor: labelMeta.color }}></span>
                        <span className={styles.name}>{labelMeta.name}</span>
                        <span className={styles.value}>{typeStat.count} vé ({percent}%)</span>
                      </div>
                      <div className={styles.progressBarContainer}>
                        <div 
                          className={styles.progressBar} 
                          style={{ width: `${percent}%`, backgroundColor: labelMeta.color }}
                        ></div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
