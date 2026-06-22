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
  const [nowShowing, setNowShowing] = useState([]);
  const [comingSoon, setComingSoon] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        // Tải phim đang chiếu
        const resNow = await movieApi.getNowShowing();
        const allNow = resNow.data || [];
        const featuredNow = allNow.filter(
          (m) => m.is_featured === 1 || m.is_featured === true || m.is_featured === '1'
        );
        let selectedNow = [];
        if (featuredNow.length > 0) {
          const featuredSlice = featuredNow.slice(0, 4);
          selectedNow = [...featuredSlice];
          if (selectedNow.length < 4) {
            const remainingCount = 4 - selectedNow.length;
            const featuredIds = featuredSlice.map(m => m.id);
            const otherMovies = allNow.filter(m => !featuredIds.includes(m.id));
            selectedNow = [...selectedNow, ...otherMovies.slice(0, remainingCount)];
          }
        } else {
          selectedNow = allNow.slice(0, 4);
        }
        setNowShowing(selectedNow);

        // Tải phim sắp chiếu
        const resComing = await movieApi.getComingSoon();
        const allComing = resComing.data || [];
        const featuredComing = allComing.filter(
          (m) => m.is_featured === 1 || m.is_featured === true || m.is_featured === '1'
        );
        let selectedComing = [];
        if (featuredComing.length > 0) {
          const featuredSlice = featuredComing.slice(0, 4);
          selectedComing = [...featuredSlice];
          if (selectedComing.length < 4) {
            const remainingCount = 4 - selectedComing.length;
            const featuredIds = featuredSlice.map(m => m.id);
            const otherMovies = allComing.filter(m => !featuredIds.includes(m.id));
            selectedComing = [...selectedComing, ...otherMovies.slice(0, remainingCount)];
          }
        } else {
          selectedComing = allComing.slice(0, 4);
        }
        setComingSoon(selectedComing);
      } catch (error) {
        console.error('Lỗi tải danh sách phim:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  const renderMovieGrid = (movieList, isComingSoon) => {
    if (movieList.length === 0) {
      return (
        <p style={{ textAlign: 'center', color: '#aaa', padding: '20px 0' }}>
          Hiện chưa có phim nào trong danh mục này.
        </p>
      );
    }

    return (
      <div className={styles.movieGridWrapper}>
        <div className={`${homeStyles.sliderArrow} ${homeStyles.prev}`}>
          <MdChevronLeft />
        </div>

        <div className={styles.movieGrid}>
          {movieList.map((movie) => (
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
                      {!isComingSoon && (
                        <Link to={`/dat-ve/${movie.id}`} className={styles.buyBtn}>
                          <MdLocalPlay className={styles.ticketIcon} />
                          MUA VÉ
                        </Link>
                      )}
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
    );
  };

  if (loading) {
    return (
      <div className={styles.movieSelectionWrapper}>
        <div className={homeStyles.container}>
          <div className={homeStyles.sectionTitleWrapper}>
            <h2 className={homeStyles.sectionTitle}>PHIM ĐANG CHIẾU</h2>
          </div>
          <p style={{ textAlign: 'center', color: '#aaa', padding: '40px 0' }}>Đang tải danh sách phim...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.movieSelectionWrapper}>
      <div className={homeStyles.container}>
        <div className={homeStyles.sectionTitleWrapper}>
          <h2 className={homeStyles.sectionTitle}>PHIM ĐANG CHIẾU</h2>
        </div>
        {renderMovieGrid(nowShowing, false)}

        <div className={homeStyles.sectionTitleWrapper} style={{ marginTop: '50px' }}>
          <h2 className={homeStyles.sectionTitle}>PHIM SẮP CHIẾU</h2>
        </div>
        {renderMovieGrid(comingSoon, true)}
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
