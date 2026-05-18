import axiosClient from './axiosClient';

const authApi = {
  // Đăng ký
  register: (data) => axiosClient.post('/register', data),

  // Đăng nhập
  login: (data) => axiosClient.post('/login', data),

  // Đăng xuất
  logout: () => axiosClient.post('/logout'),

  // Lấy thông tin user hiện tại
  getProfile: () => axiosClient.get('/auth/me'),

  // Cập nhật thông tin cá nhân
  updateProfile: (data) => axiosClient.put('/auth/profile', data),

  // Đổi mật khẩu
  changePassword: (data) => axiosClient.put('/auth/change-password', data),
};

export default authApi;
