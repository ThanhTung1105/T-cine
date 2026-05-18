import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MdChevronRight, MdChevronLeft, MdPlayArrow, MdLocalPlay, MdClose, MdStar } from 'react-icons/md';
import movieApi from '../../../../api/movieApi';
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
        setMovies((res.data || []).slice(0, 8));
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
