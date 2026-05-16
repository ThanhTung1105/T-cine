import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MdHome, MdChevronRight, MdLocalPlay, MdStar, MdStarBorder } from 'react-icons/md';
import { FaHandPointRight } from 'react-icons/fa';
import styles from './MovieDetailPage.module.scss';

const MovieDetailPage = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('detail'); // 'detail' | 'trailer'

  // Dữ liệu giả lập (placeholder)
  const movie = {
    id: id || 1,
    title: 'TIÊU ĐỀ PHIM',
    director: 'Tên đạo diễn',
    actors: 'Tên diễn viên',
    genre: 'Thể loại',
    releaseDate: 'DD/MM/YYYY',
    duration: '000 phút',
    language: 'Ngôn ngữ',
    rated: 'Phân loại độ tuổi',
    description: 'Nội dung chi tiết của phim sẽ được hiển thị tại đây...',
    trailerUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // placeholder youtube link
    rating: 4.8,
    totalVotes: 1204
  };


  return (
    <div className={styles.movieDetailPage}>
      {/* Breadcrumb */}
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
            {/* Cột trái: Poster */}
            <div className={styles.posterColumn}>
              <div className={styles.posterPlaceholder}>
                Poster Phim <br /> (Chờ Admin thêm)
              </div>
            </div>

            {/* Cột phải: Thông tin */}
            <div className={styles.infoColumn}>
              <h2 className={styles.movieTitle}>{movie.title}</h2>
              
              <div className={styles.ratingBadge}>
                <div className={styles.stars}>
                  <MdStar /> <MdStar /> <MdStar /> <MdStar /> <MdStarBorder />
                </div>
                <div className={styles.scoreText}>
                  <strong>{movie.rating}</strong>/5 ({movie.totalVotes} đánh giá)
                </div>
              </div>
              <div className={styles.infoList}>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Đạo diễn:</span>
                  <span className={styles.value}>{movie.director}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Diễn viên:</span>
                  <span className={styles.value}>{movie.actors}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Thể loại:</span>
                  <span className={styles.value}>{movie.genre}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Khởi chiếu:</span>
                  <span className={styles.value}>{movie.releaseDate}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Thời lượng:</span>
                  <span className={styles.value}>{movie.duration}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Ngôn ngữ:</span>
                  <span className={styles.value}>{movie.language}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Rated:</span>
                  <span className={styles.value}>{movie.rated}</span>
                </div>
              </div>

              <div className={styles.actionButtons}>
                <Link to={`/dat-ve/${movie.id}`} className={styles.buyTicketBtn}>
                  <MdLocalPlay className={styles.ticketIcon} />
                  MUA VÉ
                </Link>
              </div>
            </div>
          </div>

          {/* Tabs: Chi tiết | Trailer */}
          <div className={styles.contentTabsSection}>
            <div className={styles.tabButtons}>
              <button 
                className={`${styles.tabBtn} ${activeTab === 'detail' ? styles.active : ''}`}
                onClick={() => setActiveTab('detail')}
              >
                <FaHandPointRight className={styles.pointerIcon} />
                Chi tiết
              </button>
              <span className={styles.divider}>|</span>
              <button 
                className={`${styles.tabBtn} ${activeTab === 'trailer' ? styles.active : ''}`}
                onClick={() => setActiveTab('trailer')}
              >
                Trailer
              </button>
            </div>

            <div className={styles.tabContent}>
              {activeTab === 'detail' ? (
                <div className={styles.detailText}>
                  <p>{movie.description}</p>
                </div>
              ) : (
                <div className={styles.trailerVideo}>
                  <iframe 
                    width="100%" 
                    height="500" 
                    src={movie.trailerUrl} 
                    title="YouTube video player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
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
