import axiosClient from './axiosClient';

const pricingApi = {
  // Public — FE customer xem giá hiện hành
  getActive: () => axiosClient.get('/pricings/active'),

  // === Admin ===
  adminGetAll: () => axiosClient.get('/admin/pricings'),
  adminBulkUpdate: (items) => axiosClient.put('/admin/pricings', { items }),
};

export default pricingApi;
