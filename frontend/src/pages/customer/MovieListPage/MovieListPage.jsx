import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MdHome, MdChevronRight, MdLocalPlay, MdPlayArrow, MdClose, MdStar } from 'react-icons/md';
import movieApi from '../../../api/movieApi';
import styles from './MovieListPage.module.scss';

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage';

const MovieListPage = () => {
  const location = useLocation();
  const isShowing = location.pathname.includes('phim-dang-chieu');
  const pageTitle = isShowing ? 'Phim Đang Chiếu' : 'Phim Sắp Chiếu';

  const [trailerUrl, setTrailerUrl] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const res = isShowing
          ? await movieApi.getNowShowing()
          : await movieApi.getComingSoon();
        setMovies(res.data || []);
      } catch (error) {
        console.error('Lỗi tải phim:', error);
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, [isShowing]);

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

          {loading ? (
            <p style={{ textAlign: 'center', color: '#aaa', padding: '60px 0' }}>Đang tải danh sách phim...</p>
          ) : movies.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#aaa', padding: '60px 0' }}>
              Chưa có phim nào. Vui lòng thêm phim từ trang Quản trị.
            </p>
          ) : (
            <div className={styles.movieGrid}>
              {movies.map((movie) => (
                <div key={movie.id} className={styles.movieCard}>
                  <div className={styles.posterContainer}>
                    {movie.age_rating && (
                      <div className={styles.ageRating}>{movie.age_rating}</div>
                    )}
                    {isShowing && movie.rating > 0 && (
                      <div className={styles.movieRating}>
                        <MdStar className={styles.starIcon} />
                        <span>{movie.rating}</span>
                      </div>
                    )}
                    
                    {movie.poster ? (
                      <img
                        src={movie.poster.startsWith('http') ? movie.poster : `${STORAGE_URL}/${movie.poster}`}
                        alt={movie.title}
                        className={styles.posterImage}
                      />
                    ) : (
                      <div className={styles.placeholderImage}>
                        {movie.title} <br /> (250x350)
                      </div>
                    )}
                    
                    <div className={styles.hoverOverlay}>
                      {movie.trailer_url && (
                        <button className={styles.trailerBtn} onClick={() => setTrailerUrl(movie.trailer_url)}>
                          <MdPlayArrow className={styles.playIcon} />
                          <span>TRAILER</span>
                        </button>
                      )}
                      
                      <div className={styles.bottomActions}>
                        <h3 className={styles.overlayTitle}>{movie.title}</h3>
                        <div className={styles.btnGroup}>
                          <Link to={`/phim/${movie.id}`} className={styles.detailBtn}>XEM CHI TIẾT</Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.cardInfo}>
                    <h3 className={styles.movieTitle}>{movie.title}</h3>
                    <div className={styles.movieMeta}>
                      <span>Thể loại: {movie.genre || 'N/A'}</span>
                      <span>Thời lượng: {movie.duration || '?'} phút</span>
                      <span>Khởi chiếu: {movie.release_date ? new Date(movie.release_date).toLocaleDateString('vi-VN') : 'N/A'}</span>
                    </div>
                    
                    <Link to={`/dat-ve/${movie.id}`} className={styles.bookTicketBtn}>
                      <MdLocalPlay className={styles.ticketIcon} />
                      ĐẶT VÉ
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
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
