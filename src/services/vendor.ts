// 🔁 REPLACE vendor.service.ts
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

// 🔐 Add token to requests
const authHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
};

// 🚀 Fetch all vendors (raw response)
export const fetchAllVendors = async () => {
  const res = await axios.get(`${BASE_URL}/admin/vendor`, authHeaders());
  return res.data;
};
