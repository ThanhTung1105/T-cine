import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MdChevronLeft, MdChevronRight, MdDateRange, MdArrowForward } from 'react-icons/md';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import eventApi from '../../../../api/eventApi';
import styles from './EventSection.module.scss';
import homeStyles from '../HomePage.module.scss';

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage';

const TABS = [
  { id: 'promotion', label: 'Ưu Đãi' },
  { id: 'news', label: 'Tin Tức' },
];

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

const EventSection = () => {
  const [activeTab, setActiveTab] = useState('promotion');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const prevRef = useRef(null);
  const nextRef = useRef(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await eventApi.getAll({ category: activeTab });
        const allEvents = Array.isArray(res) ? res : res.data || [];
        
        // Lọc các sự kiện nổi bật thuộc danh mục hiện tại
        const featured = allEvents.filter(
          (e) => e.is_featured === 1 || e.is_featured === true || e.is_featured === '1'
        );
        
        let selectedEvents = [];
        if (featured.length > 0) {
          const featuredSlice = featured.slice(0, 4);
          selectedEvents = [...featuredSlice];
          
          // Điền đầy đủ 4 card bằng các sự kiện thường của cùng danh mục
          if (selectedEvents.length < 4) {
            const remainingCount = 4 - selectedEvents.length;
            const featuredIds = featuredSlice.map(e => e.id);
            const otherEvents = allEvents.filter(e => !featuredIds.includes(e.id));
            selectedEvents = [...selectedEvents, ...otherEvents.slice(0, remainingCount)];
          }
        } else {
          // Fallback: Nếu không chọn sự kiện nổi bật nào, hiển thị 4 sự kiện mới nhất
          selectedEvents = allEvents.slice(0, 4);
        }
        
        setEvents(selectedEvents);
      } catch (err) {
        console.error('Lỗi tải sự kiện:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [activeTab]);

  const renderCard = (event) => {
    const img = getImageUrl(event.image);
    const hasDate = event.start_date && event.end_date;
    return (
      <Link to={`/tin-moi-va-uu-dai/${event.id}`} className={styles.eventCard}>
        <div className={styles.imageWrapper}>
          {img ? (
            <img
              src={img}
              alt={event.title}
              className={styles.cardImage}
              onError={(e) => {
                e.target.style.display = 'none';
                if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div
            className={styles.placeholder}
            style={{ display: img ? 'none' : 'flex' }}
          >
            {event.title}
          </div>
        </div>
        <div className={styles.cardBody}>
          <h4 className={styles.cardTitle} title={event.title}>{event.title}</h4>
          {hasDate && (
            <div className={styles.cardDate}>
              <MdDateRange className={styles.dateIcon} />
              <span>{formatDate(event.start_date)} - {formatDate(event.end_date)}</span>
            </div>
          )}
        </div>
      </Link>
    );
  };

  return (
    <div className={styles.eventSectionWrapper}>
      <div className={homeStyles.container}>
        <div className={homeStyles.sectionTitleWrapper}>
          <h2 className={homeStyles.sectionTitle}>TIN MỚI & ƯU ĐÃI</h2>
        </div>

        {/* Tabs */}
        <div className={styles.tabContainer}>
          <div className={styles.tabs}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`${styles.tabBtn} ${activeTab === tab.id ? styles.active : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid / Carousel */}
        <div className={styles.carouselWrapper}>
          <button ref={prevRef} className={`${styles.navArrow} ${styles.prev}`} aria-label="Trước">
            <MdChevronLeft />
          </button>
          <button ref={nextRef} className={`${styles.navArrow} ${styles.next}`} aria-label="Sau">
            <MdChevronRight />
          </button>

          {loading ? (
            <p className={styles.statusText}>Đang tải sự kiện...</p>
          ) : events.length === 0 ? (
            <p className={styles.statusText}>Chưa có sự kiện nào.</p>
          ) : (
            <Swiper
              modules={[Navigation]}
              spaceBetween={20}
              slidesPerView={4}
              onBeforeInit={(swiper) => {
                // Gắn navigation refs sau khi mount
                swiper.params.navigation.prevEl = prevRef.current;
                swiper.params.navigation.nextEl = nextRef.current;
              }}
              navigation={{
                prevEl: prevRef.current,
                nextEl: nextRef.current,
              }}
              breakpoints={{
                0:    { slidesPerView: 1, spaceBetween: 12 },
                640:  { slidesPerView: 2, spaceBetween: 16 },
                960:  { slidesPerView: 3, spaceBetween: 18 },
                1200: { slidesPerView: 4, spaceBetween: 20 },
              }}
              className={styles.swiper}
            >
              {events.map((event) => (
                <SwiperSlide key={event.id} className={styles.slide}>
                  {renderCard(event)}
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>

        {/* Xem tất cả */}
        {events.length > 0 && (
          <div className={styles.viewAllWrapper}>
            <Link to="/tin-moi-va-uu-dai" className={styles.viewAllBtn}>
              Xem tất cả <MdArrowForward />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventSection;
