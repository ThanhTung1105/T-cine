import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MdHome, MdChevronRight, MdDateRange } from 'react-icons/md';
import styles from './EventPage.module.scss';

const EventPage = () => {
  const [activeTab, setActiveTab] = useState('all');

  // Dummy data for events
  const events = [
    { id: 1, title: '29/04/2026 - 17/06/2026' },
    { id: 2, title: 'Quà Sinh Nhật MIỄN PHÍ' },
    { id: 3, title: '26/04/2026 - 03/05/2026' },
    { id: 4, title: 'T-CINE Member Day' },
    { id: 5, title: '24/04/2026 - 30/12/2026' },
    { id: 6, title: '04/04/2026 - 30/06/2026' },
    { id: 7, title: '22/04/2026 - 08/05/2026' },
    { id: 8, title: '17/04/2026 - 30/04/2026' },
  ];

  return (
    <div className={styles.eventPage}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumbWrapper}>
        <div className={styles.container}>
          <ul className={styles.breadcrumb}>
            <li><Link to="/"><MdHome className={styles.homeIcon} /></Link></li>
            <li><MdChevronRight className={styles.separator} /></li>
            <li className={styles.active}>Tin Khuyến Mãi Và Ưu Đãi Hấp Dẫn Tại T-CINE Cinemas Việt Nam</li>
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
                className={`${styles.tabBtn} ${activeTab === 'cinema' ? styles.active : ''}`}
                onClick={() => setActiveTab('cinema')}
              >
                Chọn Rạp
              </button>
            </div>
          </div>

          {/* Event Grid */}
          <div className={styles.eventGrid}>
            {events.map((event) => (
              <Link to={`/tin-moi-va-uu-dai/${event.id}`} key={event.id} className={styles.eventCard}>
                <div className={styles.imagePlaceholder}>
                  Ảnh Sự Kiện {event.id} <br /> (Vuông)
                </div>
                <div className={styles.eventInfo}>
                  <MdDateRange className={styles.calendarIcon} />
                  <span className={styles.eventTitle}>{event.title}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventPage;
