import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MdChevronRight, MdChevronLeft } from 'react-icons/md';
import styles from './EventSection.module.scss';
import homeStyles from '../HomePage.module.scss';

const EventSection = () => {
  const [activeTab, setActiveTab] = useState('Thành Viên T-CINE');
  const events = [1, 2, 3, 4]; // 4 event placeholder

  return (
    <div className={styles.eventSectionWrapper}>
      <div className={homeStyles.container}>
        <div className={homeStyles.sectionTitleWrapper}>
          <h2 className={homeStyles.sectionTitle}>EVENT</h2>
        </div>

        {/* Tabs */}
        <div className={styles.tabContainer}>
          <div className={styles.tabs}>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'Thành Viên T-CINE' ? styles.active : ''}`}
              onClick={() => setActiveTab('Thành Viên T-CINE')}
            >
              Thành Viên T-CINE
            </button>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'Tin Mới & Ưu Đãi' ? styles.active : ''}`}
              onClick={() => setActiveTab('Tin Mới & Ưu Đãi')}
            >
              Tin Mới & Ưu Đãi
            </button>
          </div>
        </div>

        {/* Grid Sự kiện */}
        <div className={styles.eventGridWrapper}>
          <div className={`${homeStyles.sliderArrow} ${homeStyles.prev}`}>
            <MdChevronLeft />
          </div>

          <div className={styles.eventGrid}>
            {events.map((event) => (
              <Link to="/tin-moi-va-uu-dai" key={event} className={styles.eventCard} style={{ textDecoration: 'none', display: 'block' }}>
                <div className={homeStyles.placeholderImage}>
                  Sự kiện {event} <br /> (300x200)
                </div>
              </Link>
            ))}
          </div>

          <div className={`${homeStyles.sliderArrow} ${homeStyles.next}`}>
            <MdChevronRight />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventSection;
