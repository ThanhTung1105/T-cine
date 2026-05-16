import axiosClient from './axiosClient';

const adminApi = {
  // Thống kê tổng quan (dashboard)
  getDashboard: () => axiosClient.get('/admin/dashboard'),

  // Thống kê doanh thu
  getRevenue: (params) => axiosClient.get('/admin/revenue', { params }),

  // Thống kê doanh thu theo phim
  getRevenueByMovie: (params) => axiosClient.get('/admin/revenue/by-movie', { params }),

  // Thống kê doanh thu theo rạp
  getRevenueByCinema: (params) => axiosClient.get('/admin/revenue/by-cinema', { params }),

  // Thống kê số lượng vé
  getTicketStats: (params) => axiosClient.get('/admin/stats/tickets', { params }),
};

export default adminApi;
