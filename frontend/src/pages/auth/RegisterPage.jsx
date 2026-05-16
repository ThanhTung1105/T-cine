import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import styles from './Auth.module.scss';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [validationError, setValidationError] = useState('');
  
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    setValidationError(''); // Clear validation error on typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.password) {
      setValidationError('Vui lòng điền đầy đủ thông tin');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setValidationError('Mật khẩu xác nhận không khớp');
      return;
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      // Nếu đăng ký thành công (mock)
      alert("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate('/dang-nhap');
    } catch (err) {
      console.error("Register failed", err);
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

          <form onSubmit={handleSubmit} className={styles.authForm}>
            
            {validationError && <div className={styles.errorMsg}>{validationError}</div>}
            {error && <div className={styles.errorMsg}>{error}</div>}

            <div className={styles.formGroup}>
              <label htmlFor="name">Họ và tên</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nhập họ và tên"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Nhập địa chỉ email"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Mật khẩu</label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
              <input
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Nhập lại mật khẩu"
                required
              />
            </div>

            <button 
              type="submit" 
              className={styles.submitBtn}
              disabled={isLoading || !formData.name || !formData.email || !formData.password}
            >
              {isLoading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG KÝ TÀI KHOẢN'}
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
