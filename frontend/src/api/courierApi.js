import apiClient from './apiConfig';

export const createSteadfastOrder = async (orderId) => {
  try {
    const response = await apiClient.post('/courier/steadfast/create', { orderId });
    return response.data;
  } catch (error) {
    console.error('Error creating Steadfast order:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const createSteadfastBulkOrders = async (orderIds) => {
  try {
    const response = await apiClient.post('/courier/steadfast/bulk', { orderIds });
    return response.data;
  } catch (error) {
    console.error('Error creating Steadfast bulk orders:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};
