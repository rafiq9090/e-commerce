import apiClient from "./apiConfig";

export const addAddress = async (addressData) => {
  try {
    const response = await apiClient.post("/user/addresses", addressData);
    return response.data;
  } catch (error) {
    console.error("Error adding address:", error);
    throw error;
  }
};