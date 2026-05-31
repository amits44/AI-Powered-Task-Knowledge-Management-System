import axios from "axios";

const api = axios.create({ baseURL: "" });

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

// Auth
export const login = (email, password) =>
  api.post("/auth/login", { email, password });

// Users (Admin)
export const getUsers = () => api.get("/users");
export const createUser = (data) => api.post("/users", data);
export const deleteUser = (id) => api.delete(`/users/${id}`);

// Tasks
export const getTasks = (params = {}) => api.get("/tasks", { params });
export const createTask = (data) => api.post("/tasks", data);
export const updateTaskStatus = (id, status) =>
  api.patch(`/tasks/${id}/status`, { status });

// Documents
export const getDocuments = () => api.get("/documents");
export const uploadDocument = (formData) =>
  api.post("/documents", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Search
export const semanticSearch = (query, top_k = 5) =>
  api.post("/search", { query, top_k });

// Analytics
export const getAnalytics = () => api.get("/analytics");
