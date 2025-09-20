export type VehicleTypeRow = { id: number; name: string };

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
  if (typeof window === 'undefined') return null; // SSR/Node guard
  try {
    return (
      localStorage.getItem('token') ||
      localStorage.getItem('accessToken') ||
      localStorage.getItem('authToken') ||
      null
    );
  } catch {
    return null;
  }
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
const NAME_TO_ID: Record<string, number> = {};
/** reverse map for display */
const ID_TO_NAME: Record<number, string> = {};

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
  // Try /vendors/vehicle-types → /vendors/vehicle-types/all → /vehicle-types
  try {
    return await http<VehicleTypeRow[]>(`${BASE}/vendors/vehicle-types`, {
      method: 'GET',
      headers: authHeaders(),
    });
  } catch {
    try {
      return await http<VehicleTypeRow[]>(`${BASE}/vendors/vehicle-types/all`, {
        method: 'GET',
        headers: authHeaders(),
      });
    } catch {
      return await http<VehicleTypeRow[]>(`${BASE}/vehicle-types`, {
        method: 'GET',
        headers: authHeaders(),
      });
    }
  }
}

/** Call once (per tab/page) before using vtId(). */
export async function initVehicleTypeMap(force = false): Promise<void> {
  if (!force && (initVehicleTypeMap as any).__done) return;
  const rows = await fetchVehicleTypes();
  rows.forEach((vt) => {
    NAME_TO_ID[vt.name] = vt.id;          // exact label
    NAME_TO_ID[norm(vt.name)] = vt.id;    // normalized
    ID_TO_NAME[vt.id] = vt.name;          // reverse lookup
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

export function vtName(id?: number | null): string {
  if (!id) return '';
  return ID_TO_NAME[id] ?? '';
}

type PermitCostDbRow = {
  vendorId: number;
  vehicleTypeId: number;
  sourceState: string; // e.g. "AP"
  destState: string;   // e.g. "TN"
  amount: number;
};

// UI row required by your Permit tab
export type GroupedPermitRow = {
  vehicleTypeId: number;
  vehicleTypeName: string;
  sourceState: string;
  costs: Record<string, number>; // { "AP": 0, "TN": 500, ... }
};

function groupPermitCosts(rows: PermitCostDbRow[]): GroupedPermitRow[] {
  const byKey: Record<string, GroupedPermitRow> = {};
  for (const r of rows) {
    const key = `${r.vehicleTypeId}::${r.sourceState}`;
    if (!byKey[key]) {
      byKey[key] = {
        vehicleTypeId: r.vehicleTypeId,
        vehicleTypeName: vtName(r.vehicleTypeId) || String(r.vehicleTypeId),
        sourceState: r.sourceState,
        costs: {},
      };
    }
    byKey[key].costs[r.destState] = Number(r.amount ?? 0);
  }
  return Object.values(byKey);
}

/** Convenience wrapper used by the Permit tab to prefill its grid */
export async function fetchPermitPrefill(
  vendorId: number | string
): Promise<GroupedPermitRow[]> {
  // ensure type names are ready for vtName()
  await initVehicleTypeMap();

  try {
    // Prefer backend grouping if available
    return await listPermitCostsGrouped(vendorId);
  } catch {
    // Fall back to fetching raw rows and grouping on the client
    const raw = await listPermitCosts(vendorId);
    return groupPermitCosts(raw as unknown as PermitCostDbRow[]);
  }
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

export type VendorExtraCost = {
  id?: number;
  vehicleTypeId: number;
  extraKm?: number | null;
  extraHour?: number | null;
  earlyMorning?: number | null;
  evening?: number | null;
};

export async function listExtraCosts(
  vendorId: number | string
): Promise<VendorExtraCost[]> {
  return http<VendorExtraCost[]>(
    `${BASE}/vendors/${vendorId}/extra-costs`,
    { method: 'GET', headers: authHeaders() }
  );
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

export async function listPermitCostsGrouped(
  vendorId: number | string
): Promise<GroupedPermitRow[]> {
  try {
    // If your backend exposes the grouped endpoint, use it
    const grouped = await http<GroupedPermitRow[]>(
      `${BASE}/vendors/${vendorId}/permit-costs/grouped`,
      { method: 'GET', headers: authHeaders() }
    );

    // populate vehicle type names if the backend doesn’t include them
    await initVehicleTypeMap();
    return grouped.map(g => ({
      ...g,
      vehicleTypeName: g.vehicleTypeName || vtName(g.vehicleTypeId) || String(g.vehicleTypeId),
    }));
  } catch {
    // Otherwise, fetch raw rows and group locally
    const raw = await listPermitCosts(vendorId);
    await initVehicleTypeMap();
    return groupPermitCosts(raw as unknown as PermitCostDbRow[]);
  }
}

// ---------------- Helpers ----------------
export function toAmount(v: string | number | null | undefined): number {
  return toNum(v);
}
