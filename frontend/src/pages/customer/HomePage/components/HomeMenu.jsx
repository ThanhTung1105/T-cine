import React from 'react';
import { Link } from 'react-router-dom';
import styles from './HomeMenu.module.scss';

const HomeMenu = () => {
  const menuItems = [
    { title: 'PHIM ĐANG CHIẾU', link: '#' },
    { title: 'ĐẶC TRƯNG T-CINE', link: '#' },
    { title: 'THUÊ RẠP & VÉ NHÓM', link: '#' },
    { title: 'LIÊN HỆ T-CINE', link: '#' },
    { title: 'TIN MỚI & ƯU ĐÃI', link: '#' },
  ];

  return (
    <div className={styles.homeMenuWrapper}>
      <div className={styles.container}>
        <div className={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <Link to={item.link} key={index} className={styles.menuItem}>
              <div className={styles.iconPlaceholder}>
                <span>Icon</span>
              </div>
              <span className={styles.title}>{item.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeMenu;
