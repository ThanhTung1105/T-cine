import useNotifyStore from '../store/useNotifyStore';

/**
 * Helper toàn cục để hiển thị toast & confirm dialog đẹp,
 * thay thế cho window.alert / window.confirm.
 *
 * Cách dùng:
 *   import { notify, confirmDialog } from '../../utils/notify';
 *
 *   notify.success('Lưu thành công');
 *   notify.error('Có lỗi xảy ra: ' + msg);
 *   notify.info('Đang xử lý...');
 *   notify.warning('Vui lòng kiểm tra lại');
 *
 *   const ok = await confirmDialog({
 *     title: 'Xóa rạp?',
 *     message: 'Hành động không thể hoàn tác.',
 *     confirmText: 'Xóa',
 *     danger: true,
 *   });
 *   if (!ok) return;
 */
export const notify = {
  success: (message, title) =>
    useNotifyStore.getState().showToast({ type: 'success', title, message }),
  error: (message, title) =>
    useNotifyStore.getState().showToast({ type: 'error', title, message, duration: 6000 }),
  info: (message, title) =>
    useNotifyStore.getState().showToast({ type: 'info', title, message }),
  warning: (message, title) =>
    useNotifyStore.getState().showToast({ type: 'warning', title, message, duration: 5000 }),
};

export const confirmDialog = (opts) => useNotifyStore.getState().showConfirm(opts);

export default notify;
