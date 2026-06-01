import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MdHome, MdChevronRight, MdContentCopy, MdCheckCircle, MdLocalOffer } from 'react-icons/md';
import eventApi from '../../../api/eventApi';
import styles from './EventDetailPage.module.scss';

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage';

const formatVND = (v) => Number(v || 0).toLocaleString('vi-VN');

const EventDetailPage = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const res = await eventApi.getById(id);
        setEvent(res.data || res);
      } catch (err) {
        setError('Không tìm thấy sự kiện.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const getImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith('http')) return img;
    return `${STORAGE_URL}/${img}`;
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) {
    return (
      <div className={styles.eventDetailPage}>
        <div className={styles.container}>
          <p style={{ color: '#888', textAlign: 'center', padding: '80px 0' }}>Đang tải chi tiết sự kiện...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className={styles.eventDetailPage}>
        <div className={styles.container}>
          <p style={{ color: '#ef4444', textAlign: 'center', padding: '80px 0' }}>{error || 'Sự kiện không tồn tại.'}</p>
          <div style={{ textAlign: 'center' }}>
            <Link to="/tin-moi-va-uu-dai" style={{ color: '#3b82f6' }}>← Quay lại danh sách</Link>
          </div>
        </div>
      </div>
    );
  }

  const promo = event.promotion;

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

          {event.description && (
            <p style={{ color: '#666', fontSize: 15, marginBottom: 20, fontStyle: 'italic', whiteSpace: 'pre-wrap' }}>{event.description}</p>
          )}

          <div className={styles.eventBody}>
            {/* Cột bên trái: Ảnh */}
            <div className={styles.posterColumn}>
              {getImageUrl(event.image) ? (
                <img
                  src={getImageUrl(event.image)}
                  alt={event.title}
                  style={{ width: '100%', borderRadius: 8, maxHeight: 400, objectFit: 'cover' }}
                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                />
              ) : null}
              <div
                className={styles.posterPlaceholder}
                style={{ display: getImageUrl(event.image) ? 'none' : 'flex' }}
              >
                Ảnh Sự Kiện
              </div>
            </div>

            {/* Cột bên phải: Nội dung */}
            <div className={styles.contentColumn}>
              <div className={styles.richTextContent}>
                {event.content ? (
                  <div dangerouslySetInnerHTML={{ __html: event.content }} />
                ) : (
                  <p>Nội dung chi tiết sẽ được cập nhật sớm.</p>
                )}
              </div>

              {(event.start_date || event.end_date) && (
                <div style={{ marginTop: 20, padding: '12px 16px', background: '#e8f4fd', borderRadius: 8, border: '1px solid #b6d4fe' }}>
                  <strong style={{ color: '#1a56db' }}>⏰ Thời gian: </strong>
                  <span style={{ color: '#333' }}>
                    {event.start_date && new Date(event.start_date).toLocaleDateString('vi-VN')}
                    {event.end_date && ` - ${new Date(event.end_date).toLocaleDateString('vi-VN')}`}
                  </span>
                </div>
              )}

              {/* Card hiển thị mã giảm giá */}
              {promo && (
                <div className={styles.promoCard}>
                  <div className={styles.promoLeft}>
                    <MdLocalOffer className={styles.promoIcon} />
                    <div>
                      <div className={styles.promoLabel}>Mã giảm giá áp dụng</div>
                      <div className={styles.promoDiscount}>
                        Giảm <strong>{promo.discount_percent}%</strong>
                        {promo.max_discount && (
                          <span className={styles.promoMax}> (tối đa {formatVND(promo.max_discount)}đ)</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={styles.promoRight}>
                    <div className={styles.codeBox}>
                      <code>{promo.code}</code>
                      <button
                        className={styles.copyBtn}
                        onClick={() => handleCopy(promo.code)}
                        title="Sao chép mã"
                      >
                        {copied ? <MdCheckCircle /> : <MdContentCopy />}
                        <span>{copied ? 'Đã sao chép!' : 'Sao chép'}</span>
                      </button>
                    </div>
                    {promo.valid_to && (
                      <small className={styles.promoExpiry}>
                        Hiệu lực đến: {new Date(promo.valid_to).toLocaleDateString('vi-VN')}
                      </small>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
