import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdLocationOn, MdCalendarToday, MdAccessTime, MdCheckCircle, MdChevronLeft, MdChevronRight, MdDateRange } from 'react-icons/md';
import movieApi from '../../../api/movieApi';
import cinemaApi from '../../../api/cinemaApi';
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
const DAY_LABELS_FULL = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
const MONTH_NAMES = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

// Generate dates for a week starting from a given base date
const getWeekDates = (baseDate) => {
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + i);
    dates.push({
      full: toLocalDateKey(d),
      day: pad(d.getDate()),
      dayName: DAY_LABELS[d.getDay()],
      dayNameFull: DAY_LABELS_FULL[d.getDay()],
      monthName: MONTH_NAMES[d.getMonth()],
      month: d.getMonth() + 1,
      year: d.getFullYear(),
      dateObj: new Date(d),
      isToday: toLocalDateKey(d) === toLocalDateKey(new Date()),
    });
  }
  return dates;
};

// Generate a full month calendar grid
const getCalendarMonth = (year, month) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = firstDay.getDay(); // 0=CN
  const totalDays = lastDay.getDate();

  const cells = [];
  // Padding before
  for (let i = 0; i < startPad; i++) {
    cells.push(null);
  }
  // Actual days
  for (let d = 1; d <= totalDays; d++) {
    const dateObj = new Date(year, month, d);
    cells.push({
      full: toLocalDateKey(dateObj),
      day: d,
      dateObj,
      isToday: toLocalDateKey(dateObj) === toLocalDateKey(new Date()),
      isPast: dateObj < new Date(new Date().setHours(0, 0, 0, 0)),
    });
  }
  return cells;
};

