import axiosClient from './axiosClient';

const showtimeApi = {
  // Lấy lịch chiếu theo phim
  getByMovie: (movieId, params) => axiosClient.get(`/movies/${movieId}/showtimes`, { params }),

  // Lấy lịch chiếu theo rạp
  getByCinema: (cinemaId, params) => axiosClient.get(`/cinemas/${cinemaId}/showtimes`, { params }),

  // Lấy chi tiết suất chiếu (bao gồm trạng thái ghế)
  getById: (id) => axiosClient.get(`/showtimes/${id}`),

  // === Admin ===
  getAll: (params) => axiosClient.get('/admin/showtimes', { params }),
  create: (data) => axiosClient.post('/admin/showtimes', data),
  update: (id, data) => axiosClient.put(`/admin/showtimes/${id}`, data),
  delete: (id) => axiosClient.delete(`/admin/showtimes/${id}`),
};

export default showtimeApi;
