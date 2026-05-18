import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import styles from './Auth.module.scss';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearError, isAuthenticated, user } = useAuthStore();

  // Xóa lỗi cũ khi load trang
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Nếu đã đăng nhập thì tự động chuyển hướng
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      const res = await login({ email, password });
      const role = res.data.user.role;
      if (role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      }
    } catch (err) {
      // Lỗi đã được xử lý trong useAuthStore
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <div className={styles.logo}>T</div>
            <h2>Đăng nhập T-CINE</h2>
            <p>Chào mừng bạn quay lại hệ thống rạp chiếu phim</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.authForm}>

            {error && <div className={styles.errorMsg}>{error}</div>}

            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập địa chỉ email"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Mật khẩu</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                required
              />
            </div>

            <div className={styles.formOptions}>
              <label className={styles.rememberMe}>
                <input type="checkbox" /> Ghi nhớ đăng nhập
              </label>
              <a href="#" className={styles.forgotPassword}>Quên mật khẩu?</a>
            </div>

            <button 
              type="submit" 
              className={styles.submitBtn}
              disabled={isLoading || !email || !password}
            >
              {isLoading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG NHẬP'}
            </button>

            <div className={styles.authFooter}>
              Chưa có tài khoản? <Link to="/dang-ky">Đăng ký ngay</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
