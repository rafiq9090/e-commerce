import apiClient from './apiConfig';

export const placeOrder = async (orderData) => {
  try {
    const response = await apiClient.post('/orders', orderData);
    return response.data;
  } catch (error) {
    console.error('Error placing order:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const placeGuestOrder = async (orderData) => {
  try {
    const response = await apiClient.post('/orders', orderData, {
      headers: { 'X-Guest-Order': 'true' }
    });
    return response.data;
  } catch (error) {
    console.error('Error placing guest order:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const trackOrderPublic = async (orderId) => {
  try {
    const response = await apiClient.get(`/orders/track/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Error tracking order:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const trackOrderSecure = async (orderId, identifier) => {
  try {
    const response = await apiClient.post('/orders/track/secure', { 
      orderId, 
      email: identifier.includes('@') ? identifier : null,
      phone: !identifier.includes('@') ? identifier : null
    });
    return response.data;
  } catch (error) {
    console.error('Error tracking order securely:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};
export const trackOrder = trackOrderPublic;

export const getPhoneOrderStats = async (phone) => {
  try {
    const response = await apiClient.get('/orders/phone-stats', { params: { phone } });
    return response.data;
  } catch (error) {
    console.error('Error fetching phone order stats:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const getOrderHistory = async () => {
  try {
    const response = await apiClient.get('/orders/my-orders'); 
    return response.data;
  } catch (error) {
    console.error('Error fetching order history:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Gets single order details
 * @param {string} orderId
 */
export const getOrderDetails = async (orderId) => {
  try {
    const response = await apiClient.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching order details:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Cancels an order
 * @param {string} orderId
 * @param {string} reason
 */
export const cancelOrder = async (orderId, reason) => {
  try {
    const response = await apiClient.patch(`/orders/${orderId}/cancel`, { reason });
    return response.data;
  } catch (error) {
    console.error('Error cancelling order:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// --- Admin Order APIs ---

/**
 * Gets all orders (Admin only)
 * @param {Object} filters - { status, startDate, endDate, customer, page, limit }
 */
export const getAllOrders = async (filters = {}) => {
  try {
    const response = await apiClient.get('/orders/admin/list', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching all orders:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Updates order status (Admin only)
 * @param {string} orderId
 * @param {string} status
 * @param {string} comment
 */
export const updateOrderStatus = async (orderId, status, comment = '') => {
  try {
    const response = await apiClient.put(`/orders/admin/${orderId}/status`, { 
      status, 
      comment 
    });
    return response.data;
  } catch (error) {
    console.error('Error updating order status:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Gets order statistics (Admin only)
 * @param {string} period - day, week, month, year
 */
export const getOrderStatistics = async (period = 'month') => {
  try {
    const response = await apiClient.get('/orders/admin/overview', { 
      params: { period } 
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching order statistics:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};
