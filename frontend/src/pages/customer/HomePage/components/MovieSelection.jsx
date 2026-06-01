import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MdChevronRight, MdChevronLeft, MdPlayArrow, MdLocalPlay, MdClose, MdStar } from 'react-icons/md';
import movieApi from '../../../../api/movieApi';
import { toYouTubeEmbedUrl } from '../../../../utils/youtube';
import styles from './MovieSelection.module.scss';
import homeStyles from '../HomePage.module.scss';

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage';

const MovieSelection = () => {
  const [trailerUrl, setTrailerUrl] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await movieApi.getNowShowing();
        const allMovies = res.data || [];
        
        // 1. Lọc các phim được đánh dấu nổi bật ở Trang chủ
        const featured = allMovies.filter(
          (m) => m.is_featured === 1 || m.is_featured === true || m.is_featured === '1'
        );
        
        let selectedMovies = [];
        if (featured.length > 0) {
          // Lấy tối đa 4 phim nổi bật
          const featuredSlice = featured.slice(0, 4);
          selectedMovies = [...featuredSlice];
          
          // Nếu admin chọn ít hơn 4 phim nổi bật (ví dụ 1 hoặc 2), tự động điền thêm các phim đang chiếu khác cho đủ 4 card
          if (selectedMovies.length < 4) {
            const remainingCount = 4 - selectedMovies.length;
            const featuredIds = featuredSlice.map(m => m.id);
            const otherMovies = allMovies.filter(m => !featuredIds.includes(m.id));
            selectedMovies = [...selectedMovies, ...otherMovies.slice(0, remainingCount)];
          }
        } else {
          // Fallback: nếu không chọn phim nào, lấy 4 phim mới nhất đang chiếu
          selectedMovies = allMovies.slice(0, 4);
        }
        
        setMovies(selectedMovies);
      } catch (error) {
        console.error('Lỗi tải danh sách phim:', error);
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  if (loading) {
    return (
      <div className={styles.movieSelectionWrapper}>
        <div className={homeStyles.container}>
          <div className={homeStyles.sectionTitleWrapper}>
            <h2 className={homeStyles.sectionTitle}>MOVIE SELECTION</h2>
          </div>
          <p style={{ textAlign: 'center', color: '#aaa', padding: '40px 0' }}>Đang tải danh sách phim...</p>
        </div>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className={styles.movieSelectionWrapper}>
        <div className={homeStyles.container}>
          <div className={homeStyles.sectionTitleWrapper}>
            <h2 className={homeStyles.sectionTitle}>MOVIE SELECTION</h2>
          </div>
          <p style={{ textAlign: 'center', color: '#aaa', padding: '40px 0' }}>
            Chưa có phim nào. Vui lòng thêm phim từ trang Quản trị.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.movieSelectionWrapper}>
      <div className={homeStyles.container}>
        <div className={homeStyles.sectionTitleWrapper}>
          <h2 className={homeStyles.sectionTitle}>MOVIE SELECTION</h2>
        </div>

        <div className={styles.movieGridWrapper}>
          <div className={`${homeStyles.sliderArrow} ${homeStyles.prev}`}>
            <MdChevronLeft />
          </div>

          <div className={styles.movieGrid}>
            {movies.map((movie) => (
              <div key={movie.id} className={styles.movieCard}>
                <div className={styles.posterContainer}>
                  {movie.age_rating && (
                    <div className={styles.ageRating}>{movie.age_rating}</div>
                  )}
                  {movie.rating > 0 && (
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
                    <div className={homeStyles.placeholderImage}>
                      {movie.title} <br /> (250x350)
                    </div>
                  )}
                  
                  <div className={styles.hoverOverlay}>
                    {toYouTubeEmbedUrl(movie.trailer_url) && (
                      <button
                        className={styles.trailerBtn}
                        onClick={() => setTrailerUrl(toYouTubeEmbedUrl(movie.trailer_url))}
                      >
                        <MdPlayArrow className={styles.playIcon} />
                        <span>TRAILER</span>
                      </button>
                    )}
                    
                    <div className={styles.bottomActions}>
                      <h3 className={styles.overlayTitle}>{movie.title}</h3>
                      <div className={styles.btnGroup}>
                        <Link to={`/phim/${movie.id}`} className={styles.detailBtn}>XEM CHI TIẾT</Link>
                        <Link to={`/dat-ve/${movie.id}`} className={styles.buyBtn}>
                          <MdLocalPlay className={styles.ticketIcon} />
                          MUA VÉ
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
                <h3 className={styles.movieTitle}>{movie.title}</h3>
              </div>
            ))}
          </div>

          <div className={`${homeStyles.sliderArrow} ${homeStyles.next}`}>
            <MdChevronRight />
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

export default MovieSelection;
