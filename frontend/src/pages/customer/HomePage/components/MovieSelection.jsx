import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MdChevronRight, MdChevronLeft, MdPlayArrow, MdLocalPlay, MdClose, MdStar } from 'react-icons/md';
import styles from './MovieSelection.module.scss';
import homeStyles from '../HomePage.module.scss';

const MovieSelection = () => {
  const [trailerUrl, setTrailerUrl] = useState(null);
  const movies = [
    { id: 1, title: 'Tiêu đề phim 1', rating: 4.8 },
    { id: 2, title: 'Tiêu đề phim 2', rating: 4.5 },
    { id: 3, title: 'Tiêu đề phim 3', rating: 4.9 },
    { id: 4, title: 'Tiêu đề phim 4', rating: 4.2 }
  ]; // 4 phim placeholder
  const placeholderTrailer = "https://www.youtube.com/embed/dQw4w9WgXcQ";

  return (
    <div className={styles.movieSelectionWrapper}>
      <div className={homeStyles.container}>
        <div className={homeStyles.sectionTitleWrapper}>
          <h2 className={homeStyles.sectionTitle}>MOVIE SELECTION</h2>
        </div>

        <div className={styles.movieGridWrapper}>
          {/* Mũi tên điều hướng trái (ẩn trong thiết kế nhưng thường có) */}
          <div className={`${homeStyles.sliderArrow} ${homeStyles.prev}`}>
            <MdChevronLeft />
          </div>

          <div className={styles.movieGrid}>
            {movies.map((movie) => (
              <div key={movie.id} className={styles.movieCard}>
                <div className={styles.posterContainer}>
                  <div className={styles.ageRating}>T18</div>
                  <div className={styles.movieRating}>
                    <MdStar className={styles.starIcon} />
                    <span>{movie.rating}</span>
                  </div>
                  <div className={homeStyles.placeholderImage}>
                    Poster Phim {movie.id} <br /> (250x350)
                  </div>
                  
                  <div className={styles.hoverOverlay}>
                    <button className={styles.trailerBtn} onClick={() => setTrailerUrl(placeholderTrailer)}>
                      <MdPlayArrow className={styles.playIcon} />
                      <span>TRAILER</span>
                    </button>
                    
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

          {/* Mũi tên điều hướng phải */}
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
