// src/services/drivers.ts
// REPLACE WHOLE FILE

import axios from 'axios';

// -------- Base URL (Vite) --------
// Configure in .env:
//   VITE_API_BASE_URL=http://localhost:4001
//   # If your Nest app uses app.setGlobalPrefix('api'), also set:
//   # VITE_API_PREFIX=/api
const RAW_BASE =
  (import.meta as any).env?.VITE_API_BASE_URL ??
  (import.meta as any).env?.VITE_API_BASE_URL_LOCAL ??
  'http://localhost:4001';

const RAW_PREFIX = (import.meta as any).env?.VITE_API_PREFIX ?? '';

const API_BASE = String(RAW_BASE).replace(/\/+$/, '');
const API_PREFIX = RAW_PREFIX ? `/${String(RAW_PREFIX).replace(/^\/+/, '').replace(/\/+$/, '')}` : '';

const api = axios.create({
  baseURL: `${API_BASE}${API_PREFIX}`, // e.g. http://localhost:4001 or http://localhost:4001/api
});

// ---- Auto-detect global prefix (e.g. /api) once per session ----
let __prefixChecked = false;
async function ensurePrefix() {
  if (__prefixChecked) return;

  // 1) Try current base (with or without prefix)
  try {
    const res = await api.get('/drivers/ping', { validateStatus: () => true });
    if (res?.status && res.status !== 404) {
      __prefixChecked = true;
      return;
    }
  } catch {
    // ignore
  }

  // 2) Try FALLBACK: '/api' prefix if not already present
  if (!API_PREFIX || API_PREFIX === '') {
    try {
      const probe = await axios.get(`${API_BASE}/api/drivers/ping`, {
        validateStatus: () => true,
      });
      if (probe?.status && probe.status !== 404) {
        api.defaults.baseURL = `${API_BASE}/api`;
      }
    } catch {
      // ignore
    }
  }

  __prefixChecked = true;
}

// ---- Attach auth & credentials for all requests ----
api.interceptors.request.use((config) => {
  try {
    const token =
      localStorage.getItem('authToken') ||
      localStorage.getItem('accessToken') ||
      localStorage.getItem('token');
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
    config.withCredentials = true;
  } catch {
    // ignore (SSR or no localStorage)
  }
  return config;
});

// ---------- LIST ----------
export async function listDrivers(params?: {
  page?: number;
  pageSize?: number;
  q?: string;
  vendorId?: number;
  available?: boolean;
}) {
  await ensurePrefix();
  const res = await api.get('/drivers', { params });
  return res.data as { data: any[]; total: number; page: number; pageSize: number };
}

// ---------- BASIC ----------
export async function createDriverBasic(fd: FormData) {
  await ensurePrefix();
  const res = await api.post('/drivers', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data; // expected: created driver { id, ... }
}

export async function updateDriverBasic(driverId: number, fd: FormData) {
  await ensurePrefix();
  const res = await api.patch(`/drivers/${driverId}/basic`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

// ---------- COST ----------
export async function upsertDriverCost(
  driverId: number,
  payload: {
    driverSalary?: number | null;
    foodCost?: number | null;
    accommodationCost?: number | null;
    bhattaCost?: number | null;
    earlyMorningCharges?: number | null;
    eveningCharges?: number | null;
  },
) {
  await ensurePrefix();
  const body: any = {};
  Object.entries(payload || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') body[k] = v;
  });
  const res = await api.put(`/drivers/${driverId}/cost`, body);
  return res.data;
}

// ---------- DOCS ----------
export async function upsertDriverDocs(
  driverId: number,
  files: {
    aadhar?: File | null;
    pan?: File | null;
    voter?: File | null;
    license?: File | null;
  },
) {
  await ensurePrefix();
  const fd = new FormData();
  if (files.aadhar)  fd.append('aadhar', files.aadhar);
  if (files.pan)     fd.append('pan', files.pan);
  if (files.voter)   fd.append('voter', files.voter);
  if (files.license) fd.append('license', files.license);

  const res = await api.patch(`/drivers/${driverId}/docs`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

// ---------- FEEDBACK ----------
export async function upsertDriverFeedback(
  driverId: number,
  payload: {
    rating?: number | null;    // → ratingAvg
    feedback?: string | null;  // → remarks
    reviews?: any[];           // JSON array
  },
) {
  await ensurePrefix();
  const body: any = {};
  if (payload.rating !== undefined && payload.rating !== null) body.ratingAvg = payload.rating;
  if (payload.feedback !== undefined && payload.feedback !== null) body.remarks = payload.feedback;
  if (payload.reviews !== undefined) body.reviews = payload.reviews;

  const res = await api.put(`/drivers/${driverId}/feedback`, body);
  return res.data;
}

// ---------- ASSIGN VEHICLE ----------
export async function assignDriverToVehicle(driverId: number, vehicleId: number | null) {
  await ensurePrefix();
  // pass null to unassign
  const res = await api.put(`/drivers/${driverId}/assign-vehicle`, { vehicleId });
  return res.data;
}

// ---------- DELETE ----------
export async function deleteDriver(driverId: number | string) {
  await ensurePrefix();
  const res = await api.delete(`/drivers/${driverId}`);
  return res.data;
}

// ---------- FETCH FULL (edit/preview) ----------
export async function getDriverFull(driverId: number) {
  await ensurePrefix();
  const res = await api.get(`/drivers/${driverId}/full`);
  return res.data; // { ..., costDetails, documents, feedbackMeta }
}

// ---------- Back-compat helper ----------
export async function getDrivers(
  arg?: number | { page?: number; pageSize?: number; q?: string; vendorId?: number; available?: boolean },
) {
  if (typeof arg === 'number') return getDriverFull(arg);
  return listDrivers(arg as any);
}

// ----- Legacy aliases for backward compatibility -----
export const createDriver = createDriverBasic;
export const updateDriver = updateDriverBasic;
export const getDriver   = getDriverFull;

// Older code using "*Multipart" names
export const createDriverMultipart = createDriverBasic;
export const updateDriverMultipart = updateDriverBasic;

// Optional alias for assignment
export const assignDriver = assignDriverToVehicle;