import api from "./axios";

export const getProfile = async () => {
  const { data } = await api.get("/api/student/me");
  return data;
};

export const updateProfile = async (profileData) => {
  const { data } = await api.put("/api/student/me", profileData);
  return data;
};

export const getAttendance = async () => {
  const { data } = await api.get("/api/student/attendance");
  return data;
};

export const getWallet = async () => {
  const { data } = await api.get("/api/student/wallet");
  return data;
};

export const getCanteenSummary = async () => {
  const { data } = await api.get("/api/student/canteen");
  return data;
};

export const getLeaves = async () => {
  const { data } = await api.get("/api/student/leaves");
  return data;
};

export const createLeave = async (leaveData) => {
  const { data } = await api.post("/api/student/leaves", leaveData);
  return data;
};

export const getComplaints = async () => {
  const { data } = await api.get("/api/student/complaints");
  return data;
};

export const createComplaint = async (complaintData) => {
  const { data } = await api.post("/api/student/complaints", complaintData);
  return data;
};
