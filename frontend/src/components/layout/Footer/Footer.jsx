import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookSquare, FaYoutube, FaInstagram } from 'react-icons/fa';
import styles from './Footer.module.scss';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.mainFooter}>
        <div className={styles.container}>
          <div className={styles.footerGrid}>
            
            {/* Column 1 */}
            <div className={styles.footerCol}>
              <h3>T-CINE Việt Nam</h3>
              <ul>
                <li><Link to="#">Giới Thiệu</Link></li>
                <li><Link to="#">Tiện Ích Online</Link></li>
                <li><Link to="#">Thẻ Quà Tặng</Link></li>
                <li><Link to="#">Tuyển Dụng</Link></li>
                <li><Link to="#">Liên Hệ Quảng Cáo T-CINE</Link></li>
                <li><Link to="#">Dành cho đối tác</Link></li>
              </ul>
            </div>

            {/* Column 2 */}
            <div className={styles.footerCol}>
              <h3>Điều khoản sử dụng</h3>
              <ul>
                <li><Link to="#">Điều Khoản Chung</Link></li>
                <li><Link to="#">Điều Khoản Giao Dịch</Link></li>
                <li><Link to="#">Chính Sách Thanh Toán</Link></li>
                <li><Link to="#">Chính Sách Bảo Mật</Link></li>
                <li><Link to="#">Những Quy Định Tại Rạp Phim</Link></li>
                <li><Link to="#">Câu Hỏi Thường Gặp</Link></li>
              </ul>
            </div>

            {/* Column 3 */}
            <div className={styles.footerCol}>
              <h3>Kết nối với chúng tôi</h3>
              <div className={styles.socialLinks}>
                <Link to="#" className={styles.socialIcon} style={{color: '#3b5998'}}><FaFacebookSquare /></Link>
                <Link to="#" className={styles.socialIcon} style={{color: '#ff0000'}}><FaYoutube /></Link>
                <Link to="#" className={styles.socialIcon} style={{color: '#e1306c'}}><FaInstagram /></Link>
                <Link to="#" className={styles.zaloIcon}>Zalo</Link>
              </div>
              <div className={styles.bctBadge}>
                {/* Placeholder for Bo Cong Thuong badge */}
                <div className={styles.bctImage}>
                   <img src="https://upload.wikimedia.org/wikipedia/commons/d/d7/Logo-bo-cong-thuong-mau-xanh.png" alt="Đã thông báo bộ công thương" width="130"/>
                </div>
              </div>
            </div>

            {/* Column 4 */}
            <div className={styles.footerCol}>
              <h3>Chăm sóc khách hàng</h3>
              <div className={styles.contactInfo}>
                <p>Hotline: 1900 6017</p>
                <p>Giờ làm việc: 8:00 - 22:00 (Tất cả các ngày bao gồm cả Lễ Tết)</p>
                <p>Email hỗ trợ: hoidap@t-cine.vn</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Brick background at the very bottom */}
      <div className={styles.brickBottom}></div>
    </footer>
  );
};

export default Footer;
