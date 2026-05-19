import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import showtimeApi from '../../../api/showtimeApi';
import useBookingStore from '../../../store/useBookingStore';
import styles from './SeatSelectionPage.module.scss';

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage';

const SeatSelectionPage = () => {
  const { showtimeId } = useParams();
  const navigate = useNavigate();

  const {
    showtime,
    movie,
    cinema,
    room,
    selectedSeats,
    setShowtimeContext,
    toggleSeat,
    clearSeats,
  } = useBookingStore();

  const [seats, setSeats] = useState([]);
  const [prices, setPrices] = useState({ normal: 0, vip: 0, couple: 0 });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!showtimeId) return;
    const fetch = async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await showtimeApi.getById(showtimeId);
        const d = res.data;
        // Nếu user mở suất chiếu khác -> reset ghế cũ
        if (!showtime || Number(showtime.id) !== Number(d.showtime.id)) {
          clearSeats();
        }
        setShowtimeContext({
          showtime: d.showtime,
          movie: d.movie,
          cinema: d.cinema,
          room: d.room,
        });
        setSeats(d.seats || []);
        setPrices(d.prices || { normal: 0, vip: 0, couple: 0 });
      } catch (e) {
        console.error(e);
        setErr('Không tải được dữ liệu suất chiếu.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showtimeId]);

  // Group seats theo hàng
  const seatsByRow = useMemo(() => {
    const map = {};
    seats.forEach((s) => {
      if (!map[s.row]) map[s.row] = [];
      map[s.row].push(s);
    });
    Object.keys(map).forEach((r) =>
      map[r].sort((a, b) => Number(a.column_num) - Number(b.column_num))
    );
    return map;
  }, [seats]);

  const sortedRows = useMemo(() => Object.keys(seatsByRow).sort(), [seatsByRow]);

  const isSelected = (id) => selectedSeats.some((s) => s.id === id);

  const handleClickSeat = (seat) => {
    if (seat.is_booked || seat.status === 'maintenance') return;
    toggleSeat(seat);
  };

  const totalPrice = selectedSeats.reduce((sum, s) => sum + Number(s.price || 0), 0);

  const handleContinue = () => {
    if (selectedSeats.length === 0) return;
    navigate('/bap-nuoc');
  };

  const posterSrc = movie?.poster
    ? (movie.poster.startsWith('http') ? movie.poster : `${STORAGE_URL}/${movie.poster}`)
    : null;

  return (
    <div className={styles.seatSelectionPage}>
      <div className={styles.stepperContainer}>
        <div className={styles.stepperWrapper}>
          <div className={styles.step}><div className={styles.stepCircle}>01</div><span className={styles.stepLabel}>Chọn thời gian và địa điểm</span></div>
          <div className={`${styles.stepLine} ${styles.active}`}></div>
          <div className={`${styles.step} ${styles.active}`}><div className={styles.stepCircle}>02</div><span className={styles.stepLabel}>Chọn ghế</span></div>
          <div className={styles.stepLine}></div>
          <div className={styles.step}><div className={styles.stepCircle}>03</div><span className={styles.stepLabel}>Bắp nước</span></div>
          <div className={styles.stepLine}></div>
          <div className={styles.step}><div className={styles.stepCircle}>04</div><span className={styles.stepLabel}>Thanh toán</span></div>
        </div>
      </div>

      <div className={styles.container}>
        <h1 className={styles.pageMainTitle}>Bước 2: Chọn ghế</h1>

        {/* Movie Info */}
        <div className={styles.movieInfoCard}>
          {posterSrc ? (
            <img src={posterSrc} alt={movie?.title} className={styles.posterPlaceholder} style={{ objectFit: 'cover' }} />
          ) : (
            <div className={styles.posterPlaceholder}>Ảnh Phim<br />(Dọc)</div>
          )}
          <div className={styles.movieDetails}>
            <h2 className={styles.movieTitle}>{movie?.title || 'Đang tải...'}</h2>
            <ul className={styles.metaList}>
              <li><strong>Đạo diễn:</strong> {movie?.director || 'N/A'}</li>
              <li><strong>Diễn viên:</strong> {movie?.cast_info || 'N/A'}</li>
              <li><strong>Thể loại:</strong> {movie?.genre || 'N/A'}</li>
              <li><strong>Thời lượng:</strong> {movie?.duration ? `${movie.duration} phút` : 'N/A'}</li>
            </ul>
            {movie?.id && (
              <Link to={`/dat-ve/${movie.id}`} className={styles.backToStep1Btn}>
                &larr; Đổi suất chiếu khác
              </Link>
            )}
          </div>
        </div>

        <div className={styles.mainContent}>
          {/* Seat Map */}
          <div className={styles.seatMapColumn}>
            <div className={styles.screenWrapper}>
              <div className={styles.screenCurve}></div>
              <p>Màn hình</p>
            </div>

            <div className={styles.legend}>
              <div className={styles.legendItem}>
                <span className={`${styles.seatBox} ${styles.standard}`}></span>
                Standard {prices.normal ? <strong>({Number(prices.normal).toLocaleString('vi-VN')}đ)</strong> : null}
              </div>
              <div className={styles.legendItem}>
                <span className={`${styles.seatBox} ${styles.vip}`}></span>
                VIP {prices.vip ? <strong>({Number(prices.vip).toLocaleString('vi-VN')}đ)</strong> : null}
              </div>
              <div className={styles.legendItem}>
                <span className={`${styles.seatBox} ${styles.couple}`}></span>
                Couple {prices.couple ? <strong>({Number(prices.couple).toLocaleString('vi-VN')}đ)</strong> : null}
              </div>
              <div className={styles.legendItem}><span className={`${styles.seatBox} ${styles.selected}`}></span> Ghế đã chọn</div>
              <div className={styles.legendItem}><span className={`${styles.seatBox} ${styles.sold}`}></span> Ghế đã bán</div>
            </div>

            {loading ? (
              <p style={{ textAlign: 'center', color: '#aaa', padding: '40px' }}>Đang tải sơ đồ ghế...</p>
            ) : err ? (
              <p style={{ textAlign: 'center', color: '#e74c3c', padding: '40px' }}>{err}</p>
            ) : seats.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#aaa', padding: '40px' }}>Phòng chiếu chưa có ghế.</p>
            ) : (
              <div className={styles.seatGrid}>
                {sortedRows.map((row) => (
                  <div key={row} className={styles.seatRow}>
                    <div className={styles.rowLabel}>{row}</div>
                    <div className={styles.seatBlockCenter}>
                      {seatsByRow[row].map((seat) => {
                        const sold = seat.is_booked || seat.status === 'maintenance';
                        const selected = isSelected(seat.id);
                        let cls = styles.seat;
                        if (seat.type === 'vip') cls += ` ${styles.vip}`;
                        else if (seat.type === 'couple') cls += ` ${styles.couple}`;
                        else cls += ` ${styles.standard}`;
                        if (sold) cls += ` ${styles.sold}`;
                        if (selected) cls += ` ${styles.selected}`;
                        return (
                          <button
                            key={seat.id}
                            className={cls}
                            onClick={() => handleClickSeat(seat)}
                            disabled={sold}
                            title={`${seat.row}${seat.column_num} - ${seat.type}`}
                          >
                            {seat.type === 'couple' ? '♥' : seat.column_num}
                          </button>
                        );
                      })}
                    </div>
                    <div className={styles.rowLabel}>{row}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Summary */}
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

              <h2 className={styles.summaryMovieTitle}>{movie?.title || 'Đang tải...'}</h2>

              <div className={styles.divider}></div>

              <div className={styles.selectionStatus}>
                {selectedSeats.length === 0 ? (
                  <p className={styles.emptyText}>Bạn chưa chọn ghế nào. Vui lòng chọn ghế.</p>
                ) : (
                  <div className={styles.selectedSeatsInfo}>
                    <p>Ghế đã chọn: <strong>{selectedSeats.map((s) => s.label).join(', ')}</strong></p>
                    <p>Tổng tiền: <strong>{totalPrice.toLocaleString('vi-VN')} VNĐ</strong></p>
                  </div>
                )}
              </div>

              <div className={styles.divider}></div>

              <div className={styles.countdown}>
                <Link to={movie?.id ? `/dat-ve/${movie.id}` : '/'} className={styles.backLink}>&larr; Trở lại</Link>
              </div>

              <button
                onClick={handleContinue}
                disabled={selectedSeats.length === 0}
                className={`${styles.continueBtn} ${selectedSeats.length === 0 ? styles.disabled : ''}`}
              >
                TIẾP TỤC
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelectionPage;
