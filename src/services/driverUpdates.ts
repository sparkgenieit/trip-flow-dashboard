import axios from 'axios';

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

  const updates = [
    {
      latitude: 12.9716,
      longitude: 77.5946,
      statusMessage: 'Started from Bangalore',
    },
    {
      latitude: 13.0346,
      longitude: 77.5971,
      statusMessage: 'Reached Hebbal',
    },
    {
      latitude: 13.0666,
      longitude: 77.6101,
      statusMessage: 'Crossed Airport Road',
    },
    {
      latitude: 13.0812,
      longitude: 77.6204,
      statusMessage: 'Approaching Airport',
    },
  ];

  const response = await axios.post(
    `${API_BASE}/mock`,
    { tripId, driverId, updates },
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
