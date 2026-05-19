import { create } from 'zustand';

let __toastId = 0;

/**
 * Store cho hệ thống thông báo toàn cục:
 * - toasts: danh sách toast nhỏ ở góc phải trên (success/error/info/warning, auto-dismiss)
 * - confirmState: dialog xác nhận thay cho window.confirm (trả về Promise<boolean>)
 */
const useNotifyStore = create((set, get) => ({
  toasts: [],
  confirmState: null,

  showToast: ({ type = 'info', title, message, duration = 4000 }) => {
    const id = ++__toastId;
    set((s) => ({
      toasts: [...s.toasts, { id, type, title, message, duration }],
    }));
    if (duration > 0) {
      setTimeout(() => get().removeToast(id), duration);
    }
    return id;
  },

  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  showConfirm: ({
    title = 'Xác nhận',
    message = '',
    confirmText = 'Đồng ý',
    cancelText = 'Hủy',
    danger = false,
  } = {}) => {
    return new Promise((resolve) => {
      set({
        confirmState: { title, message, confirmText, cancelText, danger, resolve },
      });
    });
  },

  closeConfirm: (value) => {
    const cs = get().confirmState;
    if (cs?.resolve) cs.resolve(value);
    set({ confirmState: null });
  },
}));

export default useNotifyStore;
