import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import Toast from '../../components/Toast/Toast';
import styles from './Auth.module.scss';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: ''
  });
  const [validationError, setValidationError] = useState('');
  const [toast, setToast] = useState(null);
  
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    setValidationError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password) {
      setValidationError('Vui lòng điền đầy đủ thông tin');
      return;
    }
    
    if (formData.password.length < 6) {
      setValidationError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      setValidationError('Mật khẩu xác nhận không khớp');
      return;
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        password_confirmation: formData.password_confirmation
      });
      setToast({ message: 'Đăng ký thành công! Chuyển hướng đến trang đăng nhập...', type: 'success' });
      setTimeout(() => navigate('/dang-nhap'), 2000);
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
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password_confirmation">Xác nhận mật khẩu</label>
              <input
                type="password"
                id="password_confirmation"
                value={formData.password_confirmation}
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

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default RegisterPage;
