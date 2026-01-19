import apiClient from './apiConfig';

export const subscribeNewsletter = async (email) => {
  const response = await apiClient.post('/newsletter/subscribe', { email });
  return response.data;
};

export const getNewsletterSubscribers = async () => {
  const response = await apiClient.get('/newsletter');
  return response.data;
};

export const deleteNewsletterSubscriber = async (id) => {
  const response = await apiClient.delete(`/newsletter/${id}`);
  return response.data;
};

export const sendProductNewsletter = async (productId) => {
  const response = await apiClient.post(`/newsletter/send/product/${productId}`);
  return response.data;
};

export const sendPromotionNewsletter = async (promotionId) => {
  const response = await apiClient.post(`/newsletter/send/promotion/${promotionId}`);
  return response.data;
};
