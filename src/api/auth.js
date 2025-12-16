import api from "./axios";

export const loginUser = async (credentials) => {
  const { data } = await api.post("/api/auth/login", credentials);
  return data;
};

export const registerUser = async (userData) => {
  const { data } = await api.post("/api/auth/register", userData);
  return data;
};

export const logoutUser = async () => {
  const { data } = await api.post("/api/auth/logout");
  return data;
};

export const refreshToken = async (refreshToken) => {
  const { data } = await api.post("/api/auth/refresh-token", { refreshToken });
  return data;
};

export const forgotPassword = async (email) => {
  const { data } = await api.post("/api/auth/forgot-password", { email });
  return data;
};

export const resetPassword = async (token, password) => {
  const { data } = await api.post("/api/auth/reset-password", {
    token,
    password,
  });
  return data;
};

export const verifyEmail = async (token) => {
  const { data } = await api.get(`/api/auth/verify-email?token=${token}`);
  return data;
};

export const resendVerificationEmail = async (email) => {
  const { data } = await api.post("/api/auth/resend-verification", { email });
  return data;
};
