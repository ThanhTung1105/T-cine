import React from 'react';
import styles from './BottomBanners.module.scss';
import homeStyles from '../HomePage.module.scss';

const BottomBanners = () => {
  return (
    <div className={styles.bottomBannersWrapper}>
      <div className={homeStyles.container}>
        <div className={styles.bannerGrid}>
          {/* Banner Trái (Vuông) */}
          <div className={styles.bannerItem}>
            <div className={homeStyles.placeholderImage}>
              Promo Banner 1 <br /> (Vuông)
            </div>
          </div>
          
          {/* Banner Giữa (Chữ nhật ngang) */}
          <div className={`${styles.bannerItem} ${styles.wide}`}>
            <div className={homeStyles.placeholderImage}>
              Promo Banner 2 <br /> (Chữ nhật)
            </div>
          </div>
          
          {/* Banner Phải (Vuông) */}
          <div className={styles.bannerItem}>
            <div className={homeStyles.placeholderImage}>
              Promo Banner 3 <br /> (Vuông)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BottomBanners;
