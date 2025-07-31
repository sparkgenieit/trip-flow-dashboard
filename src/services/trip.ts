import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL + '/trips';

export interface Trip {
  id: number;
  startTime: string;
  endTime?: string;
  distance?: number;
  actual_distance?: number;
  start_location?: string;
  end_location?: string;
  status: string;
  breakdownReported: boolean;
  breakdownNotes?: string;

  booking?: {
    pickupAddress?: { address: string };
    dropAddress?: { address: string };
    user?: { name: string };
  };

  driver?: {
    id: number;
    fullName: string;
    profiles?: { full_name: string };
  };

  vehicle?: { registrationNumber: string };

  assistances?: {
    id: number;
    subject: string;
    description: string;
    location: string;
    createdAt: string;
    reply: string | null;
    messageStatus: 'READ' | 'UNREAD';
  }[];
}

// ✅ Fetch all trips
export const getTrips = async (): Promise<Trip[]> => {
  const token = localStorage.getItem('authToken');
  const response = await axios.get(API_BASE, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  });
  return response.data;
};

// [Optional] ✅ Get trip by ID
export const getTripById = async (id: string): Promise<Trip> => {
  const token = localStorage.getItem('authToken');
  const response = await axios.get(`${API_BASE}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  });
  return response.data;
};

// [Optional] ✅ Delete trip by ID
export const deleteTrip = async (id: string) => {
  const token = localStorage.getItem('authToken');
  return await axios.delete(`${API_BASE}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  });
};
