import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { notify, translateError } from '../../utils/notify';
import styles from './Auth.module.scss';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: ''
  });
  const [errors, setErrors] = useState({});
  
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    setErrors(prev => ({ ...prev, [id]: '' }));
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate fields at frontend
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Họ và tên không được để trống';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Địa chỉ email không đúng định dạng';
      }
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Mật khẩu không được để trống';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải chứa ít nhất 6 ký tự';
    }

    if (!formData.password_confirmation.trim()) {
      newErrors.password_confirmation = 'Vui lòng xác nhận mật khẩu';
    } else if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Mật khẩu xác nhận không trùng khớp';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        password_confirmation: formData.password_confirmation
      });
      notify.success('Đăng ký tài khoản thành công! Đang chuyển hướng...', 'Đăng ký thành công');
      setTimeout(() => navigate('/dang-nhap'), 2000);
    } catch (err) {
      // Nhận lỗi từ backend, dịch sang Tiếng Việt và bắn Toast lỗi
      const backendError = err.response?.data?.errors || err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      notify.error(translateError(backendError), 'Đăng ký thất bại');
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <div className={styles.logo}>T</div>
            <h2>Đăng ký T-CINE</h2>
            <p>Trở thành thành viên để nhận nhiều ưu đãi</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.authForm} noValidate>
            
            {error && <div className={styles.errorMsg}>{error}</div>}

            <div className={styles.formGroup}>
              <label htmlFor="name">Họ và tên</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nhập họ và tên"
                className={errors.name ? styles.inputError : ''}
              />
              {errors.name && <span className={styles.errorText}>{errors.name}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Nhập địa chỉ email"
                className={errors.email ? styles.inputError : ''}
              />
              {errors.email && <span className={styles.errorText}>{errors.email}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="phone">Số điện thoại</label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Nhập số điện thoại (không bắt buộc)"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Mật khẩu</label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                className={errors.password ? styles.inputError : ''}
              />
              {errors.password && <span className={styles.errorText}>{errors.password}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password_confirmation">Xác nhận mật khẩu</label>
              <input
                type="password"
                id="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                placeholder="Nhập lại mật khẩu"
                className={errors.password_confirmation ? styles.inputError : ''}
              />
              {errors.password_confirmation && <span className={styles.errorText}>{errors.password_confirmation}</span>}
            </div>

            <button 
              type="submit" 
              className={styles.submitBtn}
              disabled={isLoading}
            >
              {isLoading ? 'ĐĂNG XỬ LÝ...' : 'ĐĂNG KÝ TÀI KHOẢN'}
            </button>

            <div className={styles.authFooter}>
              Đã có tài khoản? <Link to="/dang-nhap">Đăng nhập</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
