import axios from "axios";

const instance = axios.create({
  // baseURL: "https://kichat.onrender.com",
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("API Error: ", err.response?.data || err.message);
    return Promise.reject(err);
  }
);

export default instance;
