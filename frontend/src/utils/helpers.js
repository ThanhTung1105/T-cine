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
