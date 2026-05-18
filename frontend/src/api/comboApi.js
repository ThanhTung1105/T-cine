import axiosClient from './axiosClient';

const comboApi = {
  // Public: Lấy danh sách combo (dùng cho cả admin & customer)
  getAll: () => axiosClient.get('/combos'),

  // === Admin ===
  create: (data) => axiosClient.post('/admin/combos', data),
  update: (id, data) => axiosClient.put(`/admin/combos/${id}`, data),
  delete: (id) => axiosClient.delete(`/admin/combos/${id}`),
};

export default comboApi;
