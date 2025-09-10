export type VehicleTypeRow = { id: number; name: string };

// Keep your old seed map as a fallback (optional)
export const VEHICLE_TYPE_ID_MAP: Record<string, number> = {
  sedan: 1,
  innova: 2,
  'muv_6p1': 3,
  'innova_crysta_6p1': 4,
  'tempo_12': 5,
};

const BASE = (() => {
  const local = import.meta.env.VITE_API_BASE_URL_LOCAL as string | undefined; // e.g. http://localhost:4001
  const prod  = import.meta.env.VITE_API_BASE_URL as string | undefined;       // fallback if not local
  const isLocalhost =
    typeof window !== 'undefined' &&
    /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);

  const raw = isLocalhost ? (local || prod) : (prod || local);
  return (raw || '').replace(/\/+$/, '');
})();

function getAuthToken(): string | null {
  // mirror DriverForm
  return (
    localStorage.getItem('token') ||
    localStorage.getItem('accessToken') ||
    localStorage.getItem('authToken') ||
    null
  );
}
function authHeaders() {
  const token = getAuthToken();
  const bearer =
    token && token.startsWith('Bearer ') ? token : token ? `Bearer ${token}` : null;
  return {
    'Content-Type': 'application/json',
    ...(bearer ? { Authorization: bearer } : {}),
  };
}

async function http<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText} - ${text}`);
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}
const toNum = (v: string | number | undefined | null) =>
  v == null || v === '' ? 0 : Number(String(v).replace(/[^\d.]/g, ''));

// ---------------- VehicleType dynamic map ------------------------------------
/** internal map (by exact name & normalized name) */
const NAME_TO_ID: Record<string, number> = { ...VEHICLE_TYPE_ID_MAP };

function norm(s: string) {
  return String(s)
    .trim()
    .replace(/\s+/g, '_')
    .replace(/\+/g, 'p')
    .replace(/[()]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '');
}

/** GET from backend for dropdowns */
export async function fetchVehicleTypes(): Promise<VehicleTypeRow[]> {
  try {
    return await http<VehicleTypeRow[]>(`${BASE}/vendors/vehicle-types`, {
      method: 'GET',
      headers: authHeaders(),
    });
  } catch (e: any) {
    // If route is shadowed or you exposed it top-level:
    return await http<VehicleTypeRow[]>(`${BASE}/vehicle-types`, {
      method: 'GET',
      headers: authHeaders(),
    });
  }
}

/** Call once (per tab/page) before using vtId(). */
export async function initVehicleTypeMap(force = false): Promise<void> {
  if (!force && (initVehicleTypeMap as any).__done) return;
  const rows = await fetchVehicleTypes();
  rows.forEach((vt) => {
    NAME_TO_ID[vt.name] = vt.id;          // exact label
    NAME_TO_ID[norm(vt.name)] = vt.id;    // normalized
  });
  (initVehicleTypeMap as any).__done = true;
}

/** Resolve id from label or id */
export function vtId(slug: string | number): number {
  if (typeof slug === 'number') return slug;
  const direct = NAME_TO_ID[slug];
  const byNorm = NAME_TO_ID[norm(slug)];
  const hit = direct ?? byNorm;
  if (!hit) {
    throw new Error(
      `Missing vehicle type mapping for "${slug}".\n` +
      `Ensure GET /vendors/vehicle-types returns it, and call initVehicleTypeMap() on mount.`
    );
  }
  return hit;
}

// ---------------- Driver Costs ----------------
export type DriverCostDTO = {
  id?: number;
  vehicleTypeId: number;
  vehicleTypeName?: string;
  driverBhatta?: number;
  foodCost?: number;
  accomodationCost?: number;
  extraCost?: number;
  morningPerHour?: number;
  eveningPerHour?: number;
};

export async function fetchDriverCostsByVendor(vendorId: number | string): Promise<DriverCostDTO[]> {
  return http<DriverCostDTO[]>(`${BASE}/vendors/${vendorId}/driver-costs`, {
    method: 'GET',
    headers: authHeaders(),
  });
}

export async function upsertDriverCosts(vendorId: number | string, rows: DriverCostDTO[]): Promise<any> {
  return http(`${BASE}/vendors/${vendorId}/driver-costs`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ rows }),
  });
}

// ---------------- Extra Costs ----------------
export type ExtraCostDTO = {
  vehicleTypeId: number;
  extraKm: number;
  extraHour: number;
  earlyMorning: number;
  evening: number;
};

export async function upsertExtraCosts(vendorId: number | string, rows: ExtraCostDTO[]) {
  return http(`${BASE}/vendors/${vendorId}/extra-costs`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ rows }),
  });
}

// ---------------- Local Pricebook ----------------
export type LocalLimitDTO = { vehicleTypeId: number; title: string; hours: number; km: number };
export type LocalChargeDTO = { vehicleTypeId: number; startDate?: string; endDate?: string; amount: number };

export async function replaceLocalLimits(vendorId: number | string, rows: LocalLimitDTO[]) {
  return http(`${BASE}/vendors/${vendorId}/local-limits`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ rows }),
  });
}
export async function upsertLocalCharges(vendorId: number | string, rows: LocalChargeDTO[]) {
  return http(`${BASE}/vendors/${vendorId}/local-charges`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ rows }),
  });
}
export async function listLocal(vendorId: number | string): Promise<{ limits: LocalLimitDTO[]; charges: LocalChargeDTO[] }> {
  return http(`${BASE}/vendors/${vendorId}/local`, { method: 'GET', headers: authHeaders() });
}

// ---------------- Outstation Pricebook ----------------
export type OutstationLimitDTO = { vehicleTypeId: number; title: string; km: number };
export type OutstationChargeDTO = { vehicleTypeId: number; startDate?: string; endDate?: string; amount: number };

export async function replaceOutstationLimits(vendorId: number | string, rows: OutstationLimitDTO[]) {
  return http(`${BASE}/vendors/${vendorId}/outstation-limits`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ rows }),
  });
}
export async function upsertOutstationCharges(vendorId: number | string, rows: OutstationChargeDTO[]) {
  return http(`${BASE}/vendors/${vendorId}/outstation-charges`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ rows }),
  });
}
export async function listOutstation(vendorId: number | string): Promise<{ limits: OutstationLimitDTO[]; charges: OutstationChargeDTO[] }> {
  return http(`${BASE}/vendors/${vendorId}/outstation`, { method: 'GET', headers: authHeaders() });
}

// ---------------- Permit Costs ----------------
export type PermitRowDTO = { vehicleTypeId: number; sourceState: string; costs: Record<string, number> };

export async function upsertPermitCosts(vendorId: number | string, rows: PermitRowDTO[]) {
  return http(`${BASE}/vendors/${vendorId}/permit-costs`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ rows }),
  });
}
export async function listPermitCosts(vendorId: number | string) {
  return http(`${BASE}/vendors/${vendorId}/permit-costs`, {
    method: 'GET',
    headers: authHeaders(),
  });
}

// ---------------- Helpers ----------------
export function toAmount(v: string | number | null | undefined): number {
  return toNum(v);
}