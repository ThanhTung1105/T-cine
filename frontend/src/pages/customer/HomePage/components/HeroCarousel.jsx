import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import styles from './HeroCarousel.module.scss';

const HeroCarousel = () => {
  // 3 slide trống để admin nhập sau
  const slides = [1, 2, 3];

  return (
    <div className={styles.carouselWrapper}>
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop={true}
        className={styles.swiperContainer}
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide}>
            <div className={styles.slidePlaceholder}>
              <span>Slide Banner {slide} (Chờ nhập từ Admin) - Size: 1920x600</span>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default HeroCarousel;
