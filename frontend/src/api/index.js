import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:8000" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;

export const login = (email, password) =>
  api.post("/auth/login", { email, password });

export const register = (data) => api.post("/auth/register", data)
export const getTasks = (params = {}) => api.get("/tasks", { params });
export const createTask = (data) => api.post("/tasks", data);
export const updateTaskStatus = (id, status) =>
  api.patch(`/tasks/${id}/status`, { status });

export const getDocuments = () => api.get("/documents");
export const uploadDocument = (formData) =>
  api.post("/documents", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const semanticSearch = (query, top_k = 5) =>
  api.post("/search", { query, top_k });

export const getAnalytics = () => api.get("/analytics");
