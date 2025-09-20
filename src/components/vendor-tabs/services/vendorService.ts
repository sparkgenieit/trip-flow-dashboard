// src/services/vendorService.ts
// === REPLACE ENTIRE FILE ======================================================
export type VendorDto = {
  name: string;
  email?: string;
  primaryMobile?: string;
  altMobile?: string;
  otherNumber?: string;
  country?: string;
  state?: string;
  city?: string;
  pincode?: string;
  address?: string;
  logoUrl?: string;

  // invoice
  invoiceCompanyName?: string;
  invoiceAddress?: string;
  invoicePincode?: string;
  invoiceGstin?: string;
  invoicePan?: string;
  invoiceContactNo?: string;
  invoiceEmail?: string;

  // margin
  vendorMarginPercent?: number | string;
  vendorMarginGstType?: 'Included' | 'Excluded';
  vendorMarginGstPct?: number | string;
};

export type Vendor = VendorDto & { id: number };

export type BranchDto = {
  id?: number;
  name: string;
  location?: string;
  email?: string;
  primaryMobile?: string;
  altMobile?: string;
  country?: string;
  state?: string;
  city?: string;
  pincode?: string;
  gstType?: 'Included' | 'Excluded' | string;
  gstPercent?: number | string | null;
  address?: string;
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
function authHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

// ------ Vendor (Tab 1) ------
export async function createVendor(payload: VendorDto): Promise<{ id: number }> {
  return http<{ id: number }>(`${BASE}/vendors`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}

export async function updateVendor(id: number | string, payload: VendorDto): Promise<Vendor> {
  return http<Vendor>(`${BASE}/vendors/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}

export async function getVendor(id: number | string): Promise<Vendor> {
  return http<Vendor>(`${BASE}/vendors/${id}`, {
    method: 'GET',
    headers: authHeaders(),
  });
}

// Optionally update only margin via dedicated endpoint
export async function updateVendorMargin(
  id: number | string,
  data: { vendorMarginPercent?: number | string; vendorMarginGstType?: 'Included' | 'Excluded'; vendorMarginGstPct?: number | string }
) {
  return http(`${BASE}/vendors/${id}/margin`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
}

// ------ Branches (Tab 2) ------
export async function fetchBranches(vendorId: number | string): Promise<BranchDto[]> {
  return http<BranchDto[]>(`${BASE}/vendors/${vendorId}/branches`, {
    method: 'GET',
    headers: authHeaders(),
  });
}

export async function upsertBranches(vendorId: number | string, branches: BranchDto[]): Promise<BranchDto[]> {
  return http<BranchDto[]>(`${BASE}/vendors/${vendorId}/branches`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ branches }),
  });
}
