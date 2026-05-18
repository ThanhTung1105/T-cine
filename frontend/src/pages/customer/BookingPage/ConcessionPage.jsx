import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import comboApi from '../../../api/comboApi';
import useBookingStore from '../../../store/useBookingStore';
import styles from './ConcessionPage.module.scss';

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage';

const ConcessionPage = () => {
  const navigate = useNavigate();
  const {
    showtime,
    movie,
    cinema,
    room,
    selectedSeats,
    selectedCombos,
    setComboQuantity,
    getTicketsTotal,
    getCombosTotal,
    getFinalTotal,
  } = useBookingStore();

  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Nếu user F5 mất state (chưa chọn ghế) -> đẩy về trang chủ
    if (!showtime || selectedSeats.length === 0) {
      navigate('/');
      return;
    }
    const fetch = async () => {
      try {
        const res = await comboApi.getAll();
        setCombos(res.data || res || []);
      } catch (e) {
        console.error(e);
        setCombos([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateQty = (combo, delta) => {
    const current = selectedCombos[combo.id]?.quantity || 0;
    setComboQuantity(combo, Math.max(0, current + delta));
  };

  const ticketTotal = getTicketsTotal();
  const comboTotal = getCombosTotal();
  const grandTotal = getFinalTotal();

  return (
    <div className={styles.concessionPage}>
      <div className={styles.stepperContainer}>
        <div className={styles.stepperWrapper}>
          <div className={styles.step}><div className={styles.stepCircle}>01</div><span className={styles.stepLabel}>Chọn thời gian và địa điểm</span></div>
          <div className={`${styles.stepLine} ${styles.active}`}></div>
          <div className={styles.step}><div className={styles.stepCircle}>02</div><span className={styles.stepLabel}>Chọn ghế</span></div>
          <div className={`${styles.stepLine} ${styles.active}`}></div>
          <div className={`${styles.step} ${styles.active}`}><div className={styles.stepCircle}>03</div><span className={styles.stepLabel}>Bắp nước</span></div>
          <div className={styles.stepLine}></div>
          <div className={styles.step}><div className={styles.stepCircle}>04</div><span className={styles.stepLabel}>Thanh toán</span></div>
        </div>
      </div>

      <div className={styles.container}>
        <h1 className={styles.pageMainTitle}>Bước 3: Chọn bắp nước</h1>

        <div className={styles.mainContent}>
          {/* Combo list */}
          <div className={styles.comboColumn}>
            <div className={styles.comboTabContainer}>
              <div className={styles.comboTab}>Concession</div>
            </div>

            {loading ? (
              <p style={{ textAlign: 'center', color: '#aaa', padding: '40px' }}>Đang tải danh sách combo...</p>
            ) : combos.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#aaa', padding: '40px' }}>Chưa có combo nào.</p>
            ) : (
              <div className={styles.comboList}>
                {combos.map((combo) => {
                  const qty = selectedCombos[combo.id]?.quantity || 0;
                  const imgSrc = combo.image
                    ? (combo.image.startsWith('http') ? combo.image : `${STORAGE_URL}/${combo.image}`)
                    : null;
                  return (
                    <div key={combo.id} className={styles.comboItem}>
                      {imgSrc ? (
                        <img src={imgSrc} alt={combo.name} className={styles.comboImagePlaceholder} style={{ objectFit: 'cover' }} />
                      ) : (
                        <div className={styles.comboImagePlaceholder}>Ảnh {combo.name}<br />(Vuông)</div>
                      )}

                      <div className={styles.comboInfo}>
                        <h3 className={styles.comboName}>{combo.name}</h3>
                        <p className={styles.comboDesc}>{combo.description || ''}</p>

                        <div className={styles.quantityControl}>
                          <button className={styles.qtyBtn} onClick={() => updateQty(combo, -1)} disabled={qty === 0}>-</button>
                          <span className={styles.qtyValue}>{qty}</span>
                          <button className={styles.qtyBtn} onClick={() => updateQty(combo, 1)}>+</button>
                        </div>
                      </div>

                      <div className={styles.comboPriceWrapper}>
                        <div className={styles.currentPrice}>
                          {Number(combo.price).toLocaleString('vi-VN')} VNĐ
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className={styles.summaryColumn}>
            <div className={styles.summaryCard}>
              <h3 className={styles.cinemaName}>{cinema?.name || '—'}</h3>
              <p className={styles.showtimeInfo}>
                {room?.name || '—'} -{' '}
                {showtime?.start_time
                  ? new Date(showtime.start_time).toLocaleDateString('vi-VN')
                  : '—'}{' '}
                - Suất chiếu:{' '}
                <strong>
                  {showtime?.start_time
                    ? new Date(showtime.start_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                    : '—'}
                </strong>
              </p>

              <div className={styles.divider}></div>

              <h2 className={styles.summaryMovieTitle}>{movie?.title || '—'}</h2>

              <div className={styles.divider}></div>

              <div className={styles.ticketSummary}>
                <div className={styles.ticketRow}>
                  <div className={styles.ticketType}>
                    <p>{selectedSeats.length} x Vé</p>
                    <span className={styles.selectedSeats}>{selectedSeats.map((s) => s.label).join(', ')}</span>
                  </div>
                  <div className={styles.ticketPrice}>{ticketTotal.toLocaleString('vi-VN')} VNĐ</div>
                </div>
              </div>

              {comboTotal > 0 && (
                <>
                  <div className={styles.divider}></div>
                  <div className={styles.comboSummary}>
                    {Object.values(selectedCombos).map(({ combo, quantity }) => (
                      <div key={combo.id} className={styles.comboRow}>
                        <div className={styles.comboType}>
                          <p>{quantity} x {combo.name}</p>
                        </div>
                        <div className={styles.comboPrice}>
                          {(Number(combo.price) * quantity).toLocaleString('vi-VN')} VNĐ
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className={styles.divider}></div>

              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>Tổng tiền</span>
                <span className={styles.totalAmount}>{grandTotal.toLocaleString('vi-VN')} VNĐ</span>
              </div>

              <button className={styles.continueBtn} onClick={() => navigate('/thanh-toan')}>
                TIẾP TỤC (3/4)
              </button>

              <div className={styles.countdown}>
                <Link to={showtime ? `/chon-ghe/${showtime.id}` : '/'} className={styles.backLink}>&larr; Trở lại</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConcessionPage;
