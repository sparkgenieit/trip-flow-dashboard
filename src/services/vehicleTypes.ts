// src/services/vehicleTypes.ts
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL + '/vehicle-types';

// DTO (server returns this shape)
export interface VehicleTypeDTO {
  id?: number;
  name: string;
  estimatedRatePerKm: number;
  baseFare: number;
  seatingCapacity: number;
  image?: string; // stored as a single path string, e.g. "uploads/vehicle-types/xxx.jpg"
}

// Helpers
function authHeaders(extra?: Record<string, string>) {
  const token = localStorage.getItem('authToken');
  return {
    ...(extra || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const createVehicleType = async (formData: FormData) => {
  const res = await axios.post(API_BASE, formData, {
    headers: authHeaders({ 'Content-Type': 'multipart/form-data' }),
    withCredentials: true,
  });
  return res.data as VehicleTypeDTO;
};

export const updateVehicleType = async (id: number, formData: FormData) => {
  const res = await axios.patch(`${API_BASE}/${id}`, formData, {
    headers: authHeaders({ 'Content-Type': 'multipart/form-data' }),
    withCredentials: true,
  });
  return res.data as VehicleTypeDTO;
};

// LIST all
export const getVehicleTypes = async () => {
  const res = await axios.get(API_BASE, {
    headers: authHeaders(),
    withCredentials: true,
  });
  return res.data as VehicleTypeDTO[];
};

// GET one
export const getVehicleType = async (id: number) => {
  const res = await axios.get(`${API_BASE}/${id}`, {
    headers: authHeaders(),
    withCredentials: true,
  });
  return res.data as VehicleTypeDTO;
};

// DELETE
export const deleteVehicleType = async (id: number) => {
  const res = await axios.delete(`${API_BASE}/${id}`, {
    headers: authHeaders(),
    withCredentials: true,
  });
  return res.data as { message: string };
};

