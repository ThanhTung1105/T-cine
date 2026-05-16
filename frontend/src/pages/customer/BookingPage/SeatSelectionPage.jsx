import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import styles from './SeatSelectionPage.module.scss';

const SeatSelectionPage = () => {
  const { cinemaId, timeId } = useParams();
  
  // Trạng thái ghế mẫu
  const [selectedSeats, setSelectedSeats] = useState([]);
  
  const toggleSeat = (seatId) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(id => id !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  // Helper để render hàng ghế
  const renderRow = (rowLabel, type, count, startNum = 1) => {
    const seats = [];
    for (let i = 0; i < count; i++) {
      const seatId = `${rowLabel}${startNum + i}`;
      // Random một số ghế đã bán
      const isSold = (rowLabel === 'D' && i === 5) || (rowLabel === 'E' && i === 4) || (rowLabel === 'F' && i === 8);
      const isSelected = selectedSeats.includes(seatId);
      
      let seatClass = styles.seat;
      if (type === 'vip') seatClass += ` ${styles.vip}`;
      if (type === 'couple') seatClass += ` ${styles.couple}`;
      if (isSold) seatClass += ` ${styles.sold}`;
      if (isSelected) seatClass += ` ${styles.selected}`;
      
      seats.push(
        <button 
          key={seatId} 
          className={seatClass}
          onClick={() => !isSold && toggleSeat(seatId)}
          disabled={isSold}
          title={seatId}
        >
          {type === 'couple' ? '♥' : ''}
        </button>
      );
    }
    return seats;
  };

  return (
    <div className={styles.seatSelectionPage}>
      {/* 1. Stepper Navigation */}
      <div className={styles.stepperContainer}>
        <div className={styles.stepperWrapper}>
          <div className={styles.step}>
            <div className={styles.stepCircle}>01</div>
            <span className={styles.stepLabel}>Chọn thời gian và địa điểm</span>
          </div>
          <div className={`${styles.stepLine} ${styles.active}`}></div>
          <div className={`${styles.step} ${styles.active}`}>
            <div className={styles.stepCircle}>02</div>
            <span className={styles.stepLabel}>Chọn ghế</span>
          </div>
          <div className={styles.stepLine}></div>
          <div className={styles.step}>
            <div className={styles.stepCircle}>03</div>
            <span className={styles.stepLabel}>Thanh toán</span>
          </div>
          <div className={styles.stepLine}></div>
          <div className={styles.step}>
            <div className={styles.stepCircle}>04</div>
            <span className={styles.stepLabel}>Hoàn tất</span>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        <h1 className={styles.pageMainTitle}>Bước 2: Chọn ghế</h1>

        {/* 2. Movie Info Section */}
        <div className={styles.movieInfoCard}>
          <div className={styles.posterPlaceholder}>
            Ảnh Phim<br/>(Dọc)
          </div>
          <div className={styles.movieDetails}>
            <h2 className={styles.movieTitle}>TIÊU ĐỀ PHIM (PLACEHOLDER)</h2>
            <ul className={styles.metaList}>
              <li><strong>Đạo diễn:</strong> Tên đạo diễn</li>
              <li><strong>Diễn viên:</strong> Tên diễn viên A, Tên diễn viên B</li>
              <li><strong>Thể loại:</strong> Hành động, Viễn tưởng</li>
              <li><strong>Khởi chiếu:</strong> 01/01/2026 | <strong>Thời lượng:</strong> 120 phút</li>
            </ul>
            <Link to="/dat-ve/1" className={styles.backToStep1Btn}>
              &larr; CHỌN PHIM KHÁC
            </Link>
          </div>
        </div>

        <div className={styles.mainContent}>
          {/* Left Column: Seat Map */}
          <div className={styles.seatMapColumn}>
            
            <div className={styles.screenWrapper}>
              <div className={styles.screenCurve}></div>
              <p>Màn hình</p>
            </div>

            <div className={styles.legend}>
              <div className={styles.legendItem}><span className={`${styles.seatBox} ${styles.standard}`}></span> Standard</div>
              <div className={styles.legendItem}><span className={`${styles.seatBox} ${styles.vip}`}></span> VIP</div>
              <div className={styles.legendItem}><span className={`${styles.seatBox} ${styles.couple}`}></span> Couple</div>
              <div className={styles.legendItem}><span className={`${styles.seatBox} ${styles.selected}`}></span> Ghế đã chọn</div>
              <div className={styles.legendItem}><span className={`${styles.seatBox} ${styles.sold}`}></span> Ghế đã bán</div>
            </div>

            <div className={styles.seatGrid}>
              {/* Row A - D: Standard */}
              {['A', 'B', 'C', 'D'].map(row => (
                <div key={row} className={styles.seatRow}>
                  <div className={styles.rowLabel}>{row}</div>
                  <div className={styles.seatBlockLeft}>{renderRow(row, 'standard', 4, 1)}</div>
                  <div className={styles.seatBlockCenter}>{renderRow(row, 'standard', 8, 5)}</div>
                  <div className={styles.seatBlockRight}>{renderRow(row, 'standard', 4, 13)}</div>
                  <div className={styles.rowLabel}>{row}</div>
                </div>
              ))}
              
              {/* Row E - H: VIP */}
              {['E', 'F', 'G', 'H'].map(row => (
                <div key={row} className={styles.seatRow}>
                  <div className={styles.rowLabel}>{row}</div>
                  <div className={styles.seatBlockLeft}>{renderRow(row, 'vip', 4, 1)}</div>
                  <div className={styles.seatBlockCenter}>{renderRow(row, 'vip', 8, 5)}</div>
                  <div className={styles.seatBlockRight}>{renderRow(row, 'vip', 4, 13)}</div>
                  <div className={styles.rowLabel}>{row}</div>
                </div>
              ))}

              <div className={styles.seatRowSpacer}></div>

              {/* Row K: Couple */}
              <div className={styles.seatRow}>
                <div className={styles.rowLabel}>K</div>
                <div className={styles.seatBlockLeftCouple}>{renderRow('K', 'couple', 2, 1)}</div>
                <div className={styles.seatBlockCenterCouple}>{renderRow('K', 'couple', 4, 3)}</div>
                <div className={styles.seatBlockRightCouple}>{renderRow('K', 'couple', 2, 7)}</div>
                <div className={styles.rowLabel}>K</div>
              </div>
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
              
              <div className={styles.selectionStatus}>
                {selectedSeats.length === 0 ? (
                  <p className={styles.emptyText}>Bạn chưa chọn ghế nào. Vui lòng chọn ghế.</p>
                ) : (
                  <div className={styles.selectedSeatsInfo}>
                    <p>Ghế đã chọn: <strong>{selectedSeats.join(', ')}</strong></p>
                    <p>Tổng tiền: <strong>{selectedSeats.length * 85000} VNĐ</strong></p>
                  </div>
                )}
              </div>
              
              <div className={styles.divider}></div>
              
              <div className={styles.countdown}>
                <Link to="/dat-ve/1" className={styles.backLink}>&larr; Trở lại</Link>
                <p>Còn lại <strong>5 phút, 00 giây</strong></p>
              </div>

              <Link 
                to={selectedSeats.length > 0 ? "/bap-nuoc/1/1" : "#"} 
                className={`${styles.continueBtn} ${selectedSeats.length === 0 ? styles.disabled : ''}`}
              >
                TIẾP TỤC
              </Link>
            </div>
          </div>
        </div>

        {/* 3. Special Offers (Ưu Đãi Đặc Biệt) */}
        <div className={styles.specialOffersSection}>
          <div className={styles.offerHeader}>
            <span className={styles.offerTitleBadge}>ƯU ĐÃI ĐẶC BIỆT</span>
          </div>
          <div className={styles.offerGrid}>
            {[1, 2, 3, 4].map(item => (
              <div key={item} className={styles.offerCard}>
                <div className={styles.offerImgPlaceholder}>
                  Promo Banner {item} <br/> (Vuông)
                </div>
                <h4 className={styles.offerTitle}>TIÊU ĐỀ ƯU ĐÃI SỐ {item}</h4>
                <p className={styles.offerDesc}>Nội dung mô tả ngắn gọn về chương trình ưu đãi dành cho khách hàng...</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SeatSelectionPage;
