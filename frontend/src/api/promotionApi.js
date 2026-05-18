import axiosClient from './axiosClient';

const promotionApi = {
  // Public: Kiểm tra mã giảm giá (khi khách hàng đặt vé nhập code)
  check: (code) => axiosClient.get('/promotions/check', { params: { code } }),

  // === Admin ===
  adminGetAll: (params) => axiosClient.get('/admin/promotions', { params }),
  create: (data) => axiosClient.post('/admin/promotions', data),
  update: (id, data) => axiosClient.put(`/admin/promotions/${id}`, data),
  delete: (id) => axiosClient.delete(`/admin/promotions/${id}`),
};

export default promotionApi;
