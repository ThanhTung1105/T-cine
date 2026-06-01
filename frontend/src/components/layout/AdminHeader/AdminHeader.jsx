import React, { useState } from 'react';
import { MdNotifications, MdAccountCircle, MdLogout } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../../store/useAuthStore';
import { notify } from '../../../utils/notify';
import styles from './AdminHeader.module.scss';

const AdminHeader = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    notify.success('Đăng xuất thành công!', 'Tạm biệt');
    setTimeout(() => navigate('/dang-nhap'), 1500);
  };

  return (
    <>
    <header className={styles.header}>
      <div className={styles.left}>
        <h2 className={styles.pageTitle}>Dashboard</h2>
      </div>
      
      <div className={styles.right}>
        <button className={styles.iconBtn}>
          <MdNotifications />
          <span className={styles.badge}>3</span>
        </button>
        
        <div className={styles.userInfo}>
          <img src={user?.avatar || 'https://ui-avatars.com/api/?name=Admin'} alt="Avatar" className={styles.avatarImg} />
          <div className={styles.details}>
            <span className={styles.name}>{user?.name || 'Admin'}</span>
            <span className={styles.role}>Quản trị viên</span>
          </div>
        </div>
        
        <button className={styles.logoutBtn} title="Đăng xuất" onClick={handleLogout}>
          <MdLogout />
        </button>
      </div>
    </header>

    </>
  );
};

export default AdminHeader;
