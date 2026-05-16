import axiosClient from './axiosClient';

const movieApi = {
  // Lấy danh sách phim (có phân trang, lọc)
  getAll: (params) => axiosClient.get('/movies', { params }),

  // Lấy phim đang chiếu
  getNowShowing: () => axiosClient.get('/movies/now-showing'),

  // Lấy phim sắp chiếu
  getComingSoon: () => axiosClient.get('/movies/coming-soon'),

  // Lấy chi tiết phim
  getById: (id) => axiosClient.get(`/movies/${id}`),

  // Tìm kiếm phim
  search: (keyword) => axiosClient.get('/movies/search', { params: { keyword } }),

  // === Admin ===
  // Thêm phim mới
  create: (data) => axiosClient.post('/admin/movies', data),

  // Cập nhật phim
  update: (id, data) => axiosClient.put(`/admin/movies/${id}`, data),

  // Xóa phim
  delete: (id) => axiosClient.delete(`/admin/movies/${id}`),
};

export default movieApi;
