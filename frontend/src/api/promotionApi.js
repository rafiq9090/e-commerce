import apiClient from './apiConfig';

export const getPromotions = async () => {
  const response = await apiClient.get('/promotions/admin');
  return response.data;
};

export const createPromotion = async (data) => {
  const response = await apiClient.post('/promotions/admin', data);
  return response.data;
};

export const updatePromotion = async (id, data) => {
  const response = await apiClient.put(`/promotions/admin/${id}`, data);
  return response.data;
};

export const deletePromotion = async (id) => {
  const response = await apiClient.delete(`/promotions/admin/${id}`);
  return response.data;
};
