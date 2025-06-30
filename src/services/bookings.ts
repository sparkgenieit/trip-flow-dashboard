import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export interface BookingPayload {
  pickupLocation: string;
  dropoffLocation: string;
  pickupTime: Date;
  bookingType: string;
  vehicleType: string;
  vehicleModel: string;
  estimatedCost: number;
  notes: string;
}

// 🔐 Automatically adds token to every request
const authHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
};

export const fetchBookings = async () => {
  const res = await axios.get(`${BASE_URL}/bookings`, authHeaders());
  return res.data;
};

export const createBooking = async (payload: BookingPayload) => {
  const res = await axios.post(`${BASE_URL}/bookings`, payload, authHeaders());
  return res.data;
};

export const updateBooking = async (id: number, payload: BookingPayload) => {
  const res = await axios.patch(`${BASE_URL}/bookings/${id}`, payload, authHeaders());
  return res.data;
};

export const deleteBooking = async (id: number) => {
  const res = await axios.delete(`${BASE_URL}/bookings/${id}`, authHeaders());
  return res.data;
};

export const fetchUserByEmail = async (email: string) => {
  const res = await axios.post(
    `${BASE_URL}/admin/users/check-email`,
    { email },
    authHeaders(),
    
  );
  return res.data;
};