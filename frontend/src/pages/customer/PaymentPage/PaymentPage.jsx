import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './PaymentPage.module.scss';

const PaymentPage = () => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('zalopay');

  const ticketPrice = 189000; // Giá vé mockup (theo ảnh)
  const totalPrice = ticketPrice;

  const handlePayment = (e) => {
    e.preventDefault();
    // Chuyển hướng đến trang mock payment
    navigate(`/mock-payment?method=${paymentMethod}`);
  };

  return (
    <div className={styles.paymentPage}>
      {/* 1. Stepper Navigation */}
      <div className={styles.stepperContainer}>
        <div className={styles.stepperWrapper}>
          <div className={styles.step}>
            <div className={styles.stepCircle}>01</div>
            <span className={styles.stepLabel}>Chọn thời gian và địa điểm</span>
          </div>
          <div className={`${styles.stepLine} ${styles.active}`}></div>
          <div className={styles.step}>
            <div className={styles.stepCircle}>02</div>
            <span className={styles.stepLabel}>Chọn ghế</span>
          </div>
          <div className={`${styles.stepLine} ${styles.active}`}></div>
          <div className={styles.step}>
            <div className={styles.stepCircle}>03</div>
            <span className={styles.stepLabel}>Bắp nước</span>
          </div>
          <div className={`${styles.stepLine} ${styles.active}`}></div>
          <div className={`${styles.step} ${styles.active}`}>
            <div className={styles.stepCircle}>04</div>
            <span className={styles.stepLabel}>Thanh toán</span>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.mainContent}>
          
          {/* Left Column: Payment Methods */}
          <div className={styles.paymentColumn}>
            <h2 className={styles.paymentTitle}>Hình thức thanh toán</h2>
            
            <div className={styles.paymentMethods}>
              <label className={`${styles.methodItem} ${paymentMethod === 'zalopay' ? styles.active : ''}`}>
                <div className={styles.radioWrapper}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="zalopay"
                    checked={paymentMethod === 'zalopay'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span className={styles.customRadio}></span>
                </div>
                <div className={styles.methodIcon}>
                  <img src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay-Square.png" alt="ZaloPay" />
                </div>
                <span className={styles.methodName}>Zalopay QR đa năng</span>
              </label>

              <label className={`${styles.methodItem} ${paymentMethod === 'vnpay' ? styles.active : ''}`}>
                <div className={styles.radioWrapper}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="vnpay"
                    checked={paymentMethod === 'vnpay'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span className={styles.customRadio}></span>
                </div>
                <div className={styles.methodIcon}>
                  <img src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-VNPAY-QR-1.png" alt="VNPAY" />
                </div>
                <span className={styles.methodName}>Thanh toán qua VNPAY (Visa, Master, Amex, JCB,...)</span>
              </label>

              <label className={`${styles.methodItem} ${paymentMethod === 'momo' ? styles.active : ''}`}>
                <div className={styles.radioWrapper}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="momo"
                    checked={paymentMethod === 'momo'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span className={styles.customRadio}></span>
                </div>
                <div className={styles.methodIcon}>
                  <img src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-MoMo-Square.png" alt="MoMo" />
                </div>
                <span className={styles.methodName}>Thanh toán qua ví MoMo</span>
              </label>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className={styles.summaryColumn}>
            <div className={styles.summaryCard}>
              <h3 className={styles.cinemaName}>T-CINE Landmark 81</h3>
              <p className={styles.showtimeInfo}>Screen 2 - 05/05/2026 - Suất chiếu: <strong>14:40</strong></p>
              
              <div className={styles.divider}></div>
              
              <h2 className={styles.summaryMovieTitle}>TIÊU ĐỀ PHIM CHỌN</h2>
              <div className={styles.tags}>
                <span className={styles.tag}>2D</span>
                <span className={styles.tagDark}>Lồng tiếng</span>
              </div>
              
              <div className={styles.divider}></div>
              
              {/* Ticket Info */}
              <div className={styles.ticketSummary}>
                <div className={styles.ticketRow}>
                  <div className={styles.ticketType}>
                    <p>3 x Adult - VIP - 2D - ES</p>
                    <span className={styles.selectedSeats}>E8, F7, F8</span>
                  </div>
                  <div className={styles.ticketPrice}>
                    {ticketPrice.toLocaleString('vi-VN')} VNĐ
                  </div>
                </div>
              </div>
              
              <div className={styles.divider}></div>
              
              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>Tổng tiền</span>
                <span className={styles.totalAmount}>{totalPrice.toLocaleString('vi-VN')} VNĐ</span>
              </div>
              
              <button onClick={handlePayment} className={styles.continueBtn}>
                THANH TOÁN (4/4)
              </button>
              
              <div className={styles.countdown}>
                <Link to="/bap-nuoc/1/1" className={styles.backLink}>&larr; Trở lại</Link>
                <p>Còn lại <strong>28 giây</strong></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
