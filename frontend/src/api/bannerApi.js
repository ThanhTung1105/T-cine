import axiosClient from './axiosClient';

const bannerApi = {
  // Public: Lấy danh sách banner đang hiển thị (cho HeroCarousel trang chủ)
  getAll: () => axiosClient.get('/banners'),

  // === Admin ===
  // Lấy tất cả banner (kể cả inactive)
  adminGetAll: () => axiosClient.get('/admin/banners'),

  // Thêm banner mới
  create: (data) => axiosClient.post('/admin/banners', data),

  // Cập nhật banner
  update: (id, data) => axiosClient.put(`/admin/banners/${id}`, data),

  // Xóa banner
  delete: (id) => axiosClient.delete(`/admin/banners/${id}`),
};

export default bannerApi;
