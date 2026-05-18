import React from 'react';
import styles from './HomePage.module.scss';
import HeroCarousel from './components/HeroCarousel';
import MovieSelection from './components/MovieSelection';
import EventSection from './components/EventSection';

const HomePage = () => {
  return (
    <div className={styles.homePage}>
      <HeroCarousel />
      <MovieSelection />
      <EventSection />
    </div>
  );
};

export default HomePage;
