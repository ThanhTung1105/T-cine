import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import bookingApi from '../../../api/bookingApi';
import useBookingStore from '../../../store/useBookingStore';
import { notify, confirmDialog } from '../../../utils/notify';
import { getErrorMessage } from '../../../utils/helpers';
import styles from './MockPaymentPage.module.scss';

const METHOD_CONFIG = {
  zalopay: {
    name: 'ZaloPay',
    color: '#0068ff',
    logo: 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay-Square.png',
  },
  vnpay: {
    name: 'VNPAY',
    color: '#005baa',
    logo: 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-VNPAY-QR-1.png',
  },
  momo: {
    name: 'MoMo',
    color: '#a50064',
    logo: 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-MoMo-Square.png',
  },
};

const MockPaymentPage = () => {
  const { bookingId: bookingIdParam } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const resetBooking = useBookingStore((s) => s.resetBooking);
  const currentBookingId = useBookingStore((s) => s.currentBookingId);

  const bookingId = bookingIdParam || currentBookingId;
  const method = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('method') || 'zalopay';
  }, [location.search]);
  const cfg = METHOD_CONFIG[method] || METHOD_CONFIG.zalopay;

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 phút

  // Load booking để hiển thị
  useEffect(() => {
    if (!bookingId) {
      navigate('/');
      return;
    }
    const fetch = async () => {
      try {
        const res = await bookingApi.getById(bookingId);
        const b = res.data || res;
        setBooking(b);
        // Nếu booking đã thanh toán rồi -> nhảy thẳng đến trang thành công
        if (b?.status === 'paid') {
          navigate(`/dat-ve-thanh-cong/${b.id}`, { replace: true });
          return;
        }
        if (b?.status === 'cancelled') {
          notify.warning('Đơn này đã bị hủy.');
          navigate('/');
          return;
        }
      } catch (e) {
        console.error(e);
        notify.error(getErrorMessage(e, 'Không tìm thấy đơn đặt vé.'));
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  // Đếm ngược — hết giờ thì hủy đơn
  useEffect(() => {
    if (loading || !booking || booking.status !== 'pending') return;
    if (timeLeft <= 0) {
      handleCancel(true);
      return;
    }
    const t = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, loading, booking]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const handleSuccess = async () => {
    if (processing) return;
    setProcessing(true);
    try {
      await bookingApi.confirmPayment(bookingId, { method });
      resetBooking();
      navigate(`/dat-ve-thanh-cong/${bookingId}`, { replace: true });
    } catch (e) {
      notify.error(getErrorMessage(e, 'Xác nhận thanh toán thất bại.'));
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async (auto = false) => {
    if (processing) return;
    if (!auto) {
      const ok = await confirmDialog({
        title: 'Hủy giao dịch?',
        message: 'Bạn có chắc muốn hủy giao dịch này? Ghế đã chọn sẽ được mở lại cho khách khác.',
        confirmText: 'Hủy giao dịch',
        cancelText: 'Tiếp tục thanh toán',
        danger: true,
      });
      if (!ok) return;
    }
    setProcessing(true);
    try {
      await bookingApi.cancel(bookingId);
    } catch (e) {
      // ignore
    } finally {
      if (auto) notify.warning('Thời gian thanh toán đã hết. Đơn đặt vé đã bị hủy.');
      resetBooking();
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className={styles.mockPaymentPage} style={{ '--theme-color': cfg.color }}>
        <div className={styles.paymentBox}>
          <div className={styles.content}>
            <p className={styles.instruction}>Đang tải thông tin đơn hàng...</p>
          </div>
        </div>
      </div>
    );
  }

  const amount = booking?.final_amount || 0;
  const txCode = booking?.booking_code || `TCINE${Math.floor(100000 + Math.random() * 900000)}`;

  return (
    <div className={styles.mockPaymentPage} style={{ '--theme-color': cfg.color }}>
      <div className={styles.paymentBox}>
        <div className={styles.header}>
          <img src={cfg.logo} alt={cfg.name} className={styles.logo} />
          <h2>Cổng thanh toán {cfg.name}</h2>
        </div>

        <div className={styles.content}>
          <p className={styles.instruction}>
            Quét mã QR bằng ứng dụng {cfg.name} để thanh toán
          </p>

          <div className={styles.qrWrapper}>
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg"
              alt="QR Code"
              className={styles.qrCode}
            />
            <div className={styles.amount}>
              {Number(amount).toLocaleString('vi-VN')} VNĐ
            </div>
          </div>

          <div className={styles.orderInfo}>
            <div className={styles.infoRow}>
              <span>Đơn hàng:</span>
              <strong>
                {booking?.showtime?.movie?.title
                  ? `Vé phim "${booking.showtime.movie.title}"`
                  : 'Vé xem phim T-CINE'}
              </strong>
            </div>
            <div className={styles.infoRow}>
              <span>Mã giao dịch:</span>
              <strong>{txCode}</strong>
            </div>
            <div className={styles.infoRow}>
              <span>Số vé:</span>
              <strong>{booking?.tickets?.length || 0}</strong>
            </div>
          </div>

          <div className={styles.timer}>
            Thời gian còn lại: <strong>{formatTime(timeLeft)}</strong>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.successBtn}
            onClick={handleSuccess}
            disabled={processing}
          >
            {processing ? 'Đang xử lý...' : 'Mô phỏng Thanh toán Thành công'}
          </button>
          <button
            className={styles.cancelBtn}
            onClick={() => handleCancel(false)}
            disabled={processing}
          >
            Hủy giao dịch
          </button>
        </div>

        <p className={styles.mockNote}>
          * Đây là cổng thanh toán mô phỏng dùng cho mục đích demo, không thực hiện giao dịch thật.
        </p>
      </div>
    </div>
  );
};

export default MockPaymentPage;
