// src/api/productApi.js
import apiClient from './apiConfig';

export const getProducts = async () => {
  try {
    const response = await apiClient.get('/products');
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

// You are missing the 'export' keyword on this function
export const getProductBySlug = async (slug) => {
  try {
    const response = await apiClient.get(`/products/${slug}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
};