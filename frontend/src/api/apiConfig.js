import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:5000/api/v1/",
  withCredentials: true, 
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (config.headers?.['X-Guest-Order']) {
      delete config.headers['X-Guest-Order'];
      return config;
    }
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
      console.log(" Attaching token to request:", token);
    } else {
      console.log("No token available yet (user not logged in)");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Token expired or unauthorized — clearing localStorage");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
     
    }
    return Promise.reject(error);
  }
);

export default apiClient;
