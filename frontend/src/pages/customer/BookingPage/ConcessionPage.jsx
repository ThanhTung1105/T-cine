import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './ConcessionPage.module.scss';

const ConcessionPage = () => {
  // Dữ liệu mock bắp nước
  const [combos, setCombos] = useState([
    {
      id: 1,
      name: 'Combo 1 Big - Sweet 22Oz',
      desc: '1 Bắp lớn + 1 Nước lớn',
      originalPrice: 89000,
      price: 80100,
      quantity: 0
    },
    {
      id: 2,
      name: 'Combo 2 Big - Sweet 22Oz',
      desc: '1 Bắp lớn + 2 Nước lớn',
      originalPrice: 119000,
      price: 107100,
      quantity: 0
    },
    {
      id: 3,
      name: 'Combo Gia Đình - Sweet 22Oz',
      desc: '2 Bắp lớn + 4 Nước lớn',
      originalPrice: 199000,
      price: 179100,
      quantity: 0
    }
  ]);

  const updateQuantity = (id, delta) => {
    setCombos(combos.map(combo => {
      if (combo.id === id) {
        const newQuantity = Math.max(0, combo.quantity + delta);
        return { ...combo, quantity: newQuantity };
      }
      return combo;
    }));
  };

  const totalComboPrice = combos.reduce((total, combo) => total + (combo.price * combo.quantity), 0);
  const ticketPrice = 255000; // Giá vé mockup (3 vé x 85k)
  const totalPrice = ticketPrice + totalComboPrice;

  return (
    <div className={styles.concessionPage}>
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
          <div className={`${styles.step} ${styles.active}`}>
            <div className={styles.stepCircle}>03</div>
            <span className={styles.stepLabel}>Bắp nước</span>
          </div>
          <div className={styles.stepLine}></div>
          <div className={styles.step}>
            <div className={styles.stepCircle}>04</div>
            <span className={styles.stepLabel}>Thanh toán</span>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        <h1 className={styles.pageMainTitle}>Bước 3: Chọn bắp nước</h1>

        <div className={styles.mainContent}>
          {/* Left Column: Combo List */}
          <div className={styles.comboColumn}>
            <div className={styles.comboTabContainer}>
              <div className={styles.comboTab}>Concession</div>
            </div>
            
            <div className={styles.comboList}>
              {combos.map(combo => (
                <div key={combo.id} className={styles.comboItem}>
                  <div className={styles.comboImagePlaceholder}>
                    Ảnh {combo.name} <br/>(Vuông)
                  </div>
                  
                  <div className={styles.comboInfo}>
                    <h3 className={styles.comboName}>{combo.name}</h3>
                    <p className={styles.comboDesc}>{combo.desc}</p>
                    
                    <div className={styles.quantityControl}>
                      <button 
                        className={styles.qtyBtn} 
                        onClick={() => updateQuantity(combo.id, -1)}
                        disabled={combo.quantity === 0}
                      >
                        -
                      </button>
                      <span className={styles.qtyValue}>{combo.quantity}</span>
                      <button 
                        className={styles.qtyBtn} 
                        onClick={() => updateQuantity(combo.id, 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className={styles.comboPriceWrapper}>
                    <div className={styles.originalPrice}>
                      {combo.originalPrice.toLocaleString('vi-VN')} VNĐ
                    </div>
                    <div className={styles.currentPrice}>
                      {combo.price.toLocaleString('vi-VN')} VNĐ
                    </div>
                  </div>
                </div>
              ))}
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
                    <p>3 x Người lớn - Standard - 2D</p>
                    <span className={styles.selectedSeats}>E8, F7, F8</span>
                  </div>
                  <div className={styles.ticketPrice}>
                    {ticketPrice.toLocaleString('vi-VN')} VNĐ
                  </div>
                </div>
              </div>

              {/* Combo Info (If any selected) */}
              {totalComboPrice > 0 && (
                <>
                  <div className={styles.divider}></div>
                  <div className={styles.comboSummary}>
                    {combos.filter(c => c.quantity > 0).map(c => (
                      <div key={c.id} className={styles.comboRow}>
                        <div className={styles.comboType}>
                          <p>{c.quantity} x {c.name}</p>
                        </div>
                        <div className={styles.comboPrice}>
                          {(c.price * c.quantity).toLocaleString('vi-VN')} VNĐ
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              
              <div className={styles.divider}></div>
              
              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>Tổng tiền <small>(Đã bao gồm phụ thu)</small></span>
                <span className={styles.totalAmount}>{totalPrice.toLocaleString('vi-VN')} VNĐ</span>
              </div>
              
              <Link to="/thanh-toan" className={styles.continueBtn}>
                THANH TOÁN (3/4)
              </Link>
              
              <div className={styles.countdown}>
                <Link to="/chon-ghe/1/1" className={styles.backLink}>&larr; Trở lại</Link>
                <p>Còn lại <strong>4 phút, 25 giây</strong></p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ConcessionPage;
