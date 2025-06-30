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
  vendorId?: number;
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
