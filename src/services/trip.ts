import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL + '/admin/trips';

export interface Trip {
  id: string;
  start_time: string;
  end_time: string;
  start_location: string;
  end_location: string;
  actual_distance: number;
  status: string;
  breakdown_reported: boolean;
  breakdown_notes: string;
  bookings: {
    pickup_location: string;
    dropoff_location: string;
    profiles: {
      full_name: string;
    };
  };
  drivers: {
    profiles: {
      full_name: string;
    };
  };
  vehicles: {
    vehicle_number: string;
  };
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
