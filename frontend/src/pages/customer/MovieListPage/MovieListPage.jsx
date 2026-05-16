import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MdHome, MdChevronRight, MdLocalPlay, MdPlayArrow, MdClose, MdStar } from 'react-icons/md';
import styles from './MovieListPage.module.scss';

const MovieListPage = () => {
  const location = useLocation();
  const isShowing = location.pathname.includes('phim-dang-chieu');
  const pageTitle = isShowing ? 'Phim Đang Chiếu' : 'Phim Sắp Chiếu';

  const [trailerUrl, setTrailerUrl] = useState(null);
  const placeholderTrailer = "https://www.youtube.com/embed/dQw4w9WgXcQ";

  // Tạo mảng 8 phim placeholder để hiển thị grid
  const movies = [
    { id: 1, rating: 4.8 }, { id: 2, rating: 4.5 }, { id: 3, rating: 0 }, { id: 4, rating: 4.2 },
    { id: 5, rating: 0 }, { id: 6, rating: 4.9 }, { id: 7, rating: 4.1 }, { id: 8, rating: 0 }
  ];

  return (
    <div className={styles.movieListPage}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumbWrapper}>
        <div className={styles.container}>
          <ul className={styles.breadcrumb}>
            <li><Link to="/"><MdHome className={styles.homeIcon} /></Link></li>
            <li><MdChevronRight className={styles.separator} /></li>
            <li className={styles.active}>{pageTitle}</li>
          </ul>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.pageContent}>
          <h1 className={styles.pageTitle}>{pageTitle}</h1>

          <div className={styles.movieGrid}>
            {movies.map((movie) => (
              <div key={movie.id} className={styles.movieCard}>
                <div className={styles.posterContainer}>
                  <div className={styles.ageRating}>T18</div>
                  {isShowing && (
                    <div className={styles.movieRating}>
                      <MdStar className={styles.starIcon} />
                      <span>{movie.rating}</span>
                    </div>
                  )}
                  <div className={styles.placeholderImage}>
                    Poster Phim {movie.id} <br /> (250x350)
                  </div>
                  
                  <div className={styles.hoverOverlay}>
                    <button className={styles.trailerBtn} onClick={() => setTrailerUrl(placeholderTrailer)}>
                      <MdPlayArrow className={styles.playIcon} />
                      <span>TRAILER</span>
                    </button>
                    
                    <div className={styles.bottomActions}>
                      <h3 className={styles.overlayTitle}>TIÊU ĐỀ PHIM</h3>
                      <div className={styles.btnGroup}>
                        <Link to={`/phim/${movie.id}`} className={styles.detailBtn}>XEM CHI TIẾT</Link>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className={styles.cardInfo}>
                  <h3 className={styles.movieTitle}>TIÊU ĐỀ PHIM {movie.id}</h3>
                  <div className={styles.movieMeta}>
                    <span>Thể loại: Hành động, Viễn tưởng</span>
                    <span>Thời lượng: 120 phút</span>
                    <span>Khởi chiếu: 01/01/2026</span>
                  </div>
                  
                  {/* Nút Đặt Vé tĩnh hiển thị trực tiếp bên dưới theo yêu cầu */}
                  <Link to={`/dat-ve/${movie.id}`} className={styles.bookTicketBtn}>
                    <MdLocalPlay className={styles.ticketIcon} />
                    ĐẶT VÉ
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trailer Popup Modal */}
      {trailerUrl && (
        <div className={styles.modalOverlay} onClick={() => setTrailerUrl(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setTrailerUrl(null)}>
              <MdClose />
            </button>
            <iframe 
              width="100%" 
              height="100%" 
              src={trailerUrl} 
              title="YouTube Trailer" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieListPage;
