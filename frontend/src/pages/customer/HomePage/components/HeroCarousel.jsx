import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import bannerApi from '../../../../api/bannerApi';
import styles from './HeroCarousel.module.scss';

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage';

const getImageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith('http')) return img;
  return `${STORAGE_URL}/${img}`;
};

const HeroCarousel = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await bannerApi.getAll();
        setBanners(res.data || []);
      } catch (err) {
        console.error('Lỗi tải banner trang chủ:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  // Fallback placeholders khi chưa có banner / đang tải
  const renderPlaceholders = () => (
    [1, 2, 3].map((s) => (
      <SwiperSlide key={`placeholder-${s}`}>
        <div className={styles.slidePlaceholder}>
          <span>Slide Banner {s} (Chờ nhập từ Admin) - Size: 1920x600</span>
        </div>
      </SwiperSlide>
    ))
  );

  const renderBannerSlide = (banner) => {
    const img = getImageUrl(banner.image_url);
    const content = (
      <div
        className={styles.slideImage}
        style={{ backgroundImage: img ? `url(${img})` : 'none' }}
      >
        {banner.title && <span className={styles.slideTitle}>{banner.title}</span>}
      </div>
    );

    return (
      <SwiperSlide key={banner.id}>
        {banner.link_url ? (
          banner.link_url.startsWith('http')
            ? <a href={banner.link_url} target="_blank" rel="noreferrer">{content}</a>
            : <Link to={banner.link_url}>{content}</Link>
        ) : content}
      </SwiperSlide>
    );
  };

  return (
    <div className={styles.carouselWrapper}>
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop={banners.length > 1}
        className={styles.swiperContainer}
      >
        {!loading && banners.length > 0
          ? banners.map(renderBannerSlide)
          : renderPlaceholders()}
      </Swiper>
    </div>
  );
};

export default HeroCarousel;