const BookingPage = () => {
  const { id: movieId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const resetBooking = useBookingStore((s) => s.resetBooking);

  const [movie, setMovie] = useState(null);
  const [allCinemas, setAllCinemas] = useState([]); // TẤT CẢ rạp trong hệ thống
  const [groupedByCinema, setGroupedByCinema] = useState([]); // [{cinema, showtimes:[...]}]
  const [selectedCinemaId, setSelectedCinemaId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null); // 'YYYY-MM-DD' local
  const [loading, setLoading] = useState(true);

  // Week navigation
  const [weekOffset, setWeekOffset] = useState(0);
  // Calendar popup
  const [showCalendar, setShowCalendar] = useState(false);
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const calendarRef = useRef(null);

  // Step reveal refs for animation
  const step2Ref = useRef(null);
  const step3Ref = useRef(null);

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

  // Load TẤT CẢ rạp trong hệ thống
  useEffect(() => {
    (async () => {
      try {
        const res = await cinemaApi.getAll();
        setAllCinemas(res.data || []);
      } catch (e) {
        console.error(e);
        setAllCinemas([]);
      }
    })();
  }, []);

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

  // Set các ID rạp có suất chiếu cho phim này (để đánh dấu)
  const cinemaIdsWithShowtimes = useMemo(() => {
    const ids = new Set();
    groupedByCinema.forEach((g) => {
      if (g.cinema?.id) ids.add(g.cinema.id);
    });
    return ids;
  }, [groupedByCinema]);

  // Showtimes của rạp đang chọn
  const cinemaShowtimes = useMemo(() => {
    if (!selectedCinemaId) return [];
    const group = groupedByCinema.find((g) => g.cinema?.id === selectedCinemaId);
    return group?.showtimes || [];
  }, [groupedByCinema, selectedCinemaId]);

  // Các ngày có suất chiếu ở rạp đang chọn (dạng Set cho tra nhanh)
  const availableDateSet = useMemo(() => {
    const set = new Set();
    cinemaShowtimes.forEach((st) => {
      if (!st.start_time) return;
      const d = new Date(st.start_time);
      if (isNaN(d.getTime())) return;
      set.add(toLocalDateKey(d));
    });
    return set;
  }, [cinemaShowtimes]);

  // Generate week dates based on current offset
  const today = useMemo(() => new Date(), []);
  const weekDates = useMemo(() => {
    const base = new Date(today);
    base.setDate(today.getDate() + weekOffset * 7);
    return getWeekDates(base);
  }, [today, weekOffset]);

  // Calendar month cells
  const calendarCells = useMemo(
    () => getCalendarMonth(calYear, calMonth),
    [calYear, calMonth],
  );

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

  // KHÔNG auto-pick rạp (yêu cầu #1)

  // Khi đổi rạp → reset date, reset weekOffset
  useEffect(() => {
    setSelectedDate(null);
    setWeekOffset(0);
  }, [selectedCinemaId]);

  // Close calendar on outside click
  useEffect(() => {
    const handler = (e) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setShowCalendar(false);
      }
    };
    if (showCalendar) {
      document.addEventListener('mousedown', handler);
    }
    return () => document.removeEventListener('mousedown', handler);
  }, [showCalendar]);

  const handleSelectCinema = useCallback((cinemaId) => {
    setSelectedCinemaId(cinemaId);
    // Smooth scroll to step 2 after a short delay for animation
    setTimeout(() => {
      step2Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
  }, []);

  const handleSelectDate = useCallback((dateKey) => {
    setSelectedDate(dateKey);
    setShowCalendar(false);
    // Smooth scroll to step 3
    setTimeout(() => {
      step3Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
  }, []);

  const handleCalendarDateSelect = useCallback((dateKey) => {
    // Check if date is in the current week view; if not, adjust week offset
    const targetDate = new Date(dateKey);
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((targetDate - todayStart) / (1000 * 60 * 60 * 24));
    const newWeekOffset = Math.floor(diffDays / 7);
    setWeekOffset(newWeekOffset);
    setSelectedDate(dateKey);
    setShowCalendar(false);
    // Smooth scroll to step 3
    setTimeout(() => {
      step3Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
  }, [today]);

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

  const selectedCinema = allCinemas.find((c) => c.id === selectedCinemaId);
  const selectedCinemaHasShowtimes = selectedCinemaId ? cinemaIdsWithShowtimes.has(selectedCinemaId) : false;
  const formatVnd = (n) => new Intl.NumberFormat('vi-VN').format(Math.round(Number(n) || 0));

  // Week navigation label
  const weekLabel = weekDates.length > 0
    ? `${weekDates[0].day}/${weekDates[0].month} - ${weekDates[6].day}/${weekDates[6].month}/${weekDates[6].year}`
    : '';

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
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Đang tải lịch chiếu...</p>
          </div>
        ) : (
          <>
            {/* === BƯỚC 1: CHỌN RẠP (hiện TẤT CẢ rạp) === */}
            <section className={styles.stepBlock}>
              <div className={styles.stepBlockHeader}>
                <span className={`${styles.stepBadge} ${selectedCinemaId ? styles.completed : ''}`}>
                  {selectedCinemaId ? <MdCheckCircle /> : '1'}
                </span>
                <h3><MdLocationOn /> Chọn rạp chiếu</h3>
                <span className={styles.cinemaCount}>{allCinemas.length} rạp</span>
              </div>
              <div className={styles.cinemaChipList}>
                {allCinemas.map((c) => {
                  const active = c.id === selectedCinemaId;
                  const hasShowtimes = cinemaIdsWithShowtimes.has(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      className={`${styles.cinemaChip} ${active ? styles.active : ''} ${!hasShowtimes ? styles.noShowtime : ''}`}
                      onClick={() => handleSelectCinema(c.id)}
                    >
                      <div className={styles.chipIconWrap}>
                        <MdLocationOn className={styles.chipIcon} />
                      </div>
                      <div className={styles.chipText}>
                        <strong>{c.name}</strong>
                        {c.address && <span>{c.address}</span>}
                        {!hasShowtimes && <span className={styles.noShowtimeLabel}>Không có suất chiếu</span>}
                      </div>
                      {active && <MdCheckCircle className={styles.chipCheck} />}
                    </button>
                  );
                })}
              </div>
              {!selectedCinemaId && (
                <p className={styles.stepHint}>
                  <MdLocationOn /> Vui lòng chọn một rạp chiếu để tiếp tục
                </p>
              )}
            </section>

            {/* === BƯỚC 2: CHỌN NGÀY (hiện khi đã chọn rạp) === */}
            <div
              ref={step2Ref}
              className={`${styles.stepReveal} ${selectedCinemaId ? styles.visible : ''} ${showCalendar ? styles.hasOpenCalendar : ''}`}
            >
              <section className={styles.stepBlock}>
                <div className={styles.stepBlockHeader}>
                  <span className={`${styles.stepBadge} ${selectedDate ? styles.completed : ''}`}>
                    {selectedDate ? <MdCheckCircle /> : '2'}
                  </span>
                  <h3><MdCalendarToday /> Chọn ngày xem</h3>
                  {selectedCinema && (
                    <span className={styles.contextHint}>tại {selectedCinema.name}</span>
                  )}
                </div>

                {/* Nếu rạp không có suất chiếu → thông báo */}
                {!selectedCinemaHasShowtimes ? (
                  <div className={styles.noShowtimeState}>
                    <MdAccessTime style={{ fontSize: 40, color: '#d1d5db' }} />
                    <p className={styles.noShowtimeMsg}>Rạp <strong>{selectedCinema?.name}</strong> hiện không có suất chiếu cho phim này.</p>
                    <p className={styles.noShowtimeHint}>Vui lòng chọn rạp khác hoặc quay lại sau.</p>
                  </div>
                ) : (
                  <>
                    {/* Week navigation */}
                    <div className={styles.dateNavigation}>
                      <button
                        type="button"
                        className={styles.navArrow}
                        onClick={() => setWeekOffset((v) => Math.max(0, v - 1))}
                        disabled={weekOffset === 0}
                        title="Tuần trước"
                      >
                        <MdChevronLeft />
                      </button>

                      <span className={styles.weekLabel}>{weekLabel}</span>

                      <button
                        type="button"
                        className={styles.navArrow}
                        onClick={() => setWeekOffset((v) => v + 1)}
                        title="Tuần sau"
                      >
                        <MdChevronRight />
                      </button>

                      {/* Calendar picker button */}
                      <div className={styles.calendarPickerWrap} ref={calendarRef}>
                        <button
                          type="button"
                          className={`${styles.calendarBtn} ${showCalendar ? styles.active : ''}`}
                          onClick={() => setShowCalendar((v) => !v)}
                          title="Chọn ngày từ lịch"
                        >
                          <MdDateRange />
                        </button>

                        {/* Calendar popup */}
                        {showCalendar && (
                          <div className={styles.calendarPopup}>
                            <div className={styles.calendarPopupHeader}>
                              <button type="button" onClick={() => {
                                if (calMonth === 0) { setCalMonth(11); setCalYear((y) => y - 1); }
                                else { setCalMonth((m) => m - 1); }
                              }}><MdChevronLeft /></button>
                              <span>{MONTH_NAMES[calMonth]} {calYear}</span>
                              <button type="button" onClick={() => {
                                if (calMonth === 11) { setCalMonth(0); setCalYear((y) => y + 1); }
                                else { setCalMonth((m) => m + 1); }
                              }}><MdChevronRight /></button>
                            </div>
                            <div className={styles.calendarGrid}>
                              {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((lbl) => (
                                <div key={lbl} className={styles.calDayHeader}>{lbl}</div>
                              ))}
                              {calendarCells.map((cell, i) => {
                                if (!cell) return <div key={`pad-${i}`} className={styles.calDayEmpty} />;
                                const hasShowtime = availableDateSet.has(cell.full);
                                const isSelected = selectedDate === cell.full;
                                return (
                                  <button
                                    key={cell.full}
                                    type="button"
                                    disabled={cell.isPast}
                                    className={[
                                      styles.calDay,
                                      cell.isToday ? styles.today : '',
                                      hasShowtime ? styles.hasShowtime : '',
                                      isSelected ? styles.selected : '',
                                      cell.isPast ? styles.past : '',
                                    ].join(' ')}
                                    onClick={() => !cell.isPast && handleCalendarDateSelect(cell.full)}
                                    title={hasShowtime ? 'Có suất chiếu' : (cell.isPast ? '' : 'Không có suất chiếu')}
                                  >
                                    {cell.day}
                                    {hasShowtime && <span className={styles.calDot} />}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Date strip — full week */}
                    <div className={styles.dateStrip}>
                      {weekDates.map((d) => {
                        const hasShowtime = availableDateSet.has(d.full);
                        const isSelected = selectedDate === d.full;
                        return (
                          <button
                            key={d.full}
                            type="button"
                            className={[
                              styles.dateBtn,
                              isSelected ? styles.active : '',
                              hasShowtime ? '' : styles.noShowtime,
                              d.isToday ? styles.today : '',
                            ].join(' ')}
                            onClick={() => handleSelectDate(d.full)}
                            title={hasShowtime ? `${d.dayNameFull} — có suất chiếu` : `${d.dayNameFull} — không có suất chiếu`}
                          >
                            <span className={styles.dayNum}>{d.day}</span>
                            <span className={styles.dayStr}>{d.dayName}</span>
                            <span className={styles.monthStr}>{d.monthName}</span>
                            {d.isToday && <span className={styles.todayTag}>Hôm nay</span>}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </section>
            </div>

            {/* === BƯỚC 3: CHỌN SUẤT (hiện khi đã chọn ngày) === */}
            <div
              ref={step3Ref}
              className={`${styles.stepReveal} ${selectedDate ? styles.visible : ''}`}
            >
              <section className={styles.stepBlock}>
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
                          {new Date(st.start_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })}
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
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
