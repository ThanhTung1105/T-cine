import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import eventApi from '../../../../api/eventApi';
import styles from './BottomBanners.module.scss';
import homeStyles from '../HomePage.module.scss';

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage';

const BottomBanners = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await eventApi.getAll({ category: 'promotion' });
        const data = res.data || res;
        setEvents(data.slice(0, 3));
      } catch (err) {
        console.error('Lỗi tải promo banners:', err);
      }
    };
    fetchEvents();
  }, []);

  const getImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith('http')) return img;
    return `${STORAGE_URL}/${img}`;
  };

  const renderBanner = (event, index) => {
    const isWide = index === 1;
    return (
      <div className={`${styles.bannerItem} ${isWide ? styles.wide : ''}`} key={event?.id || index}>
        <Link to={event ? `/tin-moi-va-uu-dai/${event.id}` : '/tin-moi-va-uu-dai'} style={{ display: 'block', textDecoration: 'none' }}>
          {event && getImageUrl(event.image) ? (
            <img
              src={getImageUrl(event.image)}
              alt={event.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8, minHeight: 180 }}
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            />
          ) : null}
          <div
            className={homeStyles.placeholderImage}
            style={{ display: event && getImageUrl(event.image) ? 'none' : 'flex', minHeight: 180 }}
          >
            {event ? event.title : `Promo Banner ${index + 1}`}
          </div>
        </Link>
      </div>
    );
  };

  // Đảm bảo luôn có 3 slot
  const slots = [events[0] || null, events[1] || null, events[2] || null];

  return (
    <div className={styles.bottomBannersWrapper}>
      <div className={homeStyles.container}>
        <div className={styles.bannerGrid}>
          {slots.map((event, index) => renderBanner(event, index))}
        </div>
      </div>
    </div>
  );
};

export default BottomBanners;
