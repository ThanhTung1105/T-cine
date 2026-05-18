import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MdHome,
  MdChevronRight,
  MdLocationOn,
  MdCalendarToday,
  MdEventSeat,
  MdConfirmationNumber,
  MdSearch,
} from 'react-icons/md';
import bookingApi from '../../../api/bookingApi';
import TicketDetailModal from './TicketDetailModal';
import styles from './OrderHistoryPage.module.scss';

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage';

const STATUS_TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'paid', label: 'Đã thanh toán' },
  { id: 'pending', label: 'Chờ thanh toán' },
  { id: 'cancelled', label: 'Đã hủy' },
];

const STATUS_META = {
  paid: { label: 'Đã thanh toán', color: '#16a34a', bg: '#dcfce7' },
  pending: { label: 'Chờ thanh toán', color: '#f59e0b', bg: '#fef3c7' },
  cancelled: { label: 'Đã hủy', color: '#ef4444', bg: '#fee2e2' },
};

const OrderHistoryPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null); // booking object đang mở modal

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingApi.getMyBookings({ per_page: 50 });
      // res = paginate object: { data: [...], current_page, ... }
      const list = res.data || res?.data?.data || [];
      setBookings(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error(e);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filtered = useMemo(() => {
    let list = bookings;
    if (activeTab !== 'all') list = list.filter((b) => b.status === activeTab);
    if (search.trim()) {
      const kw = search.toLowerCase();
      list = list.filter(
        (b) =>
          b.booking_code?.toLowerCase().includes(kw) ||
          b.showtime?.movie?.title?.toLowerCase().includes(kw)
      );
    }
    return list;
  }, [bookings, activeTab, search]);

  const counts = useMemo(() => {
    const c = { all: bookings.length, paid: 0, pending: 0, cancelled: 0 };
    bookings.forEach((b) => {
      if (c[b.status] !== undefined) c[b.status] += 1;
    });
    return c;
  }, [bookings]);

  const handleCancel = async (id) => {
    try {
      await bookingApi.cancel(id);
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: 'cancelled' } : b))
      );
      setSelected((prev) => (prev?.id === id ? { ...prev, status: 'cancelled' } : prev));
    } catch (e) {
      alert(e.response?.data?.message || 'Hủy đơn thất bại!');
    }
  };

  return (
    <div className={styles.historyPage}>
      <div className={styles.breadcrumbWrapper}>
        <div className={styles.container}>
          <ul className={styles.breadcrumb}>
            <li>
              <Link to="/">
                <MdHome className={styles.homeIcon} /> Trang chủ
              </Link>
            </li>
            <li>
              <MdChevronRight className={styles.separator} />
            </li>
            <li className={styles.active}>Lịch sử đặt vé</li>
          </ul>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.pageTitle}>Lịch Sử Đặt Vé</h1>
            <p className={styles.pageSubtitle}>
              Bấm vào một vé bất kỳ để xem chi tiết và mã QR check-in.
            </p>
          </div>

          <div className={styles.searchBox}>
            <MdSearch />
            <input
              type="text"
              placeholder="Tìm theo mã đơn hoặc tên phim..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.tabsRow}>
          {STATUS_TABS.map((t) => (
            <button
              key={t.id}
              className={`${styles.tab} ${activeTab === t.id ? styles.active : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
              <span className={styles.count}>{counts[t.id] || 0}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className={styles.emptyState}>Đang tải lịch sử đặt vé...</div>
        ) : filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>Chưa có đơn đặt vé nào</p>
            <p className={styles.emptyDesc}>
              {activeTab === 'all'
                ? 'Đặt vé đầu tiên của bạn để xem lịch sử tại đây.'
                : 'Không có đơn nào ở trạng thái này.'}
            </p>
            <Link to="/phim-dang-chieu" className={styles.emptyBtn}>
              Đặt vé ngay
            </Link>
          </div>
        ) : (
          <div className={styles.ticketGrid}>
            {filtered.map((booking) => {
              const movie = booking.showtime?.movie;
              const cinema = booking.showtime?.room?.cinema;
              const room = booking.showtime?.room;
              const status = STATUS_META[booking.status] || STATUS_META.pending;
              const posterSrc = movie?.poster
                ? movie.poster.startsWith('http')
                  ? movie.poster
                  : `${STORAGE_URL}/${movie.poster}`
                : null;
              const startDate = booking.showtime?.start_time
                ? new Date(booking.showtime.start_time)
                : null;
              return (
                <button
                  type="button"
                  key={booking.id}
                  className={styles.ticketCard}
                  onClick={() => setSelected(booking)}
                >
                  <div className={styles.posterBlock}>
                    {posterSrc ? (
                      <img src={posterSrc} alt={movie?.title} />
                    ) : (
                      <div className={styles.posterPlaceholder}>Poster</div>
                    )}
                  </div>

                  <div className={styles.perforation} aria-hidden />

                  <div className={styles.infoBlock}>
                    <div className={styles.topRow}>
                      <span
                        className={styles.statusBadge}
                        style={{ color: status.color, background: status.bg }}
                      >
                        {status.label}
                      </span>
                      <span className={styles.bookingCode}>
                        <MdConfirmationNumber /> {booking.booking_code}
                      </span>
                    </div>

                    <h3 className={styles.movieTitle}>{movie?.title || 'Phim'}</h3>

                    <div className={styles.metaList}>
                      <p>
                        <MdLocationOn /> {cinema?.name || '—'} · {room?.name || '—'}
                      </p>
                      <p>
                        <MdCalendarToday />{' '}
                        {startDate
                          ? `${startDate.toLocaleDateString('vi-VN')} - ${startDate.toLocaleTimeString(
                              'vi-VN',
                              { hour: '2-digit', minute: '2-digit' }
                            )}`
                          : '—'}
                      </p>
                      <p>
                        <MdEventSeat />{' '}
                        Ghế:{' '}
                        <strong>
                          {(booking.tickets || []).map((t) => t.seat_label).join(', ') || '—'}
                        </strong>
                      </p>
                    </div>

                    <div className={styles.bottomRow}>
                      <div className={styles.amount}>
                        {Number(booking.final_amount).toLocaleString('vi-VN')} VNĐ
                      </div>
                      <span className={styles.viewDetail}>Xem chi tiết →</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <TicketDetailModal
        booking={selected}
        onClose={() => setSelected(null)}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default OrderHistoryPage;
