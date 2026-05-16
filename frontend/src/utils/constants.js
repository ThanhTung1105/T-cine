// ===========================
// Hằng số dự án T-Cine
// ===========================

// API Base URL
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Loại ghế
export const SEAT_TYPES = {
  STANDARD: 'standard',
  VIP: 'vip',
  COUPLE: 'couple',
};

// Trạng thái ghế
export const SEAT_STATUS = {
  AVAILABLE: 'available',
  SELECTED: 'selected',
  SOLD: 'sold',
};

// Trạng thái đơn hàng
export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
};

// Trạng thái phim
export const MOVIE_STATUS = {
  NOW_SHOWING: 'now_showing',
  COMING_SOON: 'coming_soon',
};

// Vai trò người dùng
export const USER_ROLES = {
  ADMIN: 'admin',
  CUSTOMER: 'customer',
};

// Số phim mỗi trang
export const ITEMS_PER_PAGE = 12;
