import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MdCheckCircle, MdError, MdInfo, MdWarning, MdClose, MdHelpOutline } from 'react-icons/md';
import useNotifyStore from '../../store/useNotifyStore';
import styles from './NotificationCenter.module.scss';

const ICONS = {
  success: <MdCheckCircle />,
  error: <MdError />,
  info: <MdInfo />,
  warning: <MdWarning />,
};

const DEFAULT_TITLES = {
  success: 'Thành công',
  error: 'Có lỗi xảy ra',
  info: 'Thông báo',
  warning: 'Cảnh báo',
};

const ToastItem = ({ toast, onClose }) => (
  <div className={`${styles.toast} ${styles[toast.type]}`} role="alert">
    <div className={styles.toastIcon}>{ICONS[toast.type] || <MdInfo />}</div>
    <div className={styles.toastContent}>
      <div className={styles.toastTitle}>{toast.title || DEFAULT_TITLES[toast.type] || 'Thông báo'}</div>
      {toast.message && <div className={styles.toastMessage}>{toast.message}</div>}
    </div>
    <button className={styles.toastClose} onClick={onClose} aria-label="Đóng">
      <MdClose />
    </button>
  </div>
);

const ConfirmDialog = ({ state, onClose }) => {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose(false);
      if (e.key === 'Enter') onClose(true);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className={styles.confirmOverlay} onClick={() => onClose(false)}>
      <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className={`${styles.confirmIcon} ${state.danger ? styles.confirmIconDanger : ''}`}>
          {state.danger ? <MdWarning /> : <MdHelpOutline />}
        </div>
        <h3 className={styles.confirmTitle}>{state.title}</h3>
        {state.message && (
          <p className={styles.confirmMessage}>
            {String(state.message).split('\n').map((line, i) => (
              <React.Fragment key={i}>
                {line}
                <br />
              </React.Fragment>
            ))}
          </p>
        )}
        <div className={styles.confirmActions}>
          <button className={styles.confirmCancel} onClick={() => onClose(false)}>
            {state.cancelText}
          </button>
          <button
            className={`${styles.confirmOk} ${state.danger ? styles.confirmOkDanger : ''}`}
            onClick={() => onClose(true)}
            autoFocus
          >
            {state.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const NotificationCenter = () => {
  const { toasts, removeToast, confirmState, closeConfirm } = useNotifyStore();

  return createPortal(
    <>
      <div className={styles.toastStack}>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
      {confirmState && (
        <ConfirmDialog state={confirmState} onClose={closeConfirm} />
      )}
    </>,
    document.body,
  );
};

export default NotificationCenter;
