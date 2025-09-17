// REPLACE: src/services/vehicles.ts
import axios from 'axios';

const BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
const API_BASE = `${BASE}/vehicles`;

// ---- Vehicle Types endpoint + DTO ----
const VEHICLE_TYPES_API = `${BASE}/vehicle-types`;

export type VehicleTypeDto = {
  id: number;
  name: string;
  estimatedRatePerKm?: number;
  baseFare?: number;
  seatingCapacity?: number;
  image?: string | null;
};

/**
 * The (updated) Vehicle form sends a multipart FormData payload with keys like:
 * - registrationNumber, vehicleTypeId, status, lastServicedDate
 * - chassisNumber, vehicleExpiryDate, extraKmCharge, earlyMorningCharges, eveningCharges, videoUrl
 * - insurancePolicyNumber, insuranceStartDate, insuranceEndDate, insuranceContactNumber, rtoCode
 * - vendorId (admin only)
 * - image (file)
 *
 * We therefore accept FormData directly and do not transform it here.
 */

// ✅ Create vehicle with token-based authorization (multipart)
export const createVehicle = async (formData: FormData) => {
  const token = localStorage.getItem('authToken');
  const res = await axios.post(API_BASE, formData, {
    headers: {
      Authorization: `Bearer ${token ?? ''}`,
      'Content-Type': 'multipart/form-data',
    },
    withCredentials: true,
  });
  return res.data;
};

// ✅ Update vehicle by ID with token-based authorization (multipart)
export const updateVehicle = async (id: number, formData: FormData) => {
  const token = localStorage.getItem('authToken');
  const res = await axios.patch(`${API_BASE}/${id}`, formData, {
    headers: {
      Authorization: `Bearer ${token ?? ''}`,
      'Content-Type': 'multipart/form-data',
    },
    withCredentials: true,
  });
  return res.data;
};

// ✅ Fetch vehicles with authorization (if required)
export const getVehicles = async () => {
  const token = localStorage.getItem('authToken');
  const res = await axios.get(API_BASE, {
    headers: {
      Authorization: `Bearer ${token ?? ''}`,
    },
    withCredentials: true,
  });
  return res.data;
};

// ✅ Delete vehicle by ID with token-based authorization
export const deleteVehicle = async (id: number) => {
  const token = localStorage.getItem('authToken');
  const res = await axios.delete(`${API_BASE}/${id}`, {
    headers: {
      Authorization: `Bearer ${token ?? ''}`,
    },
    withCredentials: true,
  });
  return res.data;
};

// ✅ Fetch available vehicles by vehicleTypeId (and optional status)
export const getAvailableVehicles = async (
  vehicleTypeId: number,
  opts?: { status?: 'available' | 'maintenance' | 'out_of_service' }
) => {
  const token = localStorage.getItem('authToken');
  const params = new URLSearchParams();
  params.set('vehicleTypeId', String(vehicleTypeId));
  if (opts?.status) params.set('status', opts.status);

  const res = await axios.get(`${API_BASE}/available?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token ?? ''}`,
    },
    withCredentials: true,
  });
  return res.data;
};

// ✅ Assign vehicles to a booking (unchanged)
export const assignVehicleToBooking = async (
  bookingId: number,
  vehicleIds: number[]
) => {
  const token = localStorage.getItem('authToken');
  return await axios.post(
    `${BASE}/trips`,
    { bookingId, vehicleIds },
    {
      headers: {
        Authorization: `Bearer ${token ?? ''}`,
      },
      withCredentials: true,
    }
  );
};

// ✅ Fetch vehicle types from DB (works with plain array OR paginated response)
export const getVehicleTypes = async (): Promise<VehicleTypeDto[]> => {
  const token = localStorage.getItem('authToken');
  try {
    // Try paginated first
    const res = await axios.get(VEHICLE_TYPES_API, {
      params: { page: 1, pageSize: 1000 },
      headers: { Authorization: `Bearer ${token ?? ''}` },
      withCredentials: true,
    });
    const payload = res.data;
    if (Array.isArray(payload)) return payload as VehicleTypeDto[];
    if (Array.isArray(payload?.data)) return payload.data as VehicleTypeDto[];
    return [];
  } catch {
    // Fallback to plain array endpoint
    const alt = await axios.get(VEHICLE_TYPES_API, {
      headers: { Authorization: `Bearer ${token ?? ''}` },
      withCredentials: true,
    });
    const data = alt.data;
    if (Array.isArray(data)) return data as VehicleTypeDto[];
    if (Array.isArray(data?.data)) return data.data as VehicleTypeDto[];
    return [];
  }
};

// Optional helper if you assign a single vehicle to a trip
export const assignVehicleToTrip = (tripId: number, vehicleId: number) =>
  fetch(`${BASE}/trips/${tripId}/assign-vehicle`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
    },
    body: JSON.stringify({ vehicleId }),
  }).then((res) => {
    if (!res.ok) throw new Error('Failed to assign vehicle');
    return res.json();
  });