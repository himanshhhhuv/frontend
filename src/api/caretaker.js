import api from "./axios";

export const getComplaints = async (status) => {
  const params = status ? `?status=${status}` : "";
  const { data } = await api.get(`/api/caretaker/complaints${params}`);
  return data;
};

export const getDashboardStats = async () => {
  const { data } = await api.get("/api/caretaker/dashboard/stats");
  return data;
};
