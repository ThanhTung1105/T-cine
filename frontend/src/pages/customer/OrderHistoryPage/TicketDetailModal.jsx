import React, { useEffect, useState } from 'react';
import {
  MdClose,
  MdLocationOn,
  MdCalendarToday,
  MdEventSeat,
  MdConfirmationNumber,
  MdContentCopy,
  MdMovie,
  MdFastfood,
  MdReceiptLong,
} from 'react-icons/md';
import { confirmDialog } from '../../../utils/notify';
import styles from './TicketDetailModal.module.scss';

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage';

const STATUS_META = {
  paid: { label: 'Đã thanh toán', color: '#16a34a', bg: '#dcfce7' },
  pending: { label: 'Chờ thanh toán', color: '#f59e0b', bg: '#fef3c7' },
  cancelled: { label: 'Đã hủy', color: '#ef4444', bg: '#fee2e2' },
};

const TicketDetailModal = ({ booking, onClose, onCancel }) => {
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);

  // Đóng bằng phím Esc + chặn scroll body khi mở
  useEffect(() => {
    if (!booking) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [booking, onClose]);

  if (!booking) return null;

  const movie = booking.showtime?.movie;
  const cinema = booking.showtime?.room?.cinema;
  const room = booking.showtime?.room;
  const tickets = booking.tickets || [];
  const combos = booking.booking_combos || booking.bookingCombos || [];
  const status = STATUS_META[booking.status] || STATUS_META.pending;

  const startDate = booking.showtime?.start_time ? new Date(booking.showtime.start_time) : null;

  const posterSrc = movie?.poster
    ? movie.poster.startsWith('http')
      ? movie.poster
      : `${STORAGE_URL}/${movie.poster}`
    : null;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=12&data=${encodeURIComponent(
    booking.booking_code || ''
  )}`;

  const handleCopy = () => {
    if (!booking.booking_code) return;
    navigator.clipboard.writeText(booking.booking_code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleCancelClick = async () => {
    if (confirming) return;
    const ok = await confirmDialog({
      title: 'Hủy đơn đặt vé?',
      message: 'Đơn này sẽ bị hủy và các ghế đã chọn sẽ được mở lại cho khách khác.',
      confirmText: 'Hủy đơn',
      cancelText: 'Giữ lại',
      danger: true,
    });
    if (!ok) return;
    setConfirming(true);
    try {
      await onCancel?.(booking.id);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Đóng">
          <MdClose />
        </button>

        {/* Header với poster làm background */}
        <div
          className={styles.hero}
          style={{ backgroundImage: posterSrc ? `url(${posterSrc})` : 'none' }}
        >
          <div className={styles.heroOverlay}>
            <div className={styles.heroContent}>
              {posterSrc ? (
                <img src={posterSrc} alt={movie?.title} className={styles.heroPoster} />
              ) : (
                <div className={styles.heroPosterPlaceholder}>
                  <MdMovie />
                </div>
              )}
              <div className={styles.heroText}>
                <span
                  className={styles.statusBadge}
                  style={{ color: status.color, background: status.bg }}
                >
                  {status.label}
                </span>
                <h2 className={styles.movieTitle}>{movie?.title || '—'}</h2>
                <p className={styles.movieMeta}>
                  {movie?.genre && <span>{movie.genre}</span>}
                  {movie?.duration && <span>· {movie.duration} phút</span>}
                  {movie?.age_rating && <span>· {movie.age_rating}</span>}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Body 2 cột: thông tin + QR */}
        <div className={styles.body}>
          <div className={styles.leftCol}>
            <h3 className={styles.sectionTitle}>Thông tin suất chiếu</h3>

            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <MdLocationOn className={styles.infoIcon} />
                <div>
                  <p className={styles.infoLabel}>Rạp / Phòng</p>
                  <p className={styles.infoValue}>
                    {cinema?.name || '—'}
                    <br />
                    <span className={styles.subValue}>{room?.name || '—'}</span>
                  </p>
                </div>
              </div>

              <div className={styles.infoItem}>
                <MdCalendarToday className={styles.infoIcon} />
                <div>
                  <p className={styles.infoLabel}>Suất chiếu</p>
                  <p className={styles.infoValue}>
                    {startDate
                      ? `${startDate.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}`
                      : '—'}
                    <br />
                    <span className={styles.subValue}>
                      Bắt đầu:{' '}
                      {startDate
                        ? startDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                        : '—'}
                    </span>
                  </p>
                </div>
              </div>

              <div className={styles.infoItem}>
                <MdEventSeat className={styles.infoIcon} />
                <div>
                  <p className={styles.infoLabel}>Ghế ({tickets.length})</p>
                  <div className={styles.seatList}>
                    {tickets.length === 0 ? (
                      <span className={styles.subValue}>—</span>
                    ) : (
                      tickets.map((t) => (
                        <span
                          key={t.id}
                          className={`${styles.seatTag} ${styles[t.seat_type] || ''}`}
                        >
                          {t.seat_label}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {combos.length > 0 && (
              <>
                <h3 className={styles.sectionTitle}>
                  <MdFastfood /> Combo bắp nước
                </h3>
                <ul className={styles.comboList}>
                  {combos.map((c) => (
                    <li key={c.id}>
                      <span>
                        <strong>{c.quantity} x</strong> {c.combo?.name || '—'}
                      </span>
                      <span>{(Number(c.unit_price) * c.quantity).toLocaleString('vi-VN')} VNĐ</span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <h3 className={styles.sectionTitle}>
              <MdReceiptLong /> Thanh toán
            </h3>
            <div className={styles.priceTable}>
              <div className={styles.priceRow}>
                <span>Tạm tính</span>
                <span>{Number(booking.total_amount).toLocaleString('vi-VN')} VNĐ</span>
              </div>
              {Number(booking.discount_amount) > 0 && (
                <div className={styles.priceRow}>
                  <span>Giảm giá</span>
                  <span style={{ color: '#16a34a' }}>
                    -{Number(booking.discount_amount).toLocaleString('vi-VN')} VNĐ
                  </span>
                </div>
              )}
              <div className={`${styles.priceRow} ${styles.totalRow}`}>
                <span>Tổng cộng</span>
                <span>{Number(booking.final_amount).toLocaleString('vi-VN')} VNĐ</span>
              </div>
              {booking.payment && (
                <div className={styles.paymentInfo}>
                  <p>
                    Phương thức:{' '}
                    <strong>{(booking.payment.method || '').toUpperCase()}</strong>
                  </p>
                  <p>
                    Mã giao dịch: <strong>{booking.payment.transaction_code}</strong>
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className={styles.rightCol}>
            <div className={styles.qrCard}>
              <p className={styles.qrLabel}>Vé điện tử — Đưa mã QR cho nhân viên check-in</p>
              {booking.status === 'paid' ? (
                <img src={qrUrl} alt="QR" className={styles.qrImage} />
              ) : (
                <div className={styles.qrBlocked}>
                  <p>{status.label}</p>
                  <span>QR sẽ hiển thị sau khi thanh toán</span>
                </div>
              )}
              <div className={styles.bookingCodeBox}>
                <div>
                  <span className={styles.codeLabel}>
                    <MdConfirmationNumber /> Mã đơn
                  </span>
                  <strong className={styles.codeValue}>{booking.booking_code}</strong>
                </div>
                <button className={styles.copyBtn} onClick={handleCopy} type="button">
                  <MdContentCopy /> {copied ? 'Đã chép' : 'Chép'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className={styles.footer}>
          <button className={styles.secondaryBtn} onClick={onClose} type="button">
            Đóng
          </button>
          {booking.status === 'pending' && (
            <button
              className={styles.dangerBtn}
              onClick={handleCancelClick}
              type="button"
              disabled={confirming}
            >
              {confirming ? 'Đang hủy...' : 'Hủy đơn'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetailModal;
