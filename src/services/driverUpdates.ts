import axios from 'axios';
import { driverUpdateMocks } from '@/pages/trips/driverUpdates';


const API_BASE = import.meta.env.VITE_API_BASE_URL + '/driver-updates'; // ✅ Correct

export interface DriverUpdate {
  id: number;
  latitude: number;
  longitude: number;
  statusMessage: string;
  createdAt: string;
  tripId: number;
  driverId: number;
}


// ✅ GET: fetch updates by tripId
export const getDriverUpdatesByTrip = async (tripId: number): Promise<DriverUpdate[]> => {
  const token = localStorage.getItem('authToken');
  const response = await axios.get(`${API_BASE}/${tripId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  });
  return response.data;
};

// ✅ POST: seed mock updates
export const seedMockDriverUpdates = async (tripId: number, driverId: number) => {
  const token = localStorage.getItem('authToken');

  const response = await axios.post(
    `${API_BASE}/mock`,
    { tripId, driverId, updates: driverUpdateMocks },

    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    }
  );

  return response.data;
};