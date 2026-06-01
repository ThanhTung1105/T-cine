import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { notify, translateError } from '../../utils/notify';
import styles from './Auth.module.scss';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
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

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setErrors(prev => ({ ...prev, email: '' }));
    clearError();
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setErrors(prev => ({ ...prev, password: '' }));
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = 'Địa chỉ email không đúng định dạng';
      }
    }

    if (!password.trim()) {
      newErrors.password = 'Mật khẩu không được để trống';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      const res = await login({ email, password });
      const loggedUser = res.data?.user || res.user;
      notify.success(`Chào mừng ${loggedUser?.name || 'thành viên'} quay trở lại!`, 'Đăng nhập thành công');
      
      const role = loggedUser?.role;
      if (role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      }
    } catch (err) {
      // Nhận lỗi từ backend, dịch sang Tiếng Việt và bắn Toast lỗi
      const backendError = err.response?.data?.errors || err.response?.data?.message || 'Email hoặc mật khẩu không chính xác.';
      notify.error(translateError(backendError), 'Đăng nhập thất bại');
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

          <form onSubmit={handleSubmit} className={styles.authForm} noValidate>

            {error && <div className={styles.errorMsg}>{error}</div>}

            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="Nhập địa chỉ email"
                className={errors.email ? styles.inputError : ''}
              />
              {errors.email && <span className={styles.errorText}>{errors.email}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Mật khẩu</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={handlePasswordChange}
                placeholder="Nhập mật khẩu"
                className={errors.password ? styles.inputError : ''}
              />
              {errors.password && <span className={styles.errorText}>{errors.password}</span>}
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
              disabled={isLoading}
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
