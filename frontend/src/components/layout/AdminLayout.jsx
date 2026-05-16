import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar/Sidebar';
import AdminHeader from './AdminHeader/AdminHeader';
import styles from './AdminLayout.module.scss';

/**
 * AdminLayout — Layout chung cho trang quản trị
 * Bao gồm: Sidebar + Header + Nội dung
 */
const AdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={styles.adminLayout}>
      <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      
      <div className={styles.adminMain}>
        <AdminHeader />
        
        <main className={styles.adminContent}>
          <div className={styles.container}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
