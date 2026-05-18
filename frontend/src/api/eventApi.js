import axiosClient from './axiosClient';

const eventApi = {
  // Lấy danh sách sự kiện (có thể lọc theo category)
  getAll: (params) => axiosClient.get('/events', { params }),

  // Lấy chi tiết sự kiện
  getById: (id) => axiosClient.get(`/events/${id}`),

  // === Admin ===
  // Lấy tất cả sự kiện (bao gồm cả inactive)
  adminGetAll: () => axiosClient.get('/admin/events'),

  // Thêm sự kiện mới
  create: (data) => axiosClient.post('/admin/events', data),

  // Cập nhật sự kiện
  update: (id, data) => axiosClient.put(`/admin/events/${id}`, data),

  // Xóa sự kiện
  delete: (id) => axiosClient.delete(`/admin/events/${id}`),
};

export default eventApi;
