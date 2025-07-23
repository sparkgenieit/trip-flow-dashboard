// src/services/addressBook.ts

import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL + '/address-book';

interface UpdateAddressInput {
  id: number;
  address: string;
  city: string;
  pinCode: string;
  type: string;
}

// ✅ GET /address-book/me → fetch address for logged-in user
export const getAddressBook = async () => {
  const token = localStorage.getItem('authToken');
  const res = await axios.get(`${API_BASE}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  });
  return res.data;
};

// ✅ PUT /address-book/:id → update address
export const updateAddressBook = async (data: UpdateAddressInput) => {
  const token = localStorage.getItem('authToken');
  const res = await axios.put(`${API_BASE}/${data.id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  });
  return res.data;
};
