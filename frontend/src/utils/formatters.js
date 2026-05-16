// ===========================
// Hàm format dữ liệu
// ===========================

/**
 * Format số tiền VND
 * @param {number} amount
 * @returns {string} VD: "150.000 ₫"
 */
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

/**
 * Format ngày theo định dạng Việt Nam
 * @param {string|Date} date
 * @returns {string} VD: "03/05/2026"
 */
export const formatDate = (date) => {
  if (!date) return '';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
};

/**
 * Format giờ
 * @param {string|Date} date
 * @returns {string} VD: "14:30"
 */
export const formatTime = (date) => {
  if (!date) return '';
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(date));
};

/**
 * Format ngày giờ đầy đủ
 * @param {string|Date} date
 * @returns {string} VD: "14:30 - 03/05/2026"
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  return `${formatTime(date)} - ${formatDate(date)}`;
};

/**
 * Format thời lượng phim
 * @param {number} minutes
 * @returns {string} VD: "2 giờ 15 phút"
 */
export const formatDuration = (minutes) => {
  if (!minutes) return '';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} phút`;
  if (mins === 0) return `${hours} giờ`;
  return `${hours} giờ ${mins} phút`;
};
