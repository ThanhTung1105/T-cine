import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FaUser, FaTicketAlt, FaChevronDown } from 'react-icons/fa';
import { RiNewspaperLine, RiVipCrownLine } from 'react-icons/ri';
import { MdLogout, MdMovie, MdLocationOn, MdLocalActivity, MdLocationCity } from 'react-icons/md';
import useAuthStore from '../../../store/useAuthStore';
import cinemaApi from '../../../api/cinemaApi';
import Toast from '../../Toast/Toast';
import styles from './Header.module.scss';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  const isAdmin = isAuthenticated && user?.role === 'admin';

  // Danh sách rạp cho dropdown "RẠP T-CINE"
  const [cinemas, setCinemas] = useState([]);

  // Đổ shadow khi scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lấy danh sách rạp 1 lần khi mount
  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        const res = await cinemaApi.getAll();
        const list = res.data || res || [];
        setCinemas(Array.isArray(list) ? list : []);
      } catch (e) {
        setCinemas([]);
      }
    };
    fetchCinemas();
  }, []);

  const handleLogout = async () => {
    await logout();
    setToast({ message: 'Đăng xuất thành công! Hẹn gặp lại bạn.', type: 'success' });
    setTimeout(() => navigate('/'), 1500);
  };

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
        {/* === TOP BAR === */}
        <div className={styles.topBar}>
          <div className={styles.container}>
            <ul className={styles.topLinks}>
              <li>
                <Link to="/tin-moi-va-uu-dai" className={styles.topLink}>
                  <RiNewspaperLine className={styles.icon} />
                  <span>Tin Mới & Ưu Đãi</span>
                </Link>
              </li>
              {!isAdmin && (
                <li>
                  <Link to="/lich-su-dat-ve" className={styles.topLink}>
                    <FaTicketAlt className={styles.icon} />
                    <span>Vé Của Tôi</span>
                  </Link>
                </li>
              )}

              <li className={styles.divider}></li>

              {isAuthenticated && user ? (
                <li className={styles.userProfile}>
                  <Link
                    to={isAdmin ? '/admin' : '/thanh-vien'}
                    className={styles.userLink}
                  >
                    <div className={styles.avatar}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span>
                      Xin chào, <strong>{user.name.split(' ').slice(-1)[0]}</strong>
                      {isAdmin && <em className={styles.adminTag}> · Admin</em>}
                    </span>
                  </Link>
                  <button onClick={handleLogout} className={styles.logoutBtn} title="Đăng xuất">
                    <MdLogout />
                  </button>
                </li>
              ) : (
                <li>
                  <Link to="/dang-nhap" className={styles.loginBtn}>
                    <FaUser className={styles.icon} />
                    <span>Đăng nhập / Đăng ký</span>
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

        {/* === MAIN NAV === */}
        <div className={styles.mainNav}>
          <div className={styles.container}>
            {/* LOGO */}
            <Link to="/" className={styles.logo}>
              <span className={styles.logoT}>T</span>
              <span className={styles.logoDash}>-</span>
              <span className={styles.logoCine}>CINE</span>
              <span className={styles.logoStar}>★</span>
            </Link>

            {/* MENU */}
            <nav className={styles.navMenu}>
              <ul>
                <li className={styles.hasDropdown}>
                  <span className={styles.navItem}>
                    <MdMovie className={styles.navIcon} />
                    PHIM
                    <FaChevronDown className={styles.chevron} />
                  </span>
                  <ul className={styles.dropdown}>
                    <li>
                      <NavLink to="/phim-dang-chieu" className={({ isActive }) => isActive ? styles.activeDrop : ''}>
                        Phim Đang Chiếu
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/phim-sap-chieu" className={({ isActive }) => isActive ? styles.activeDrop : ''}>
                        Phim Sắp Chiếu
                      </NavLink>
                    </li>
                  </ul>
                </li>
                <li className={styles.hasDropdown}>
                  <NavLink
                    to="/rap"
                    className={({ isActive }) => `${styles.navItem} ${isActive ? styles.activeNav : ''}`}
                  >
                    <MdLocationOn className={styles.navIcon} />
                    RẠP T-CINE
                    <FaChevronDown className={styles.chevron} />
                  </NavLink>
                  <ul className={`${styles.dropdown} ${styles.cinemaDropdown}`}>
                    {cinemas.length === 0 ? (
                      <li className={styles.dropdownEmpty}>Chưa có rạp nào</li>
                    ) : (
                      <>
                        {cinemas.map((c) => (
                          <li key={c.id}>
                            <Link to={`/rap?id=${c.id}#cinema-${c.id}`} className={styles.cinemaItem}>
                              <MdLocationCity className={styles.cinemaIcon} />
                              <div className={styles.cinemaText}>
                                <span className={styles.cinemaName}>{c.name}</span>
                                {c.city && (
                                  <span className={styles.cinemaCity}>{c.city}</span>
                                )}
                              </div>
                            </Link>
                          </li>
                        ))}
                      </>
                    )}
                    <li className={styles.dropdownDivider} />
                    <li>
                      <NavLink to="/rap" className={styles.viewAllLink}>
                        Xem tất cả rạp →
                      </NavLink>
                    </li>
                  </ul>
                </li>
                {!isAdmin && (
                  <li>
                    <NavLink to="/thanh-vien" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.activeNav : ''}`}>
                      <RiVipCrownLine className={styles.navIcon} />
                      THÀNH VIÊN
                    </NavLink>
                  </li>
                )}
                <li>
                  <NavLink to="/cong-dong" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.activeNav : ''}`}>
                    <MdLocalActivity className={styles.navIcon} />
                    CỘNG ĐỒNG
                  </NavLink>
                </li>
              </ul>
            </nav>

            {/* CTA BUTTON */}
            <Link to="/phim-dang-chieu" className={styles.ctaBtn}>
              <FaTicketAlt className={styles.ctaIcon} />
              <div className={styles.ctaTextWrap}>
                <span className={styles.ctaSub}>T-CINE</span>
                <span className={styles.ctaMain}>MUA VÉ NGAY</span>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
};

export default Header;
