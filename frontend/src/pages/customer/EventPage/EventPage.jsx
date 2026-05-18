import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MdHome, MdChevronRight, MdDateRange } from 'react-icons/md';
import eventApi from '../../../api/eventApi';
import styles from './EventPage.module.scss';

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage';

const EventPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const params = activeTab !== 'all' ? { category: activeTab } : {};
        const res = await eventApi.getAll(params);
        setEvents(res.data || res);
      } catch (err) {
        console.error('Lỗi tải sự kiện:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [activeTab]);

  const getImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith('http')) return img;
    return `${STORAGE_URL}/${img}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className={styles.eventPage}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumbWrapper}>
        <div className={styles.container}>
          <ul className={styles.breadcrumb}>
            <li><Link to="/"><MdHome className={styles.homeIcon} /></Link></li>
            <li><MdChevronRight className={styles.separator} /></li>
            <li className={styles.active}>Tin Mới & Ưu Đãi</li>
          </ul>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.pageContent}>
          {/* Header Title with lines */}
          <div className={styles.titleWrapper}>
            <div className={styles.line}></div>
            <h1 className={styles.pageTitle}>TIN MỚI VÀ ƯU ĐÃI</h1>
            <div className={styles.line}></div>
          </div>

          {/* Tabs */}
          <div className={styles.tabContainer}>
            <div className={styles.tabBackground}>
              <button 
                className={`${styles.tabBtn} ${activeTab === 'all' ? styles.active : ''}`}
                onClick={() => setActiveTab('all')}
              >
                Xem tất cả
              </button>
              <span className={styles.divider}>|</span>
              <button 
                className={`${styles.tabBtn} ${activeTab === 'promotion' ? styles.active : ''}`}
                onClick={() => setActiveTab('promotion')}
              >
                Ưu Đãi
              </button>
              <span className={styles.divider}>|</span>
              <button 
                className={`${styles.tabBtn} ${activeTab === 'member' ? styles.active : ''}`}
                onClick={() => setActiveTab('member')}
              >
                Thành Viên
              </button>
              <span className={styles.divider}>|</span>
              <button 
                className={`${styles.tabBtn} ${activeTab === 'news' ? styles.active : ''}`}
                onClick={() => setActiveTab('news')}
              >
                Tin Tức
              </button>
            </div>
          </div>

          {/* Event Grid */}
          {loading ? (
            <p style={{ color: '#888', textAlign: 'center', padding: '60px 0' }}>Đang tải sự kiện...</p>
          ) : events.length === 0 ? (
            <p style={{ color: '#888', textAlign: 'center', padding: '60px 0' }}>Chưa có sự kiện nào.</p>
          ) : (
            <div className={styles.eventGrid}>
              {events.map((event) => (
                <Link to={`/tin-moi-va-uu-dai/${event.id}`} key={event.id} className={styles.eventCard}>
                  <div className={styles.imageWrapper}>
                    {getImageUrl(event.image) ? (
                      <img
                        src={getImageUrl(event.image)}
                        alt={event.title}
                        className={styles.eventImage}
                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                      />
                    ) : null}
                    <div
                      className={styles.imagePlaceholder}
                      style={{ display: getImageUrl(event.image) ? 'none' : 'flex' }}
                    >
                      {event.title}
                    </div>
                  </div>
                  <div className={styles.eventInfo}>
                    <MdDateRange className={styles.calendarIcon} />
                    <span className={styles.eventTitle}>
                      {event.start_date && event.end_date
                        ? `${formatDate(event.start_date)} - ${formatDate(event.end_date)}`
                        : event.title}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventPage;
