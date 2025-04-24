import axios from "axios";

const axiosBase = axios.create({
  baseURL: "http://localhost:5000/",
  withCredentials: true, // needed for sessions
});

// Optional: log API response errors
axiosBase.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data);
    return Promise.reject(error);
  }
);

export default axiosBase;
