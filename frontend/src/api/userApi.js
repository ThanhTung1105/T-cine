import axiosClient from './axiosClient';

const userApi = {
  // Lấy thông tin cá nhân
  getProfile: () => axiosClient.get('/user/profile'),

  // Cập nhật thông tin cá nhân
  updateProfile: (data) => axiosClient.put('/user/profile', data),

  // === Admin ===
  getAll: (params) => axiosClient.get('/admin/users', { params }),
  getById: (id) => axiosClient.get(`/admin/users/${id}`),
  update: (id, data) => axiosClient.put(`/admin/users/${id}`, data),
  delete: (id) => axiosClient.delete(`/admin/users/${id}`),
};

export default userApi;
