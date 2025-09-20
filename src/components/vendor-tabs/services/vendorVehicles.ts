export type Role = 'ADMIN' | 'VENDOR' | 'DRIVER' | string;

export type LegacyAdditionalImagesJSON =
  | {
      exterior?: string[];
      interior?: string[];
      videos?: string[];
      documents?: { type: string; url: string }[];
      others?: string[];
    }
  | string[];

export type VehiclePayload = {
  // Prisma scalar fields
  registrationNumber: string;
  chassisNumber?: string | null;
  status?: string; // default 'available'
  createdBy?: Role; // default 'VENDOR'
  vehicleTypeId: number;

  // Dates & maintenance (yyyy-mm-dd)
  lastServicedDate?: string | null;
  vehicleExpiryDate?: string | null;

  // Charges
  extraKmCharge?: number | string | null;
  earlyMorningCharges?: number | string | null;
  eveningCharges?: number | string | null;

  // Media
  videoUrl?: string | null;

  // Insurance
  insurancePolicyNumber?: string | null;
  insuranceStartDate?: string | null;
  insuranceEndDate?: string | null;
  insuranceContactNumber?: string | null;
  rtoCode?: string | null;

  // Primary image (path or URL)
  image?: string | null;

  // Additional images JSON
  additional_images?: string[] | null; // ⬅️ changed to string[]
};

type Json = Record<string, any>;

const BASE = (() => {
  const local = import.meta.env.VITE_API_BASE_URL_LOCAL as string | undefined;
  const prod = import.meta.env.VITE_API_BASE_URL as string | undefined;
  const isLocalhost =
    typeof window !== 'undefined' &&
    /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);
  const raw = isLocalhost ? (local || prod) : (prod || local);
  return (raw || '').replace(/\/+$/, '');
})();

function getAuthToken(): string | null {
  return (
    localStorage.getItem('token') ||
    localStorage.getItem('accessToken') ||
    localStorage.getItem('authToken') ||
    null
  );
}

function authHeadersJSON(): HeadersInit {
  const token = getAuthToken();
  const bearer =
    token && token.startsWith('Bearer ') ? token : token ? `Bearer ${token}` : null;
  return {
    'Content-Type': 'application/json',
    ...(bearer ? { Authorization: bearer } : {}),
  };
}

// prune undefined to keep payload clean
function prune<T extends Json>(obj: T): T {
  const out: Json = {};
  Object.entries(obj).forEach(([k, v]) => {
    if (v === undefined) return;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      const nested = prune(v as Json);
      if (Object.keys(nested).length) out[k] = nested;
      return;
    }
    out[k] = v;
  });
  return out as T;
}

const toNum = (v: any): number | undefined => {
  if (v === null || v === undefined || v === '') return undefined;
  const n = Number(String(v).replace(/[^\d.-]/g, ''));
  return Number.isFinite(n) ? n : undefined;
};

export async function createVendorVehicle(
  vendorId: number | string,
  payload: VehiclePayload
): Promise<{ id: number }> {
  const body = prune({
    ...payload,
    status: payload.status ?? 'available',
    createdBy: payload.createdBy ?? 'VENDOR',
    vehicleTypeId: toNum(payload.vehicleTypeId) ?? payload.vehicleTypeId,
    extraKmCharge: toNum(payload.extraKmCharge),
    earlyMorningCharges: toNum(payload.earlyMorningCharges),
    eveningCharges: toNum(payload.eveningCharges),
  });

  const res = await fetch(`${BASE}/vendors/${vendorId}/vehicles`, {
    method: 'POST',
    headers: authHeadersJSON(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText} - ${text}`);
  }
  return res.json() as Promise<{ id: number }>;
}

export async function updateVendorVehicle(
  vendorId: number | string,
  vehicleId: number | string,
  payload: VehiclePayload
): Promise<{ ok: boolean } | { id: number }> {
  const body = prune({
    ...payload,
    status: payload.status ?? 'available',
    createdBy: payload.createdBy ?? 'VENDOR',
    vehicleTypeId: toNum(payload.vehicleTypeId) ?? payload.vehicleTypeId,
    extraKmCharge: toNum(payload.extraKmCharge),
    earlyMorningCharges: toNum(payload.earlyMorningCharges),
    eveningCharges: toNum(payload.eveningCharges),
  });

  const res = await fetch(`${BASE}/vendors/${vendorId}/vehicles/${vehicleId}`, {
    method: 'PATCH',
    headers: authHeadersJSON(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText} - ${text}`);
  }
    return res.json() as Promise<{ ok: boolean } | { id: number }>;
}

export type VehicleRow = {
  id: number;
  registrationNumber: string;
  chassisNumber?: string | null;
  vehicleTypeId: number;
  vehicleExpiryDate?: string | null;
  lastServicedDate?: string | null;
  status?: string | null;          // may be undefined if not selected in backend
  videoUrl?: string | null;
  image?: string | null;
  additional_images?: any;         // backend stores string[] (or legacy JSON on older rows)
};

export type BranchRow = {
  id: number;
  name: string;
  location?: string | null;
  email?: string | null;
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /vendors/:vendorId/vehicles
// ─────────────────────────────────────────────────────────────────────────────
export async function listVendorVehicles(
  vendorId: number | string
): Promise<VehicleRow[]> {
  const res = await fetch(`${BASE}/vendors/${vendorId}/vehicles`, {
    method: 'GET',
    headers: authHeadersJSON(),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText} - ${text}`);
  }
  return res.json() as Promise<VehicleRow[]>;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /vendors/:vendorId/branches
// (If your controller exposes a different route, tweak the URL here.)
// ─────────────────────────────────────────────────────────────────────────────
export async function listVendorBranches(
  vendorId: number | string
): Promise<BranchRow[]> {
  const res = await fetch(`${BASE}/vendors/${vendorId}/branches`, {
    method: 'GET',
    headers: authHeadersJSON(),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText} - ${text}`);
  }
  return res.json() as Promise<BranchRow[]>;
}