// src/services/availability.ts
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export type DayCell = {
  status: 'available' | 'assigned' | 'blocked';
  refId?: number; // bookingId / blockId etc.
};

export type AvailabilityRow = {
  vendorId: number;
  vendorName: string;
  vehicleId: number;
  registrationNumber: string;
  vehicleTypeId: number;
  vehicleTypeName: string;
  days: Record<string, DayCell>; // key: 'YYYY-MM-DD'
};

// Query API for the matrix
export async function getVehicleAvailabilityMatrix(params: {
  dateFrom: string;
  dateTo: string;
  vendorId: number;
  vehicleTypeId?: number;
  location?: string;
}): Promise<AvailabilityRow[]> {
  const token = localStorage.getItem('authToken');
  const res = await axios.get(`${BASE_URL}/availability/vehicles`, {
    params,
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
    withCredentials: true,
  });
  return res.data as AvailabilityRow[];
}

// Assign a vehicle for a given date to a booking (optional endpoint)
export async function assignVehicleForDate(payload: {
  vehicleId: number;
  date: string; // YYYY-MM-DD
  bookingId: number;
}) {
  const token = localStorage.getItem('authToken');
  const res = await axios.post(`${BASE_URL}/availability/assign`, payload, {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
    withCredentials: true,
  });
  return res.data;
}
