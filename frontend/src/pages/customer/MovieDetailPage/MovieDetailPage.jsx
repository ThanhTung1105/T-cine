import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MdHome, MdChevronRight, MdLocalPlay, MdStar, MdStarBorder } from 'react-icons/md';
import { FaHandPointRight } from 'react-icons/fa';
import movieApi from '../../../api/movieApi';
import styles from './MovieDetailPage.module.scss';

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage';

const MovieDetailPage = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('detail');
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovie = async () => {
      setLoading(true);
      try {
        const res = await movieApi.getById(id);
        setMovie(res.data);
      } catch (error) {
        console.error('Lỗi tải chi tiết phim:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', padding: '100px 0', color: '#aaa' }}>Đang tải...</div>;
  if (!movie) return <div style={{ textAlign: 'center', padding: '100px 0', color: '#aaa' }}>Không tìm thấy phim.</div>;

  const posterSrc = movie.poster ? (movie.poster.startsWith('http') ? movie.poster : `${STORAGE_URL}/${movie.poster}`) : null;

  return (
    <div className={styles.movieDetailPage}>
      <div className={styles.breadcrumbWrapper}>
        <div className={styles.container}>
          <ul className={styles.breadcrumb}>
            <li><Link to="/"><MdHome className={styles.homeIcon} /></Link></li>
            <li><MdChevronRight className={styles.separator} /></li>
            <li><Link to="/phim-dang-chieu">Phim Đang Chiếu</Link></li>
            <li><MdChevronRight className={styles.separator} /></li>
            <li className={styles.active}>{movie.title}</li>
          </ul>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.pageContent}>
          <h1 className={styles.pageTitle}>Nội Dung Phim</h1>

          <div className={styles.movieDetailsContainer}>
            <div className={styles.posterColumn}>
              {posterSrc ? (
                <img src={posterSrc} alt={movie.title} className={styles.posterImage} />
              ) : (
                <div className={styles.posterPlaceholder}>Poster Phim <br /> (Chờ Admin thêm)</div>
              )}
            </div>

            <div className={styles.infoColumn}>
              <h2 className={styles.movieTitle}>{movie.title}</h2>
              
              {movie.rating > 0 && (
                <div className={styles.ratingBadge}>
                  <div className={styles.stars}>
                    {[1,2,3,4,5].map(i => (
                      i <= Math.round(movie.rating / 2) ? <MdStar key={i} /> : <MdStarBorder key={i} />
                    ))}
                  </div>
                  <div className={styles.scoreText}>
                    <strong>{movie.rating}</strong>/10
                  </div>
                </div>
              )}

              <div className={styles.infoList}>
                <div className={styles.infoRow}><span className={styles.label}>Đạo diễn:</span><span className={styles.value}>{movie.director || 'N/A'}</span></div>
                <div className={styles.infoRow}><span className={styles.label}>Diễn viên:</span><span className={styles.value}>{movie.cast_info || 'N/A'}</span></div>
                <div className={styles.infoRow}><span className={styles.label}>Thể loại:</span><span className={styles.value}>{movie.genre || 'N/A'}</span></div>
                <div className={styles.infoRow}><span className={styles.label}>Khởi chiếu:</span><span className={styles.value}>{movie.release_date ? new Date(movie.release_date).toLocaleDateString('vi-VN') : 'N/A'}</span></div>
                <div className={styles.infoRow}><span className={styles.label}>Thời lượng:</span><span className={styles.value}>{movie.duration ? `${movie.duration} phút` : 'N/A'}</span></div>
                <div className={styles.infoRow}><span className={styles.label}>Rated:</span><span className={styles.value}>{movie.age_rating || 'N/A'}</span></div>
              </div>

              <div className={styles.actionButtons}>
                <Link to={`/dat-ve/${movie.id}`} className={styles.buyTicketBtn}>
                  <MdLocalPlay className={styles.ticketIcon} /> MUA VÉ
                </Link>
              </div>
            </div>
          </div>

          <div className={styles.contentTabsSection}>
            <div className={styles.tabButtons}>
              <button className={`${styles.tabBtn} ${activeTab === 'detail' ? styles.active : ''}`} onClick={() => setActiveTab('detail')}>
                <FaHandPointRight className={styles.pointerIcon} /> Chi tiết
              </button>
              <span className={styles.divider}>|</span>
              <button className={`${styles.tabBtn} ${activeTab === 'trailer' ? styles.active : ''}`} onClick={() => setActiveTab('trailer')}>Trailer</button>
            </div>

            <div className={styles.tabContent}>
              {activeTab === 'detail' ? (
                <div className={styles.detailText}><p>{movie.description || 'Chưa có mô tả.'}</p></div>
              ) : (
                <div className={styles.trailerVideo}>
                  {movie.trailer_url ? (
                    <iframe width="100%" height="500" src={movie.trailer_url} title="Trailer" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                  ) : (
                    <p style={{ textAlign: 'center', color: '#aaa', padding: '60px' }}>Chưa có trailer.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailPage;
