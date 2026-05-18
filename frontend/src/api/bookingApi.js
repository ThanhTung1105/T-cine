import axiosClient from './axiosClient';

const bookingApi = {
  // Tạo đơn đặt vé
  create: (data) => axiosClient.post('/bookings', data),

  // Lấy lịch sử đặt vé của user
  getMyBookings: (params) => axiosClient.get('/bookings/my', { params }),

  // Lấy chi tiết đơn đặt vé
  getById: (id) => axiosClient.get(`/bookings/${id}`),

  // Hủy đơn đặt vé
  cancel: (id) => axiosClient.put(`/bookings/${id}/cancel`),

  // Xác nhận thanh toán (mô phỏng)
  confirmPayment: (id, data) => axiosClient.post(`/bookings/${id}/confirm-payment`, data),

  // === Admin ===
  getAll: (params) => axiosClient.get('/admin/bookings', { params }),
  updateStatus: (id, data) => axiosClient.put(`/admin/bookings/${id}/status`, data),
};

export default bookingApi;
