import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  MdDashboard, 
  MdMovie, 
  MdTheaters, 
  MdEventSeat,
  MdCalendarToday,
  MdReceipt, 
  MdPeople, 
  MdAttachMoney,
  MdMenu,
  MdChevronLeft
} from 'react-icons/md';
import styles from './Sidebar.module.scss';

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
  const menuItems = [
    { path: '/admin', name: 'Tổng quan', icon: <MdDashboard /> },
    { path: '/admin/phim', name: 'Quản lý Phim', icon: <MdMovie /> },
    { path: '/admin/rap', name: 'Quản lý Rạp', icon: <MdTheaters /> },
    { path: '/admin/phong-chieu', name: 'Phòng chiếu', icon: <MdEventSeat /> },
    { path: '/admin/lich-chieu', name: 'Lịch chiếu', icon: <MdCalendarToday /> },
    { path: '/admin/don-hang', name: 'Đơn hàng', icon: <MdReceipt /> },
    { path: '/admin/nguoi-dung', name: 'Người dùng', icon: <MdPeople /> },
    { path: '/admin/doanh-thu', name: 'Doanh thu', icon: <MdAttachMoney /> },
  ];

  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
      <div className={styles.logoSection}>
        {!isCollapsed && (
          <Link to="/" className={styles.logo}>
            <span className={styles.textPrimary}>T</span>-CINE
          </Link>
        )}
        <button className={styles.toggleBtn} onClick={toggleSidebar}>
          {isCollapsed ? <MdMenu /> : <MdChevronLeft />}
        </button>
      </div>

      <nav className={styles.menu}>
        <ul>
          {menuItems.map((item, index) => (
            <li key={index}>
              <NavLink 
                to={item.path} 
                end={item.path === '/admin'}
                className={({ isActive }) => isActive ? styles.active : ''}
              >
                <span className={styles.icon}>{item.icon}</span>
                {!isCollapsed && <span className={styles.name}>{item.name}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
