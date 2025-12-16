import api from "./axios";

// Menu
export const getMenu = async (category) => {
  const params = category ? `?category=${category}` : "";
  const { data } = await api.get(`/api/canteen/menu${params}`);
  return data;
};

export const createMenuItem = async (itemData) => {
  const { data } = await api.post("/api/canteen/menu", itemData);
  return data;
};

export const updateMenuItem = async (id, itemData) => {
  const { data } = await api.patch(`/api/canteen/menu/${id}`, itemData);
  return data;
};

export const deleteMenuItem = async (id) => {
  const { data } = await api.delete(`/api/canteen/menu/${id}`);
  return data;
};

// Orders
export const createOrder = async (orderData) => {
  const { data } = await api.post("/api/canteen/orders", orderData);
  return data;
};

export const getOrders = async (params = {}) => {
  const { data } = await api.get("/api/canteen/orders", { params });
  return data;
};

export const getOrderById = async (id) => {
  const { data } = await api.get(`/api/canteen/orders/${id}`);
  return data;
};

// Billing
export const quickBilling = async (rollNo, items, mealType) => {
  const { data } = await api.post("/api/canteen/billing", {
    rollNo,
    items,
    mealType,
  });
  return data;
};

export const lookupStudent = async (rollNo) => {
  const { data } = await api.get(`/api/canteen/lookup/${rollNo}`);
  return data;
};
