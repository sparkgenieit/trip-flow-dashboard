import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

const authHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
};

// 🔓 Vendor-facing: list of bookings shared with this vendor
export const fetchSharedBookings = async () => {
  const res = await axios.get(`${BASE_URL}/quotes/shared-bookings`, authHeaders());
  return res.data;
};

// 📤 Vendor submits a quote
export const submitQuote = async (bookingId: number, amount: number) => {
  await axios.post(
    `${BASE_URL}/quotes/submit`,
    { bookingId, amount },
    authHeaders()
  );
};

// 📥 Admin: get all quotes for a booking
export const fetchQuotesForBooking = async (bookingId: number) => {
  const res = await axios.get(`${BASE_URL}/quotes/${bookingId}`, authHeaders());
  return res.data;
};

// ✅ Admin approves a quote
export const approveQuote = async (quoteId: number) => {
  await axios.post(`${BASE_URL}/quotes/approve`, { quoteId }, authHeaders());
};

// ✉️ Admin shares booking to vendors
export const shareBookingWithVendors = async (bookingId: number) => {
  await axios.post(`${BASE_URL}/quotes/share`, { bookingId }, authHeaders());
};
export const submitVendorQuote = async ({
  bookingId,
  amount,
  notes,
}: {
  bookingId: number;
  amount: number;
  notes?: string;
}) => {
  const res = await axios.post(
    `${BASE_URL}/quotes`,
    { bookingId, amount, notes },
    authHeaders()
  );
  return res.data;
};