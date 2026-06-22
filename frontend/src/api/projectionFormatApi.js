import axiosClient from './axiosClient';

const projectionFormatApi = {
  getAll: () => axiosClient.get('/admin/projection-formats'),
  create: (data) => axiosClient.post('/admin/projection-formats', data),
  update: (id, data) => axiosClient.put(`/admin/projection-formats/${id}`, data),
  delete: (id) => axiosClient.delete(`/admin/projection-formats/${id}`),
  bulkUpdateSurcharges: (data) => axiosClient.put('/admin/projection-formats/surcharges', data),
};

export default projectionFormatApi;
