import axios from "axios";

const normalizeUrl = (value = "") => value.replace(/\/+$/, "");

const defaultApiBaseUrl =
  typeof window !== "undefined" &&
  ["127.0.0.1", "localhost"].includes(window.location.hostname)
    ? `http://${window.location.hostname}:3001`
    : "";

const apiBaseUrl = normalizeUrl(import.meta.env.VITE_API_URL || defaultApiBaseUrl);

const instance = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  timeout: 30000,
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ECONNABORTED") {
      error.response = error.response || {
        data: {
          msg: "The server took too long to respond. Please try again in a moment.",
        },
      };
    }

    return Promise.reject(error);
  }
);

export default instance;
