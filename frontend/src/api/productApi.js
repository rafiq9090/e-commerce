// src/api/productApi.js - FIXED VERSION
import apiClient from './apiConfig';

export const getProducts = async (filters = {}) => {
  try {
    const response = await apiClient.get('/products', { params: filters });
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

export const getProductBySlug = async (slug) => {
  try {

    const response = await apiClient.get(`/products/slug/${slug}`);

    return response.data;
  } catch (error) {
    throw error;
  }
};

// src/api/productApi.js - SIMPLIFIED VERSION
export const searchProducts = async (query, filters = {}) => {
  try {
    console.log('🔍 Frontend: Searching for:', query);

    // ✅ Use only one parameter to avoid confusion
    const params = {
      q: query, // Use only 'q' parameter
      ...filters
    };

    console.log('🔍 API Request params:', params);

    const response = await apiClient.get('/products/search', {
      params
    });

    console.log('🔍 API Success - Products found:', response.data.data?.length || 0);
    return response.data;

  } catch (error) {
    console.error("❌ Search API Error:");
    console.error("❌ Status:", error.response?.status);
    console.error("❌ Response:", error.response?.data);                                                                                                                                                                                                                                                                                                          
    console.error("❌ Message:", error.response?.data?.message);

    throw error;
  }
};

export const getFeaturedProducts = async (limit = 10) => {
  try {
    const response = await apiClient.get('/products/featured', {
      params: { limit }
    });
    return response.data;
  } catch (error) {

    throw error;
  }
};

export const getRelatedProducts = async (productId, limit = 4) => {
  try {
    const response = await apiClient.get(`/products/related/${productId}`, {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching related products:", error);
    throw error;
  }
};

// ADMIN FUNCTIONS (if needed later)
export const createProduct = async (productData) => {
  try {
    const response = await apiClient.post('/products', productData);
    return response.data;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

export const updateProduct = async (productId, productData) => {
  try {
    const response = await apiClient.put(`/products/${productId}`, productData);
    return response.data;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

export const deleteProduct = async (productId) => {
  try {
    const response = await apiClient.delete(`/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

export const getCategories = async () => {
  try {
    const response = await apiClient.get('/categories');
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

export const getSuppliers = async () => {
  try {
    const response = await apiClient.get('/suppliers');
    return response.data;
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    throw error;
  }
};