import api from "./axios";

// User Management
export const createUser = async (userData) => {
  const { data } = await api.post("/api/admin/users", userData);
  return data;
};

export const getUsers = async (params = {}) => {
  const { data } = await api.get("/api/admin/users", { params });
  return data;
};

export const deleteUser = async (id) => {
  const { data } = await api.delete(`/api/admin/users/${id}`);
  return data;
};

export const updateUserRole = async (id, role) => {
  const { data } = await api.patch(`/api/admin/users/${id}/role`, { role });
  return data;
};

// Room Management
export const createRoom = async (roomData) => {
  const { data } = await api.post("/api/admin/rooms", roomData);
  return data;
};

export const getRooms = async (params = {}) => {
  const { data } = await api.get("/api/admin/rooms", { params });
  return data;
};

export const assignRoom = async (roomId, studentId) => {
  const { data } = await api.patch(`/api/admin/rooms/${roomId}/assign`, {
    studentId,
  });
  return data;
};

export const unassignRoom = async (roomId, studentId) => {
  const { data } = await api.delete(`/api/admin/rooms/${roomId}/assign`, {
    data: { studentId },
  });
  return data;
};

// Reports / Dashboard
export const getSummaryReport = async () => {
  const { data } = await api.get("/api/admin/reports/summary");
  return data;
};

export const getAdminDashboardStats = async () => {
  const { data } = await api.get("/api/admin/dashboard/stats");
  return data;
};

// Canteen Management
export const createTransaction = async (transactionData) => {
  const { data } = await api.post(
    "/api/admin/canteen/transactions",
    transactionData
  );
  return data;
};

export const getTransactions = async () => {
  const { data } = await api.get("/api/admin/canteen/transactions");
  return data;
};

export const getCanteenStats = async () => {
  const { data } = await api.get("/api/admin/canteen/stats");
  return data;
};

export const getStudentBalance = async (studentId) => {
  const { data } = await api.get(`/api/admin/canteen/balance/${studentId}`);
  return data;
};
