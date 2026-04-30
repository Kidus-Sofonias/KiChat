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
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
