import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Tăng timeout lên 60s vì php artisan serve là single-threaded,
  // request có thể bị queue sau những request chậm khác (load nhiều ảnh, v.v.)
  timeout: 60000,
});

// Request interceptor — tự động gắn token vào header
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — xử lý lỗi chung
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const { response } = error;

    if (response) {
      // Token hết hạn hoặc không hợp lệ
      if (response.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        window.location.href = '/dang-nhap';
      }

      // Forbidden
      if (response.status === 403) {
        console.error('Bạn không có quyền truy cập.');
      }

      // Server error
      if (response.status >= 500) {
        console.error('Lỗi máy chủ. Vui lòng thử lại sau.');
      }
    } else {
      console.error('Không thể kết nối đến máy chủ.');
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
