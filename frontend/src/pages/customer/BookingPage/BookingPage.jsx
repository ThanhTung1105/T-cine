import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { MdLocationOn, MdCalendarToday } from 'react-icons/md';
import movieApi from '../../../api/movieApi';
import axiosClient from '../../../api/axiosClient';
import useBookingStore from '../../../store/useBookingStore';
import useAuthStore from '../../../store/useAuthStore';
import styles from './BookingPage.module.scss';

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage';

const BookingPage = () => {
  const { id: movieId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const resetBooking = useBookingStore((s) => s.resetBooking);

  const [movie, setMovie] = useState(null);
  const [showtimeData, setShowtimeData] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [dates, setDates] = useState([]);

  const handleSelectShowtime = (showtimeId) => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để đặt vé.');
      navigate('/dang-nhap');
      return;
    }
    // Bắt đầu luồng đặt vé mới — reset state cũ
    resetBooking();
    navigate(`/chon-ghe/${showtimeId}`);
  };

  // Tạo danh sách 7 ngày kế tiếp
  useEffect(() => {
    const today = new Date();
    const dateList = [];
    const days = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dateList.push({
        full: d.toISOString().split('T')[0],
        day: String(d.getDate()).padStart(2, '0'),
        dayName: days[d.getDay()],
      });
    }
    setDates(dateList);
    setSelectedDate(dateList[0].full);
  }, []);

  // Load thông tin phim
  useEffect(() => {
    if (!movieId) return;
    const fetchMovie = async () => {
      try {
        const res = await movieApi.getById(movieId);
        setMovie(res.data);
      } catch (e) { console.error(e); }
    };
    fetchMovie();
  }, [movieId]);

  // Load lịch chiếu theo phim + ngày
  useEffect(() => {
    if (!movieId || !selectedDate) return;
    const fetchShowtimes = async () => {
      setLoading(true);
      try {
        const res = await axiosClient.get(`/movies/${movieId}/showtimes`, { params: { date: selectedDate } });
        setShowtimeData(res.data || []);
      } catch (e) { setShowtimeData([]); }
      finally { setLoading(false); }
    };
    fetchShowtimes();
  }, [movieId, selectedDate]);

  const posterSrc = movie?.poster ? (movie.poster.startsWith('http') ? movie.poster : `${STORAGE_URL}/${movie.poster}`) : null;

  return (
    <div className={styles.bookingPage}>
      {/* Stepper */}
      <div className={styles.stepperContainer}>
        <div className={styles.stepperWrapper}>
          <div className={`${styles.step} ${styles.active}`}><div className={styles.stepCircle}>01</div><span className={styles.stepLabel}>Chọn thời gian và địa điểm</span></div>
          <div className={styles.stepLine}></div>
          <div className={styles.step}><div className={styles.stepCircle}>02</div><span className={styles.stepLabel}>Chọn ghế</span></div>
          <div className={styles.stepLine}></div>
          <div className={styles.step}><div className={styles.stepCircle}>03</div><span className={styles.stepLabel}>Thanh toán</span></div>
          <div className={styles.stepLine}></div>
          <div className={styles.step}><div className={styles.stepCircle}>04</div><span className={styles.stepLabel}>Hoàn tất</span></div>
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

        <div className={styles.bookingContent}>
          {/* Cinema & Showtime List */}
          <div className={styles.mainColumn}>
            <div className={styles.cinemaList}>
              {loading ? (
                <p style={{ textAlign: 'center', color: '#aaa', padding: '40px' }}>Đang tải lịch chiếu...</p>
              ) : showtimeData.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#aaa', padding: '40px' }}>Không có suất chiếu cho ngày này.</p>
              ) : (
                showtimeData.map((item) => (
                  <div key={item.cinema?.id} className={styles.cinemaItem}>
                    <div className={styles.cinemaHeader}>
                      <MdLocationOn className={styles.locationIcon} />
                      <div>
                        <h3 className={styles.cinemaName}>{item.cinema?.name}</h3>
                        <p className={styles.cinemaAddress}>{item.cinema?.address}</p>
                      </div>
                    </div>
                    <div className={styles.formatLabel}>2D Phụ Đề Việt</div>
                    <div className={styles.showtimeGrid}>
                      {(item.showtimes || []).map((st) => (
                        <button
                          type="button"
                          key={st.id}
                          className={styles.timeBtn}
                          onClick={() => handleSelectShowtime(st.id)}
                        >
                          <span className={styles.time}>{new Date(st.start_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                          <span className={styles.seats}>{st.room?.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Date Selector */}
          <div className={styles.sideColumn}>
            <div className={styles.calendarWidget}>
              <div className={styles.calendarHeader}>
                <MdCalendarToday className={styles.calIcon} />
                <h3>Chọn ngày xem</h3>
              </div>
              <div className={styles.dateSelector}>
                <div className={styles.dateList}>
                  {dates.map((d) => (
                    <button key={d.full} className={`${styles.dateBtn} ${selectedDate === d.full ? styles.active : ''}`} onClick={() => setSelectedDate(d.full)}>
                      <span className={styles.dayNum}>{d.day}</span>
                      <span className={styles.dayStr}>{d.dayName}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
