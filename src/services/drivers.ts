import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL + '/drivers';

export interface DriverCreateInput {
  name: string;
  phone: string;
  email: string;
  licenseNumber: string;
  license_expiry: string;
  is_part_time?: boolean;
  is_available?: boolean;
  vendor_id: string;
  assigned_vehicle_id?: string;
}

// ✅ Create driver with token
export const createDriver = async (data: DriverCreateInput) => {
  const token = localStorage.getItem('authToken');
  return await axios.post(API_BASE, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  });
};

// ✅ Fetch all drivers
export const getDrivers = async () => {
  const token = localStorage.getItem('authToken');
  const res = await axios.get(API_BASE, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  });
  return res.data;
};

// ✅ Update driver by ID
export const updateDriver = async (id: number, data: Partial<DriverCreateInput>) => {
  const token = localStorage.getItem('authToken');
  return await axios.patch(`${API_BASE}/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  });
};

// ✅ Delete driver by ID
export const deleteDriver = async (id: number | string) => {
  const token = localStorage.getItem('authToken');
  return await axios.delete(`${API_BASE}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  });
};

// ✅ Get available drivers for a vehicle
export const getAvailableDrivers = async (vehicleId: number) => {
  const token = localStorage.getItem('authToken');
  const res = await axios.get(`${API_BASE}/available?vehicleId=${vehicleId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  });
  return res.data;
};

// ✅ Assign a driver to a vehicle
export const assignDriverToVehicle = async (vehicleId: number, driverId: number) => {
  const token = localStorage.getItem('authToken');
  return await axios.patch(`${API_BASE}/assign`, {
    vehicleId,
    driverId,
  }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  });
};
