import axios from 'axios';

const API = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:4000';

const client = axios.create({ baseURL: API });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` };
  return config;
});

export interface VehicleTypeDTO {
  id?: number;
  name: string;
  estimatedRatePerKm: number;
  baseFare: number;
  seatingCapacity: number;
  image?: any; // Json or Json[]
}

export async function getVehicleTypes(): Promise<VehicleTypeDTO[]> {
  const { data } = await client.get('/vehicle-types');
  return data;
}

export async function getVehicleType(id: number): Promise<VehicleTypeDTO> {
  const { data } = await client.get(`/vehicle-types/${id}`);
  return data;
}

export async function createVehicleType(payload: Partial<VehicleTypeDTO>): Promise<VehicleTypeDTO> {
  const { data } = await client.post('/vehicle-types', payload);
  return data;
}

export async function updateVehicleType(id: number, payload: Partial<VehicleTypeDTO>): Promise<VehicleTypeDTO> {
  const { data } = await client.patch(`/vehicle-types/${id}`, payload);
  return data;
}

export async function deleteVehicleType(id: number): Promise<void> {
  await client.delete(`/vehicle-types/${id}`);
}

export async function uploadVehicleTypeImage(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('file', file);

  // Let axios set the multipart boundary automatically (do NOT set Content-Type manually)
  const { data } = await client.post('/vehicle-types/upload', formData);
  return data; // { url: 'http://<host>/uploads/vehicle-types/<filename>' }
}