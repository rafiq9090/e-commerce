// src/api/authApi.js
import apiClient from "./apiConfig";

// Login API
export const loginUser = async (email, password) => {
  try {
    const response = await apiClient.post("/auth/login", { email, password });

    // 1. Use 'token', not 'accessToken'
    const { user, token } = response.data.data;

    if (token) {
      // 2. Save the token
      localStorage.setItem("token", token);
      console.log("Token saved to localStorage:", token);
    }

    // 3. Return the user and the token
    return { user, token };
  } catch (error) {
    console.error("Error logging in:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

//  Register API (Updated for consistency)
export const registerUser = async (email, password, profile) => {
  try {
    const response = await apiClient.post("/auth/register", {
      email,
      password,
      profile,
    });
    
    // 1. Use 'token', not 'accessToken'
    const { user, token } = response.data.data;

    if (token) {
      // 2. Save token and auto-login
      localStorage.setItem("token", token);
      console.log("Token saved to localStorage:", token);
    }

    // 3. Return user and token
    return { user, token };
  } catch (error) {
    console.error("Error registering:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};


export const logoutUser = async () => {
  try {
    await apiClient.post("/auth/logout");
    localStorage.removeItem("token");
    console.log("🚪 Logged out, token removed from localStorage");
  } catch (error) {
    console.error("Error logging out:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const getUserProfile = async () => {
  try {
    // Calls GET /api/v1/auth/user/profile
    const response = await apiClient.get("/user/profile");
    console.log("Fetched user profile:", response.data.data);
    return response.data;
  
  } catch (error) {
    console.error("Error fetching user profile:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const addAddress = async (addressData) => {
  try {
    const response = await apiClient.post("/user/addresses", addressData);
    return response.data;
  } catch (error) {
    console.error("Error adding address:", error);
    throw error;
  }
};