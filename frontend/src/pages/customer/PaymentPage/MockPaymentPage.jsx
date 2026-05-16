import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './MockPaymentPage.module.scss';

const MockPaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(300); // 5 phút đếm ngược
  
  // Lấy phương thức thanh toán từ URL
  const queryParams = new URLSearchParams(location.search);
  const method = queryParams.get('method') || 'zalopay';

  // Thông tin cấu hình hiển thị theo phương thức
  const methodConfig = {
    zalopay: {
      name: 'ZaloPay',
      color: '#0068ff',
      logo: 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay-Square.png'
    },
    vnpay: {
      name: 'VNPAY',
      color: '#005baa',
      logo: 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-VNPAY-QR-1.png'
    },
    momo: {
      name: 'MoMo',
      color: '#a50064',
      logo: 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-MoMo-Square.png'
    }
  };

  const currentConfig = methodConfig[method];

  // Đếm ngược thời gian
  useEffect(() => {
    if (timeLeft <= 0) {
      alert("Thời gian thanh toán đã hết!");
      navigate('/thanh-toan');
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, navigate]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSuccess = () => {
    alert("Giao dịch thành công! Mã vé của bạn sẽ được gửi qua email.");
    navigate('/');
  };

  const handleCancel = () => {
    if(window.confirm("Bạn có chắc chắn muốn hủy giao dịch này?")) {
      navigate('/thanh-toan');
    }
  };

  return (
    <div className={styles.mockPaymentPage} style={{ '--theme-color': currentConfig.color }}>
      <div className={styles.paymentBox}>
        <div className={styles.header}>
          <img src={currentConfig.logo} alt={currentConfig.name} className={styles.logo} />
          <h2>Cổng thanh toán {currentConfig.name}</h2>
        </div>
        
        <div className={styles.content}>
          <p className={styles.instruction}>Quét mã QR bằng ứng dụng {currentConfig.name} để thanh toán</p>
          
          <div className={styles.qrWrapper}>
            {/* Mã QR giả */}
            <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" alt="QR Code" className={styles.qrCode} />
            <div className={styles.amount}>189.000 VNĐ</div>
          </div>
          
          <div className={styles.orderInfo}>
            <div className={styles.infoRow}>
              <span>Đơn hàng:</span>
              <strong>Vé xem phim T-CINE</strong>
            </div>
            <div className={styles.infoRow}>
              <span>Mã giao dịch:</span>
              <strong>TCINE{Math.floor(100000 + Math.random() * 900000)}</strong>
            </div>
          </div>

          <div className={styles.timer}>
            Thời gian còn lại: <strong>{formatTime(timeLeft)}</strong>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.successBtn} onClick={handleSuccess}>
            Mô phỏng Thanh toán Thành công
          </button>
          <button className={styles.cancelBtn} onClick={handleCancel}>
            Hủy giao dịch
          </button>
        </div>
      </div>
    </div>
  );
};

export default MockPaymentPage;
