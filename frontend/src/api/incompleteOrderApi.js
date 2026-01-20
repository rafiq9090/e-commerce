import apiClient from './apiConfig';

export const upsertIncompleteOrder = async (payload) => {
  try {
    const response = await apiClient.post('/incomplete-orders', payload);
    return response.data;
  } catch (error) {
    console.error('Error saving incomplete order:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const clearIncompleteOrder = async (clientId, source) => {
  try {
    const response = await apiClient.post('/incomplete-orders/clear', { clientId, source });
    return response.data;
  } catch (error) {
    console.error('Error clearing incomplete order:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const listIncompleteOrders = async () => {
  try {
    const response = await apiClient.get('/incomplete-orders/admin/list');
    return response.data;
  } catch (error) {
    console.error('Error fetching incomplete orders:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};
