import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL + '/users';

interface UpdateProfileInput {
  name: string;
  phone: string;
  age: number;
  gender: string;
}

// ✅ GET /users/me → fetch current user profile
export const getProfile = async () => {
  const token = localStorage.getItem('authToken');
  const res = await axios.get(`${API_BASE}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  });
  return res.data;
};

// ✅ PATCH /users/me → update profile
export const updateProfile = async (data: UpdateProfileInput) => {
  const token = localStorage.getItem('authToken');
  const res = await axios.patch(`${API_BASE}/me`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  });
  return res.data;
};

export const changePassword = async (data: {
  currentPassword: string;
  newPassword: string;
}) => {
  const token = localStorage.getItem('authToken');
  return await axios.post(`${API_BASE}/change-password`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  });
};
