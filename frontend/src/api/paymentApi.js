import apiClient from './apiConfig';

export const createBkashPayment = async (orderId) => {
  try {
    const response = await apiClient.post('/payments/bkash/create', { orderId });
    return response.data;
  } catch (error) {
    console.error('Error creating bKash payment:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const createNagadPayment = async (orderId) => {
  try {
    const response = await apiClient.post('/payments/nagad/create', { orderId });
    return response.data;
  } catch (error) {
    console.error('Error creating Nagad payment:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};
