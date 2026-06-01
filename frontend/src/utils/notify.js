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

/**
 * Hàm dịch các thông báo lỗi tiếng Anh từ backend Laravel sang tiếng Việt
 */
export const translateError = (msg) => {
  if (!msg) return 'Có lỗi xảy ra. Vui lòng thử lại.';
  if (typeof msg !== 'string') {
    if (typeof msg === 'object') {
      // Lấy lỗi đầu tiên trong danh sách lỗi Laravel (validation errors)
      const firstKey = Object.keys(msg)[0];
      if (firstKey && Array.isArray(msg[firstKey])) {
        return translateError(msg[firstKey][0]);
      }
    }
    return 'Đã xảy ra lỗi hệ thống.';
  }

  const lower = msg.toLowerCase();
  
  if (lower.includes('email has already been taken') || lower.includes('email đã được sử dụng') || lower.includes('email unique')) {
    return 'Địa chỉ email này đã được sử dụng bởi một tài khoản khác.';
  }
  if (lower.includes('credentials do not match') || lower.includes('email hoặc mật khẩu không chính xác') || lower.includes('auth.failed')) {
    return 'Email hoặc mật khẩu không chính xác.';
  }
  if (lower.includes('password confirmation does not match') || lower.includes('xác nhận mật khẩu không khớp')) {
    return 'Mật khẩu xác nhận không khớp.';
  }
  if (lower.includes('password must be at least 6 characters') || lower.includes('mật khẩu phải có ít nhất 6 ký tự')) {
    return 'Mật khẩu phải có độ dài tối thiểu là 6 ký tự.';
  }
  if (lower.includes('current password') || lower.includes('mật khẩu hiện tại không đúng')) {
    return 'Mật khẩu hiện tại không chính xác.';
  }
  if (lower.includes('email must be a valid email') || lower.includes('email không đúng định dạng')) {
    return 'Địa chỉ email không đúng định dạng.';
  }
  if (lower.includes('name field is required') || lower.includes('tên không được trống')) {
    return 'Họ và tên không được để trống.';
  }
  if (lower.includes('phone') && (lower.includes('max') || lower.includes('quá dài'))) {
    return 'Số điện thoại không được dài quá 20 chữ số.';
  }

  return msg;
};

export default notify;
