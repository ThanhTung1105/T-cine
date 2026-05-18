import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MdCheckCircle, MdConfirmationNumber, MdLocationOn, MdCalendarToday, MdMovie } from 'react-icons/md';
import bookingApi from '../../../api/bookingApi';
import styles from './BookingSuccessPage.module.scss';

const BookingSuccessPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) {
      navigate('/');
      return;
    }
    const fetch = async () => {
      try {
        const res = await bookingApi.getById(bookingId);
        setBooking(res.data || res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [bookingId, navigate]);

  if (loading) {
    return (
      <div className={styles.successPage}>
        <p style={{ textAlign: 'center', color: '#aaa', padding: '60px' }}>Đang tải...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className={styles.successPage}>
        <p style={{ textAlign: 'center', color: '#aaa', padding: '60px' }}>Không tìm thấy đơn đặt vé.</p>
      </div>
    );
  }

  const showtime = booking.showtime;
  const movie = showtime?.movie;
  const room = showtime?.room;
  const cinema = room?.cinema;
  const tickets = booking.tickets || [];
  const combos = booking.booking_combos || booking.bookingCombos || [];

  const startDate = showtime?.start_time ? new Date(showtime.start_time) : null;

  return (
    <div className={styles.successPage}>
      <div className={styles.container}>
        <div className={styles.successBanner}>
          <MdCheckCircle className={styles.successIcon} />
          <h1>Đặt vé thành công!</h1>
          <p>Cảm ơn bạn đã đặt vé tại T-CINE. Thông tin chi tiết được hiển thị bên dưới.</p>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <MdConfirmationNumber />
            <div>
              <p className={styles.label}>Mã đơn</p>
              <h2 className={styles.code}>{booking.booking_code}</h2>
            </div>
          </div>

          <div className={styles.cardBody}>
            <div className={styles.row}>
              <MdMovie className={styles.rowIcon} />
              <div>
                <p className={styles.rowLabel}>Phim</p>
                <p className={styles.rowValue}>{movie?.title || '—'}</p>
              </div>
            </div>

            <div className={styles.row}>
              <MdLocationOn className={styles.rowIcon} />
              <div>
                <p className={styles.rowLabel}>Rạp / Phòng</p>
                <p className={styles.rowValue}>
                  {cinema?.name || '—'} — {room?.name || '—'}
                </p>
              </div>
            </div>

            <div className={styles.row}>
              <MdCalendarToday className={styles.rowIcon} />
              <div>
                <p className={styles.rowLabel}>Suất chiếu</p>
                <p className={styles.rowValue}>
                  {startDate
                    ? `${startDate.toLocaleDateString('vi-VN')} - ${startDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
                    : '—'}
                </p>
              </div>
            </div>

            <div className={styles.divider}></div>

            <div className={styles.seatBlock}>
              <p className={styles.rowLabel}>Ghế</p>
              <div className={styles.seatList}>
                {tickets.map((t) => (
                  <span key={t.id} className={styles.seatTag}>{t.seat_label}</span>
                ))}
              </div>
            </div>

            {combos.length > 0 && (
              <>
                <div className={styles.divider}></div>
                <div>
                  <p className={styles.rowLabel}>Combo</p>
                  <ul className={styles.comboList}>
                    {combos.map((c) => (
                      <li key={c.id}>
                        {c.quantity} x {c.combo?.name || '—'} —{' '}
                        {(Number(c.unit_price) * c.quantity).toLocaleString('vi-VN')} VNĐ
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            <div className={styles.divider}></div>

            <div className={styles.amountRow}>
              <span>Tạm tính</span>
              <span>{Number(booking.total_amount).toLocaleString('vi-VN')} VNĐ</span>
            </div>
            {Number(booking.discount_amount) > 0 && (
              <div className={styles.amountRow}>
                <span>Giảm giá</span>
                <span style={{ color: '#16a34a' }}>
                  -{Number(booking.discount_amount).toLocaleString('vi-VN')} VNĐ
                </span>
              </div>
            )}
            <div className={`${styles.amountRow} ${styles.totalRow}`}>
              <span>Đã thanh toán</span>
              <span>{Number(booking.final_amount).toLocaleString('vi-VN')} VNĐ</span>
            </div>

            {booking.payment && (
              <p className={styles.txInfo}>
                Mã giao dịch: <strong>{booking.payment.transaction_code}</strong> ({booking.payment.method?.toUpperCase()})
              </p>
            )}
          </div>

          <div className={styles.actions}>
            <Link to="/lich-su-dat-ve" className={styles.primaryBtn}>
              Xem lịch sử đặt vé
            </Link>
            <Link to="/" className={styles.secondaryBtn}>
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccessPage;
