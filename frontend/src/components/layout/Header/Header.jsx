import React from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaTicketAlt } from 'react-icons/fa';
import { RiNewspaperLine } from 'react-icons/ri';
import { MdLogout } from 'react-icons/md';
import useAuthStore from '../../../store/useAuthStore';
import styles from './Header.module.scss';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuthStore();

  return (
    <header className={styles.header}>
      {/* Top navigation (News, Tickets, Login) */}
      <div className={styles.topNav}>
        <div className={styles.container}>
          <ul className={styles.topLinks}>
            <li>
              <Link to="#">
                <RiNewspaperLine className={styles.icon} />
                TIN MỚI & ƯU ĐÃI
              </Link>
            </li>
            <li>
              <Link to="#">
                <FaTicketAlt className={styles.icon} />
                VÉ CỦA TÔI
              </Link>
            </li>
            {isAuthenticated && user ? (
              <li className={styles.userProfile}>
                <Link to={user.role === 'admin' ? '/admin' : '/thong-tin-ca-nhan'}>
                  <FaUser className={styles.icon} />
                  Xin chào, {user.name.split(' ')[0]}
                </Link>
                <button onClick={logout} className={styles.logoutBtn} title="Đăng xuất">
                  <MdLogout />
                </button>
              </li>
            ) : (
              <li>
                <Link to="/dang-nhap">
                  <FaUser className={styles.icon} />
                  ĐĂNG NHẬP/ ĐĂNG KÝ
                </Link>
              </li>
            )}
            <li className={styles.languageSwitch}>
              <button className={styles.active}>VN</button>
              <button>EN</button>
            </li>
          </ul>
        </div>
      </div>

      {/* Main navigation */}
      <div className={styles.mainNav}>
        <div className={styles.container}>
          <div className={styles.logoContainer}>
            <Link to="/" className={styles.logo}>
              <span className={styles.logoT}>T</span>
              <span className={styles.logoDash}>-</span>
              <span className={styles.logoCine}>CINE</span>
              <span className={styles.logoStar}>*</span>
            </Link>
          </div>

          <nav className={styles.navMenu}>
            <ul>
              <li className={styles.hasDropdown}>
                <Link to="#">PHIM</Link>
                <ul className={styles.dropdown}>
                  <li><Link to="/phim-dang-chieu">Phim Đang Chiếu</Link></li>
                  <li><Link to="/phim-sap-chieu">Phim Sắp Chiếu</Link></li>
                </ul>
              </li>
              <li><Link to="#">RẠP T-CINE</Link></li>
              <li><Link to="#">THÀNH VIÊN</Link></li>
              <li><Link to="/cong-dong">CỘNG ĐỒNG</Link></li>
            </ul>
          </nav>

          <div className={styles.buyTicketBtn}>
            <Link to="#" className={styles.ticketLink}>
              <div className={styles.ticketBadge}>
                <span className={styles.ticketBrand}>T-CINE</span>
                <span className={styles.ticketText}>MUA VÉ NGAY</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
