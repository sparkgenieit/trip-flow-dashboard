import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL + '/vehicles';

interface VehicleCreateInput {
  name: string;
  model: string;
  image: string;
  capacity: number;
  registrationNumber: string;
  price: number;
  originalPrice: number;
  comfortLevel?: number;
  status?: string;
  lastServicedDate?: string;
  vehicleTypeId: number;
  vendorId?: number | null;
}

// ✅ Create vehicle with token-based authorization
export const createVehicle = async (data: VehicleCreateInput) => {
  const token = localStorage.getItem('authToken');
  return await axios.post(API_BASE, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  });
};

// ✅ Update vehicle by ID with token-based authorization
export const updateVehicle = async (id: number, data: VehicleCreateInput) => {
  const token = localStorage.getItem('authToken');
  return await axios.patch(`${API_BASE}/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  });
};

// ✅ Fetch vehicles with authorization (if required)
export const getVehicles = async () => {
  const token = localStorage.getItem('authToken');
  const res = await axios.get(API_BASE, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  });
  return res.data;
};

// ✅ Delete vehicle by ID with token-based authorization
export const deleteVehicle = async (id: number) => {
  const token = localStorage.getItem('authToken');
  return await axios.delete(`${API_BASE}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  });
};


// ✅ Fetch available vehicles by vehicleTypeId
export const getAvailableVehicles = async (vehicleTypeId: number) => {
  const token = localStorage.getItem('authToken');
  const res = await axios.get(`${API_BASE}/available?typeId=${vehicleTypeId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  });
  return res.data;
};

// ✅ Assign vehicles to a booking
export const assignVehicleToBooking = async (
  bookingId: number,
  vehicleIds: string[]
) => {
  const token = localStorage.getItem('authToken');
  return await axios.post(
    `${import.meta.env.VITE_API_BASE_URL}/bookings/${bookingId}/assign-vehicles`,
    { vehicleIds },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    }
  );
};