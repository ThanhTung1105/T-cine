import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdLocationOn, MdCalendarToday, MdAccessTime, MdCheckCircle } from 'react-icons/md';
import movieApi from '../../../api/movieApi';
import axiosClient from '../../../api/axiosClient';
import useBookingStore from '../../../store/useBookingStore';
import useAuthStore from '../../../store/useAuthStore';
import { notify } from '../../../utils/notify';
import styles from './BookingPage.module.scss';

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage';

// === Helpers timezone-safe (local time, KHÔNG dùng toISOString) ===
const pad = (n) => String(n).padStart(2, '0');
const toLocalDateKey = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const DAY_LABELS = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

const BookingPage = () => {
  const { id: movieId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const resetBooking = useBookingStore((s) => s.resetBooking);

  const [movie, setMovie] = useState(null);
  const [groupedByCinema, setGroupedByCinema] = useState([]); // [{cinema, showtimes:[...]}]
  const [selectedCinemaId, setSelectedCinemaId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null); // 'YYYY-MM-DD' local
  const [loading, setLoading] = useState(true);

  // Load thông tin phim
  useEffect(() => {
    if (!movieId) return;
    (async () => {
      try {
        const res = await movieApi.getById(movieId);
        setMovie(res.data);
      } catch (e) { console.error(e); }
    })();
  }, [movieId]);

  // Load TẤT CẢ lịch chiếu của phim (1 lần, không truyền date) → lọc FE
  useEffect(() => {
    if (!movieId) return;
    (async () => {
      setLoading(true);
      try {
        const res = await axiosClient.get(`/movies/${movieId}/showtimes`);
        setGroupedByCinema(res.data || []);
      } catch (e) {
        console.error(e);
        setGroupedByCinema([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [movieId]);

  // Danh sách rạp có lịch chiếu phim này
  const cinemas = useMemo(
    () => groupedByCinema.map((g) => g.cinema).filter(Boolean),
    [groupedByCinema],
  );

  // Showtimes của rạp đang chọn
  const cinemaShowtimes = useMemo(() => {
    if (!selectedCinemaId) return [];
    const group = groupedByCinema.find((g) => g.cinema?.id === selectedCinemaId);
    return group?.showtimes || [];
  }, [groupedByCinema, selectedCinemaId]);

  // Các ngày có suất chiếu ở rạp đang chọn (theo local timezone)
  const availableDates = useMemo(() => {
    const set = new Set();
    cinemaShowtimes.forEach((st) => {
      if (!st.start_time) return;
      const d = new Date(st.start_time);
      if (isNaN(d.getTime())) return;
      set.add(toLocalDateKey(d));
    });
    const arr = Array.from(set).sort();
    return arr.map((key) => {
      const [y, m, day] = key.split('-').map(Number);
      const d = new Date(y, m - 1, day);
      return {
        full: key,
        day: pad(day),
        dayName: DAY_LABELS[d.getDay()],
        monthName: `Tháng ${m}`,
      };
    });
  }, [cinemaShowtimes]);

  // Showtimes theo cả rạp + ngày
  const filteredShowtimes = useMemo(() => {
    if (!selectedDate) return [];
    return cinemaShowtimes
      .filter((st) => {
        const d = new Date(st.start_time);
        return !isNaN(d.getTime()) && toLocalDateKey(d) === selectedDate;
      })
      .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
  }, [cinemaShowtimes, selectedDate]);

  // Auto-pick rạp đầu tiên khi data về
  useEffect(() => {
    if (!selectedCinemaId && cinemas.length > 0) {
      setSelectedCinemaId(cinemas[0].id);
    }
  }, [cinemas, selectedCinemaId]);

  // Khi đổi rạp → auto-pick ngày đầu tiên có suất
  useEffect(() => {
    if (availableDates.length === 0) {
      setSelectedDate(null);
    } else if (!availableDates.some((d) => d.full === selectedDate)) {
      setSelectedDate(availableDates[0].full);
    }
  }, [availableDates]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectShowtime = (showtimeId) => {
    if (!isAuthenticated) {
      notify.warning('Vui lòng đăng nhập để đặt vé.');
      navigate('/dang-nhap');
      return;
    }
    resetBooking();
    navigate(`/chon-ghe/${showtimeId}`);
  };

  const posterSrc = movie?.poster
    ? (movie.poster.startsWith('http') ? movie.poster : `${STORAGE_URL}/${movie.poster}`)
    : null;

  const selectedCinema = cinemas.find((c) => c.id === selectedCinemaId);
  const formatVnd = (n) => new Intl.NumberFormat('vi-VN').format(Math.round(Number(n) || 0));

  return (
    <div className={styles.bookingPage}>
      {/* Stepper */}
      <div className={styles.stepperContainer}>
        <div className={styles.stepperWrapper}>
          <div className={`${styles.step} ${styles.active}`}><div className={styles.stepCircle}>01</div><span className={styles.stepLabel}>Chọn thời gian và địa điểm</span></div>
          <div className={styles.stepLine}></div>
          <div className={styles.step}><div className={styles.stepCircle}>02</div><span className={styles.stepLabel}>Chọn ghế</span></div>
          <div className={styles.stepLine}></div>
          <div className={styles.step}><div className={styles.stepCircle}>03</div><span className={styles.stepLabel}>Bắp nước</span></div>
          <div className={styles.stepLine}></div>
          <div className={styles.step}><div className={styles.stepCircle}>04</div><span className={styles.stepLabel}>Thanh toán</span></div>
        </div>
      </div>

      <div className={styles.container}>
        <h1 className={styles.pageMainTitle}>Bước 1: Chọn thời gian và địa điểm</h1>

        {/* Movie Info */}
        <div className={styles.movieInfoCard}>
          {posterSrc ? (
            <img src={posterSrc} alt={movie?.title} className={styles.posterPlaceholder} style={{ objectFit: 'cover' }} />
          ) : (
            <div className={styles.posterPlaceholder}>Ảnh Phim<br />(Dọc)</div>
          )}
          <div className={styles.movieDetails}>
            <h2 className={styles.movieTitle}>{movie?.title || 'Đang tải...'}</h2>
            <p className={styles.movieDesc}>{movie?.description || ''}</p>
            <ul className={styles.metaList}>
              <li><strong>Đạo diễn:</strong> {movie?.director || 'N/A'}</li>
              <li><strong>Diễn viên:</strong> {movie?.cast_info || 'N/A'}</li>
              <li><strong>Thể loại:</strong> {movie?.genre || 'N/A'}</li>
              <li><strong>Thời lượng:</strong> {movie?.duration ? `${movie.duration} phút` : 'N/A'}</li>
            </ul>
          </div>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#aaa', padding: '60px' }}>Đang tải lịch chiếu...</p>
        ) : cinemas.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Hiện chưa có suất chiếu nào cho phim này.</p>
            <p style={{ fontSize: 13, color: '#888' }}>Vui lòng quay lại sau hoặc chọn phim khác.</p>
          </div>
        ) : (
          <>
            {/* === BƯỚC 1.1: CHỌN RẠP === */}
            <section className={styles.stepBlock}>
              <div className={styles.stepBlockHeader}>
                <span className={styles.stepBadge}>1</span>
                <h3><MdLocationOn /> Chọn rạp chiếu</h3>
              </div>
              <div className={styles.cinemaChipList}>
                {cinemas.map((c) => {
                  const active = c.id === selectedCinemaId;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      className={`${styles.cinemaChip} ${active ? styles.active : ''}`}
                      onClick={() => setSelectedCinemaId(c.id)}
                    >
                      <MdLocationOn className={styles.chipIcon} />
                      <div className={styles.chipText}>
                        <strong>{c.name}</strong>
                        {c.address && <span>{c.address}</span>}
                      </div>
                      {active && <MdCheckCircle className={styles.chipCheck} />}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* === BƯỚC 1.2: CHỌN NGÀY === */}
            <section className={`${styles.stepBlock} ${!selectedCinemaId ? styles.disabled : ''}`}>
              <div className={styles.stepBlockHeader}>
                <span className={styles.stepBadge}>2</span>
                <h3><MdCalendarToday /> Chọn ngày xem</h3>
                {selectedCinema && (
                  <span className={styles.contextHint}>tại {selectedCinema.name}</span>
                )}
              </div>
              {availableDates.length === 0 ? (
                <p className={styles.subEmpty}>Rạp này chưa có lịch chiếu sắp tới.</p>
              ) : (
                <div className={styles.dateStrip}>
                  {availableDates.map((d) => (
                    <button
                      key={d.full}
                      type="button"
                      className={`${styles.dateBtn} ${selectedDate === d.full ? styles.active : ''}`}
                      onClick={() => setSelectedDate(d.full)}
                    >
                      <span className={styles.dayNum}>{d.day}</span>
                      <span className={styles.dayStr}>{d.dayName}</span>
                      <span className={styles.monthStr}>{d.monthName}</span>
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* === BƯỚC 1.3: CHỌN SUẤT === */}
            <section className={`${styles.stepBlock} ${(!selectedCinemaId || !selectedDate) ? styles.disabled : ''}`}>
              <div className={styles.stepBlockHeader}>
                <span className={styles.stepBadge}>3</span>
                <h3><MdAccessTime /> Chọn suất chiếu</h3>
                {selectedDate && (
                  <span className={styles.contextHint}>
                    ngày {selectedDate.split('-').reverse().join('/')}
                  </span>
                )}
              </div>
              {filteredShowtimes.length === 0 ? (
                <p className={styles.subEmpty}>Không có suất chiếu cho ngày này.</p>
              ) : (
                <div className={styles.showtimeGrid}>
                  {filteredShowtimes.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      className={styles.timeBtn}
                      onClick={() => handleSelectShowtime(st.id)}
                    >
                      <span className={styles.time}>
                        {new Date(st.start_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className={styles.room}>{st.room?.name}</span>
                      {st.from_price ? (
                        <span className={styles.priceTag}>từ {formatVnd(st.from_price)}đ</span>
                      ) : null}
                    </button>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
