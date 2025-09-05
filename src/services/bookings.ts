import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export interface BookingPayload {
  pickupLocation: string;
  dropoffLocation: string;
  pickupDateTime: string; // ISO string format for date
  returnDate?: string;    // NEW: "YYYY-MM-DD" (send only for round trip)
  bookingType: string;
  vehicleTypeId: number;
  estimatedCost: number;
  notes: string;
  fromCityId: number;
  toCityId: number;
  fare: number;
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

  // ✅ Inject customerName from user.name
  const bookings = res.data.map((booking: any) => ({
    ...booking,
    customerName: booking.user?.name || booking.user?.email || 'Unknown',
  }));

  return bookings;
};

export const getBookingById = async (id: number) => {
  const res = await axios.get(`${BASE_URL}/bookings/${id}`, authHeaders());
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

export const fetchUserByPhone = async (phone: string) => {
  const res = await axios.post(
    `${BASE_URL}/users/check-phone`,
    { phone },
    authHeaders(),
  );
  return res.data;
};

export async function confirmBookingIfAssigned(id: number) {
  const res = await axios.patch(`${BASE_URL}/bookings/${id}/confirm-if-assigned`, {}, authHeaders());
  return res.data;
}

export const getAvailableVehicles = async (vehicleTypeId: number) => {
  const res = await axios.get(
    `${BASE_URL}/bookings/assignable-vehicles/${vehicleTypeId}`,
    authHeaders()
  );
  return res.data;
};



