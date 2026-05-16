import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { MdHome, MdChevronRight } from 'react-icons/md';
import styles from './EventDetailPage.module.scss';

const EventDetailPage = () => {
  const { id } = useParams();

  // Dữ liệu giả lập ưu đãi
  const event = {
    id: id || 1,
    title: 'TIÊU ĐỀ ƯU ĐÃI',
    // Nội dung này thường là HTML do CKEditor sinh ra từ admin, hiện tại mình render cứng để làm giao diện
  };

  return (
    <div className={styles.eventDetailPage}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumbWrapper}>
        <div className={styles.container}>
          <ul className={styles.breadcrumb}>
            <li><Link to="/"><MdHome className={styles.homeIcon} /></Link></li>
            <li><MdChevronRight className={styles.separator} /></li>
            <li><Link to="/tin-moi-va-uu-dai">Tin Mới & Ưu Đãi</Link></li>
            <li><MdChevronRight className={styles.separator} /></li>
            <li className={styles.active}>{event.title}</li>
          </ul>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.pageContent}>
          <h1 className={styles.eventTitle}>{event.title}</h1>

          <div className={styles.eventBody}>
            {/* Cột bên trái: Ảnh poster */}
            <div className={styles.posterColumn}>
              <div className={styles.posterPlaceholder}>
                Ảnh Ưu Đãi <br /> (Sẽ do Admin cấu hình)
              </div>
            </div>

            {/* Cột bên phải: Nội dung chi tiết ưu đãi (Mô phỏng dữ liệu Admin nhập) */}
            <div className={styles.contentColumn}>
              <div className={styles.richTextContent}>
                <p>Nội dung chi tiết ưu đãi sẽ được hiển thị tại đây. Phần này sẽ được quản trị viên soạn thảo bằng công cụ rich text editor (như CKEditor hoặc TinyMCE) và lưu dưới dạng HTML trong cơ sở dữ liệu.</p>
                <p>Thông tin bao gồm:</p>
                <ul>
                  <li>Mô tả ưu đãi</li>
                  <li>Điều kiện áp dụng</li>
                  <li>Thời gian diễn ra sự kiện</li>
                  <li>Hướng dẫn cách nhận thưởng</li>
                </ul>
                <p>Sau này, frontend sẽ gọi API để lấy đoạn HTML này và hiển thị ra.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
