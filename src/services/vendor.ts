// src/services/vendor.service.ts
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

// 🔐 Auth header
const authHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
};

// ✅ Fetch all vendors
export const fetchAllVendors = async () => {
  const res = await axios.get(`${BASE_URL}/admin/vendor`, authHeaders());
  return res.data;
};

// ✅ Create new vendor
export const createVendor = async (data: any) => {
  const res = await axios.post(`${BASE_URL}/admin/vendor`, data, authHeaders());
  return res.data;
};

// ✅ Update vendor by ID
export const updateVendor = async (id: string, data: any) => {
  const res = await axios.put(`${BASE_URL}/admin/vendor/${id}`, data, authHeaders());
  return res.data;
};

// ✅ Delete vendor by ID
export const deleteVendor = async (id: string) => {
  const res = await axios.delete(`${BASE_URL}/admin/vendor/${id}`, authHeaders());
  return res.data;
};
