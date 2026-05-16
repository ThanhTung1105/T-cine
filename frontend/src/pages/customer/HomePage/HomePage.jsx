import React from 'react';
import styles from './HomePage.module.scss';
import HomeMenu from './components/HomeMenu';
import HeroCarousel from './components/HeroCarousel';
import MovieSelection from './components/MovieSelection';
import EventSection from './components/EventSection';
import BottomBanners from './components/BottomBanners';

const HomePage = () => {
  return (
    <div className={styles.homePage}>
      <HomeMenu />
      <HeroCarousel />
      <MovieSelection />
      <EventSection />
      <BottomBanners />
    </div>
  );
};

export default HomePage;
