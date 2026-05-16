import axiosClient from './axiosClient';

const cinemaApi = {
  // Lấy danh sách rạp
  getAll: () => axiosClient.get('/cinemas'),

  // Lấy chi tiết rạp (bao gồm phòng chiếu)
  getById: (id) => axiosClient.get(`/cinemas/${id}`),

  // Lấy danh sách phòng chiếu của rạp
  getRooms: (cinemaId) => axiosClient.get(`/cinemas/${cinemaId}/rooms`),

  // === Admin ===
  create: (data) => axiosClient.post('/admin/cinemas', data),
  update: (id, data) => axiosClient.put(`/admin/cinemas/${id}`, data),
  delete: (id) => axiosClient.delete(`/admin/cinemas/${id}`),

  // Quản lý phòng chiếu
  createRoom: (cinemaId, data) => axiosClient.post(`/admin/cinemas/${cinemaId}/rooms`, data),
  updateRoom: (cinemaId, roomId, data) => axiosClient.put(`/admin/cinemas/${cinemaId}/rooms/${roomId}`, data),
  deleteRoom: (cinemaId, roomId) => axiosClient.delete(`/admin/cinemas/${cinemaId}/rooms/${roomId}`),
};

export default cinemaApi;
