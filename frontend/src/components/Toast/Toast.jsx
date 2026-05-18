import React, { useEffect } from 'react';
import { MdCheckCircle, MdError, MdClose, MdInfo } from 'react-icons/md';
import styles from './Toast.module.scss';

const iconMap = {
  success: <MdCheckCircle />,
  error: <MdError />,
  info: <MdInfo />,
};

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!message) return null;

  return (
    <div className={`${styles.toastOverlay}`} onClick={onClose}>
      <div className={`${styles.toast} ${styles[type]}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.iconWrapper}>{iconMap[type]}</div>
        <div className={styles.content}>
          <h4 className={styles.title}>
            {type === 'success' ? 'Thành công!' : type === 'error' ? 'Lỗi!' : 'Thông báo'}
          </h4>
          <p className={styles.message}>{message}</p>
        </div>
        <button className={styles.closeBtn} onClick={onClose}><MdClose /></button>
      </div>
    </div>
  );
};

export default Toast;
