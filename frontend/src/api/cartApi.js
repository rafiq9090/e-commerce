import apiClient from './apiConfig';

// GET /api/v1/cart
export const getCart = async () => {
  try {
    const response = await apiClient.get('/cart');
    return response.data; 
  } catch (error) {
    console.error("Error fetching cart:", error);
    throw error.response.data;
  }
};

// POST /api/v1/cart/items
export const addToCart = async (productId, quantity) => {
  try {
    const response = await apiClient.post('/cart/items', { productId, quantity });
    return response.data;
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw error.response.data;
  }
};

// PUT /api/v1/cart/items/:cartItemId
export const updateCartItem = async (cartItemId, quantity) => {
  try {
    const response = await apiClient.put(`/cart/items/${cartItemId}`, { quantity });
    return response.data;
  } catch (error) {
    console.error("Error updating cart item:", error);
    throw error.response.data;
  }
};

// DELETE /api/v1/cart/items/:cartItemId
export const removeCartItem = async (cartItemId) => {
  try {
    const response = await apiClient.delete(`/cart/items/${cartItemId}`);
    return response.data;
  } catch (error) {
    console.error("Error removing cart item:", error);
    throw error.response.data;
  }
};

// DELETE /api/v1/cart/clear
export const clearCart = async () => {
  try {
    const response = await apiClient.delete('/cart/clear');
    return response.data; 
  } catch (error) {
    console.error("Error clearing cart:", error);
    throw error.response.data;
  }
};