import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MdLocationOn, MdCalendarToday, MdPlayCircleOutline } from 'react-icons/md';
import styles from './BookingPage.module.scss';

const BookingPage = () => {
  // Mock data for showtimes
  const dates = [
    { day: '05', date: 'Thứ 2', active: true },
    { day: '06', date: 'Thứ 3', active: false },
    { day: '07', date: 'Thứ 4', active: false },
    { day: '08', date: 'Thứ 5', active: false },
    { day: '09', date: 'Thứ 6', active: false },
    { day: '10', date: 'Thứ 7', active: false },
    { day: '11', date: 'CN', active: false },
  ];

  const cinemas = [
    {
      id: 1,
      name: 'T-CINE Vincom Center',
      address: 'Tầng 5, Vincom Center, Quận 1, TP.HCM',
      showtimes: ['09:30', '11:15', '13:00', '15:45', '18:30', '20:15']
    },
    {
      id: 2,
      name: 'T-CINE Landmark 81',
      address: 'B1, Vincom Landmark 81, Quận Bình Thạnh, TP.HCM',
      showtimes: ['10:00', '12:30', '14:15', '17:00', '19:30', '21:00', '22:15']
    },
    {
      id: 3,
      name: 'T-CINE Giga Mall',
      address: 'Tầng 6, Giga Mall, Thủ Đức, TP.HCM',
      showtimes: ['09:00', '11:30', '16:00', '18:45', '20:30']
    }
  ];

  return (
    <div className={styles.bookingPage}>
      {/* 1. Stepper Navigation */}
      <div className={styles.stepperContainer}>
        <div className={styles.stepperWrapper}>
          <div className={`${styles.step} ${styles.active}`}>
            <div className={styles.stepCircle}>01</div>
            <span className={styles.stepLabel}>Chọn thời gian và địa điểm</span>
          </div>
          <div className={styles.stepLine}></div>
          <div className={styles.step}>
            <div className={styles.stepCircle}>02</div>
            <span className={styles.stepLabel}>Chọn ghế</span>
          </div>
          <div className={styles.stepLine}></div>
          <div className={styles.step}>
            <div className={styles.stepCircle}>03</div>
            <span className={styles.stepLabel}>Thanh toán</span>
          </div>
          <div className={styles.stepLine}></div>
          <div className={styles.step}>
            <div className={styles.stepCircle}>04</div>
            <span className={styles.stepLabel}>Hoàn tất</span>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        <h1 className={styles.pageMainTitle}>Bước 1: Chọn thời gian và địa điểm</h1>

        {/* 2. Movie Info Section */}
        <div className={styles.movieInfoCard}>
          <div className={styles.posterPlaceholder}>
            Ảnh Phim<br/>(Dọc)
          </div>
          <div className={styles.movieDetails}>
            <h2 className={styles.movieTitle}>TIÊU ĐỀ PHIM (PLACEHOLDER)</h2>
            <p className={styles.movieDesc}>
              Đây là nội dung mô tả ngắn của phim. Sẽ được điền dữ liệu động từ database.
            </p>
            <ul className={styles.metaList}>
              <li><strong>Đạo diễn:</strong> Tên đạo diễn</li>
              <li><strong>Diễn viên:</strong> Tên diễn viên A, Tên diễn viên B</li>
              <li><strong>Thể loại:</strong> Hành động, Viễn tưởng</li>
              <li><strong>Thời lượng:</strong> 120 phút</li>
            </ul>
            <button className={styles.trailerBtn}>
              <MdPlayCircleOutline className={styles.icon} /> XEM TRAILER
            </button>
          </div>
        </div>

        <div className={styles.bookingContent}>
          {/* Left Column: Cinemas & Showtimes */}
          <div className={styles.mainColumn}>
            <div className={styles.cinemaList}>
              {cinemas.map(cinema => (
                <div key={cinema.id} className={styles.cinemaItem}>
                  <div className={styles.cinemaHeader}>
                    <MdLocationOn className={styles.locationIcon} />
                    <div>
                      <h3 className={styles.cinemaName}>{cinema.name}</h3>
                      <p className={styles.cinemaAddress}>{cinema.address}</p>
                    </div>
                  </div>
                  
                  <div className={styles.formatLabel}>2D Phụ Đề Việt</div>
                  
                  <div className={styles.showtimeGrid}>
                    {cinema.showtimes.map((time, index) => (
                      <Link to={`/chon-ghe/${cinema.id}/${index}`} key={index} className={styles.timeBtn}>
                        <span className={styles.time}>{time}</span>
                        <span className={styles.seats}>150 ghế trống</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Calendar Date Picker */}
          <div className={styles.sideColumn}>
            <div className={styles.calendarWidget}>
              <div className={styles.calendarHeader}>
                <MdCalendarToday className={styles.calIcon} />
                <h3>Chọn ngày xem</h3>
              </div>
              <div className={styles.dateSelector}>
                {/* Dải ngày tĩnh */}
                <div className={styles.dateList}>
                  {dates.map((d, i) => (
                    <button key={i} className={`${styles.dateBtn} ${d.active ? styles.active : ''}`}>
                      <span className={styles.dayNum}>{d.day}</span>
                      <span className={styles.dayStr}>{d.date}</span>
                    </button>
                  ))}
                </div>
              </div>
              {/* Lịch tháng mô phỏng */}
              <div className={styles.monthCalendarPlaceholder}>
                [Giao diện Lịch Tháng Placeholder]
                <br /><br />
                (Click ngày trên thanh trượt để chọn)
              </div>
            </div>
          </div>
        </div>

        {/* 3. Special Offers (Ưu Đãi Đặc Biệt) */}
        <div className={styles.specialOffersSection}>
          <div className={styles.offerHeader}>
            <span className={styles.offerTitleBadge}>ƯU ĐÃI ĐẶC BIỆT</span>
          </div>
          <div className={styles.offerGrid}>
            {[1, 2, 3, 4].map(item => (
              <div key={item} className={styles.offerCard}>
                <div className={styles.offerImgPlaceholder}>
                  Promo Banner {item} <br/> (Vuông)
                </div>
                <h4 className={styles.offerTitle}>TIÊU ĐỀ ƯU ĐÃI SỐ {item}</h4>
                <p className={styles.offerDesc}>Nội dung mô tả ngắn gọn về chương trình ưu đãi dành cho khách hàng...</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default BookingPage;
