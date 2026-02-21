import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5001/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      if (window.location.pathname !== "/login") window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const signup = (username, password) => api.post("/signup", { username, password });
export const login = (username, password) => api.post("/login", { username, password });
export const getMe = () => api.get("/me");
export const getDashboard = () => api.get("/dashboard");
export const getTransactions = (params) => api.get("/transactions", { params });
export const addTransaction = (data) => api.post("/transactions", data);
export const deleteTransaction = (id) => api.delete(`/transactions/${id}`);
export const exportTransactions = () => api.get("/transactions/export", { responseType: "blob" });
export const getBudgets = (month) => api.get("/budgets", { params: { month } });
export const createBudget = (data) => api.post("/budgets", data);
export const updateBudget = (id, data) => api.put(`/budgets/${id}`, data);
export const deleteBudget = (id) => api.delete(`/budgets/${id}`);
// Goals
export const getGoals = () => api.get("/goals");
export const createGoal = (data) => api.post("/goals", data);
export const updateGoal = (id, data) => api.put(`/goals/${id}`, data);
export const deleteGoal = (id) => api.delete(`/goals/${id}`);
export default api;
