import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import bookingApi from '../../../api/bookingApi';
import promotionApi from '../../../api/promotionApi';
import useBookingStore from '../../../store/useBookingStore';
import { notify } from '../../../utils/notify';
import { getErrorMessage } from '../../../utils/helpers';
import styles from './PaymentPage.module.scss';

const METHODS = [
  {
    id: 'zalopay',
    name: 'Zalopay QR đa năng',
    logo: 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay-Square.png',
  },
  {
    id: 'vnpay',
    name: 'Thanh toán qua VNPAY (Visa, Master, Amex, JCB,...)',
    logo: 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-VNPAY-QR-1.png',
  },
  {
    id: 'momo',
    name: 'Thanh toán qua ví MoMo',
    logo: 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-MoMo-Square.png',
  },
];

const PaymentPage = () => {
  const navigate = useNavigate();

  const {
    showtime,
    movie,
    cinema,
    room,
    selectedSeats,
    selectedCombos,
    appliedPromotion,
    setPromotion,
    clearPromotion,
    setCurrentBookingId,
    getTicketsTotal,
    getCombosTotal,
    getSubtotal,
    getDiscount,
    getFinalTotal,
  } = useBookingStore();

  const [method, setMethod] = useState('zalopay');
  const [promoCode, setPromoCode] = useState(appliedPromotion?.code || '');
  const [promoMsg, setPromoMsg] = useState(null); // { type: 'success' | 'error', text }
  const [checkingPromo, setCheckingPromo] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Redirect nếu mất state
  useEffect(() => {
    if (!showtime || selectedSeats.length === 0) {
      navigate('/');
    }
  }, [showtime, selectedSeats.length, navigate]);

  const ticketsTotal = getTicketsTotal();
  const combosTotal = getCombosTotal();
  const subtotal = getSubtotal();
  const discount = getDiscount();
  const finalTotal = getFinalTotal();

  const handleApplyPromo = async () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) {
      setPromoMsg({ type: 'error', text: 'Vui lòng nhập mã giảm giá.' });
      return;
    }
    setCheckingPromo(true);
    setPromoMsg(null);
    try {
      const res = await promotionApi.check(code);
      setPromotion(res.data || res);
      setPromoMsg({ type: 'success', text: 'Áp dụng mã giảm giá thành công!' });
    } catch (e) {
      const msg = e.response?.data?.message || 'Mã giảm giá không hợp lệ.';
      clearPromotion();
      setPromoMsg({ type: 'error', text: msg });
    } finally {
      setCheckingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    clearPromotion();
    setPromoCode('');
    setPromoMsg(null);
  };

  const handlePayment = async () => {
    if (submitting) return;
    if (!showtime || selectedSeats.length === 0) return;

    setSubmitting(true);
    try {
      const payload = {
        showtime_id: showtime.id,
        seat_ids: selectedSeats.map((s) => s.id),
        combos: Object.values(selectedCombos).map(({ combo, quantity }) => ({
          combo_id: combo.id,
          quantity,
        })),
        promotion_id: appliedPromotion?.id || null,
      };

      const res = await bookingApi.create(payload);
      const booking = res.data || res;

      if (!booking?.id) throw new Error('Không nhận được mã đơn');

      setCurrentBookingId(booking.id);
      navigate(`/mock-payment/${booking.id}?method=${method}`);
    } catch (e) {
      notify.error(getErrorMessage(e, 'Tạo đơn đặt vé thất bại. Vui lòng thử lại.'), 'Đặt vé thất bại');
      // Nếu lỗi do ghế đã bị đặt -> đẩy về chọn ghế lại
      if (e.response?.data?.conflict_seats) {
        navigate(`/chon-ghe/${showtime.id}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.paymentPage}>
      {/* Stepper */}
      <div className={styles.stepperContainer}>
        <div className={styles.stepperWrapper}>
          <div className={styles.step}><div className={styles.stepCircle}>01</div><span className={styles.stepLabel}>Chọn thời gian và địa điểm</span></div>
          <div className={`${styles.stepLine} ${styles.active}`}></div>
          <div className={styles.step}><div className={styles.stepCircle}>02</div><span className={styles.stepLabel}>Chọn ghế</span></div>
          <div className={`${styles.stepLine} ${styles.active}`}></div>
          <div className={styles.step}><div className={styles.stepCircle}>03</div><span className={styles.stepLabel}>Bắp nước</span></div>
          <div className={`${styles.stepLine} ${styles.active}`}></div>
          <div className={`${styles.step} ${styles.active}`}><div className={styles.stepCircle}>04</div><span className={styles.stepLabel}>Thanh toán</span></div>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.mainContent}>
          {/* Left: payment methods */}
          <div className={styles.paymentColumn}>
            <h2 className={styles.paymentTitle}>Hình thức thanh toán (mô phỏng)</h2>

            <div className={styles.paymentMethods}>
              {METHODS.map((m) => (
                <label
                  key={m.id}
                  className={`${styles.methodItem} ${method === m.id ? styles.active : ''}`}
                >
                  <div className={styles.radioWrapper}>
                    <input
                      type="radio"
                      name="payment"
                      value={m.id}
                      checked={method === m.id}
                      onChange={(e) => setMethod(e.target.value)}
                    />
                    <span className={styles.customRadio}></span>
                  </div>
                  <div className={styles.methodIcon}>
                    <img src={m.logo} alt={m.name} />
                  </div>
                  <span className={styles.methodName}>{m.name}</span>
                </label>
              ))}
            </div>

            {/* Promotion */}
            <div className={styles.promoSection}>
              <h3>Mã giảm giá</h3>
              <div className={styles.promoInputRow}>
                <input
                  type="text"
                  placeholder="NHẬP MÃ GIẢM GIÁ"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  disabled={!!appliedPromotion || checkingPromo}
                />
                {appliedPromotion ? (
                  <button type="button" className={styles.removePromoBtn} onClick={handleRemovePromo}>
                    Bỏ mã
                  </button>
                ) : (
                  <button type="button" onClick={handleApplyPromo} disabled={checkingPromo}>
                    {checkingPromo ? 'Đang kiểm tra...' : 'Áp dụng'}
                  </button>
                )}
              </div>
              {promoMsg && (
                <p className={`${styles.promoMsg} ${styles[promoMsg.type]}`}>{promoMsg.text}</p>
              )}
            </div>
          </div>

          {/* Right: order summary */}
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
                  <div className={styles.ticketPrice}>{ticketsTotal.toLocaleString('vi-VN')} VNĐ</div>
                </div>

                {Object.values(selectedCombos).map(({ combo, quantity }) => (
                  <div key={combo.id} className={styles.ticketRow}>
                    <div className={styles.ticketType}>
                      <p>{quantity} x {combo.name}</p>
                    </div>
                    <div className={styles.ticketPrice}>
                      {(Number(combo.price) * quantity).toLocaleString('vi-VN')} VNĐ
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.divider}></div>

              <div className={styles.ticketSummary}>
                <div className={styles.ticketRow}>
                  <div className={styles.ticketType}><p>Tạm tính</p></div>
                  <div className={styles.ticketPrice}>{subtotal.toLocaleString('vi-VN')} VNĐ</div>
                </div>
                {discount > 0 && (
                  <div className={styles.discountRow}>
                    <span>Giảm giá ({appliedPromotion?.code} - {appliedPromotion?.discount_percent}%)</span>
                    <span>-{discount.toLocaleString('vi-VN')} VNĐ</span>
                  </div>
                )}
              </div>

              <div className={styles.divider}></div>

              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>Tổng tiền</span>
                <span className={styles.totalAmount}>{finalTotal.toLocaleString('vi-VN')} VNĐ</span>
              </div>

              <button
                onClick={handlePayment}
                className={styles.continueBtn}
                disabled={submitting}
              >
                {submitting ? 'ĐANG XỬ LÝ...' : 'THANH TOÁN (4/4)'}
              </button>

              <div className={styles.countdown}>
                <Link to="/bap-nuoc" className={styles.backLink}>&larr; Trở lại</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
