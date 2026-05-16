import React, { useState } from 'react';
import { MdFilterList, MdDownload } from 'react-icons/md';
import styles from './RevenuePage.module.scss';

const RevenuePage = () => {
  const [filterDate, setFilterDate] = useState('month');

  // Mock data doanh thu theo phim
  const [movieRevenues] = useState([
    { id: 1, title: 'Mai', tickets: 12500, revenue: '1.250.000.000' },
    { id: 2, title: 'Đào, Phở và Piano', tickets: 8200, revenue: '820.000.000' },
    { id: 3, title: 'Kung Fu Panda 4', tickets: 5400, revenue: '540.000.000' },
    { id: 4, title: 'Dune: Hành Tinh Cát - Phần 2', tickets: 3100, revenue: '310.000.000' },
  ]);

  return (
    <div className={styles.revenuePage}>
      <div className={styles.header}>
        <h2>Báo cáo Doanh thu</h2>
        <div className={styles.actions}>
          <select value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className={styles.filterSelect}>
            <option value="today">Hôm nay</option>
            <option value="week">Tuần này</option>
            <option value="month">Tháng này</option>
            <option value="year">Năm nay</option>
          </select>
          <button className={styles.exportBtn}>
            <MdDownload /> Xuất báo cáo
          </button>
        </div>
      </div>

      <div className={styles.summaryCards}>
        <div className={styles.card}>
          <h4>Tổng Doanh Thu</h4>
          <div className={styles.value}>2.920.000.000 VNĐ</div>
          <div className={styles.trend}>+15% so với kỳ trước</div>
        </div>
        <div className={styles.card}>
          <h4>Tổng Vé Bán Ra</h4>
          <div className={styles.value}>29,200 vé</div>
          <div className={styles.trend}>+8% so với kỳ trước</div>
        </div>
        <div className={styles.card}>
          <h4>Doanh thu Bắp/Nước</h4>
          <div className={styles.value}>450.000.000 VNĐ</div>
          <div className={styles.trend}>+12% so với kỳ trước</div>
        </div>
      </div>

      <div className={styles.chartSection}>
        <div className={styles.sectionHeader}>
          <h3>Biểu đồ doanh thu (Mô phỏng)</h3>
        </div>
        <div className={styles.chartMock}>
          <div className={styles.barContainer}>
            <div className={styles.bar} style={{ height: '60%' }} title="T2"></div>
            <span>T2</span>
          </div>
          <div className={styles.barContainer}>
            <div className={styles.bar} style={{ height: '40%' }} title="T3"></div>
            <span>T3</span>
          </div>
          <div className={styles.barContainer}>
            <div className={styles.bar} style={{ height: '80%' }} title="T4"></div>
            <span>T4</span>
          </div>
          <div className={styles.barContainer}>
            <div className={styles.bar} style={{ height: '100%' }} title="T5"></div>
            <span>T5</span>
          </div>
          <div className={styles.barContainer}>
            <div className={styles.bar} style={{ height: '70%' }} title="T6"></div>
            <span>T6</span>
          </div>
          <div className={styles.barContainer}>
            <div className={styles.bar} style={{ height: '90%' }} title="T7"></div>
            <span>T7</span>
          </div>
          <div className={styles.barContainer}>
            <div className={styles.bar} style={{ height: '85%' }} title="CN"></div>
            <span>CN</span>
          </div>
        </div>
      </div>

      <div className={styles.tableSection}>
        <div className={styles.sectionHeader}>
          <h3>Doanh thu theo Phim</h3>
        </div>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Top</th>
                <th>Tên Phim</th>
                <th>Số vé bán</th>
                <th>Tổng doanh thu (VNĐ)</th>
              </tr>
            </thead>
            <tbody>
              {movieRevenues.map((movie, index) => (
                <tr key={movie.id}>
                  <td><strong>#{index + 1}</strong></td>
                  <td><strong>{movie.title}</strong></td>
                  <td>{movie.tickets.toLocaleString()}</td>
                  <td className={styles.revenueText}>{movie.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RevenuePage;
