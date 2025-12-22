import api from "./axios";

export const getPendingLeaves = async () => {
  const { data } = await api.get("/api/warden/leaves/pending");
  return data;
};

export const approveLeave = async (id) => {
  const { data } = await api.patch(`/api/warden/leaves/${id}/approve`, {
    status: "APPROVED",
  });
  return data;
};

export const rejectLeave = async (id) => {
  const { data } = await api.patch(`/api/warden/leaves/${id}/reject`, {
    status: "REJECTED",
  });
  return data;
};

export const markAttendance = async (records) => {
  const { data } = await api.post("/api/warden/attendance/mark", { records });
  return data;
};

export const getStudentAttendance = async (studentId) => {
  const { data } = await api.get(`/api/warden/attendance/${studentId}`);
  return data;
};

export const getComplaints = async (status) => {
  const params = status ? `?status=${status}` : "";
  const { data } = await api.get(`/api/warden/complaints${params}`);
  return data;
};

export const updateComplaintStatus = async (id, status, remarks) => {
  const { data } = await api.patch(`/api/warden/complaints/${id}`, {
    status,
    remarks,
  });
  return data;
};

export const getDashboardStats = async () => {
  const { data } = await api.get("/api/warden/dashboard/stats");
  return data;
};

export const getStudentsList = async (date) => {
  const params = date ? `?date=${date}` : "";
  const { data } = await api.get(`/api/warden/students${params}`);
  return data;
};
