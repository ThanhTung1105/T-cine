// ===========================
// Hàm hỗ trợ chung
// ===========================

/**
 * Tạo slug từ tiếng Việt
 * @param {string} str
 * @returns {string}
 */
export const slugify = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

/**
 * Rút gọn text
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Tạo mảng chữ cái hàng ghế (A, B, C...)
 * @param {number} count
 * @returns {string[]}
 */
export const generateRowLabels = (count) => {
  return Array.from({ length: count }, (_, i) => String.fromCharCode(65 + i));
};

/**
 * Delay (dùng cho mock API)
 * @param {number} ms
 * @returns {Promise}
 */
export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Lấy ảnh placeholder nếu không có ảnh
 * @param {string} url
 * @param {string} fallback
 * @returns {string}
 */
export const getImageUrl = (url, fallback = '/images/placeholder-movie.jpg') => {
  return url || fallback;
};

/**
 * Trích xuất message lỗi thân thiện từ axios error
 * - Validation 422: gộp tất cả message
 * - 401/403/404/500: lấy message từ server
 * - Timeout / Network: trả về message rõ ràng
 * @param {any} error - axios error object
 * @param {string} fallback - message mặc định nếu không xác định được
 * @returns {string}
 */
export const getErrorMessage = (error, fallback = 'Có lỗi xảy ra, vui lòng thử lại!') => {
  if (!error) return fallback;

  if (error.code === 'ECONNABORTED' || /timeout/i.test(error.message || '')) {
    return 'Máy chủ phản hồi quá lâu (timeout). Vui lòng thử lại sau ít giây.';
  }

  if (!error.response) {
    return 'Không thể kết nối đến máy chủ. Kiểm tra backend đã chạy chưa?';
  }

  const { status, data } = error.response;

  if (status === 422 && data?.errors && typeof data.errors === 'object') {
    const list = Object.values(data.errors).flat();
    if (list.length) return list.join('\n');
  }

  if (data?.message) return data.message;
  if (data?.error) return typeof data.error === 'string' ? data.error : JSON.stringify(data.error);

  if (status === 401) return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
  if (status === 403) return 'Bạn không có quyền thực hiện thao tác này.';
  if (status === 404) return 'Không tìm thấy tài nguyên yêu cầu.';
  if (status >= 500) return 'Lỗi máy chủ. Vui lòng thử lại sau.';

  return fallback;
};
