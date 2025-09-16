// src/components/vendor-tabs/basic-info/BasicInfoForm.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { createVendor, getVendor, updateVendor } from '../services/vendorService';

// =========================
// Asset base + URL normalizer
// =========================
const ASSETS_BASE =
  (import.meta.env.VITE_ASSETS_BASE_URL as string | undefined) ||
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  '';

const DEFAULT_VENDOR_UPLOAD_PREFIX =
  ((import.meta.env as any).VITE_VENDOR_IMAGE_PATH as string | undefined) ||
  '/uploads/vendors/';

function normalizeLogoUrl(raw?: string | null): string {
  if (!raw) return '';
  const s = String(raw).trim();
  // already absolute or data/blob
  if (/^(https?:)?\/\//i.test(s) || /^data:|^blob:/i.test(s)) return s;
  // root-relative like /uploads/...
  if (s.startsWith('/')) return (ASSETS_BASE || '').replace(/\/+$/, '') + s;
  // filename or key → prefix with uploads path
  const prefix = DEFAULT_VENDOR_UPLOAD_PREFIX.startsWith('/')
    ? DEFAULT_VENDOR_UPLOAD_PREFIX
    : `/${DEFAULT_VENDOR_UPLOAD_PREFIX}`;
  return (ASSETS_BASE || '').replace(/\/+$/, '') + prefix + s;
}

// =========================
// Auth + upload helper (keeps current UX; only used when a new logo is picked)
// =========================
function getAuthToken(): string | null {
  try {
    const raw = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token');
    return raw || null;
  } catch {
    return null;
  }
}
function asBearer(token: string | null): string | undefined {
  if (!token) return undefined;
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
}
async function uploadVendorLogo(file: File): Promise<string> {
  // Adjust the endpoint if your API differs (e.g. /files or /upload?folder=vendors)
  const BASE =
    (import.meta.env.VITE_API_BASE_URL_LOCAL as string | undefined) ||
    (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
    '';
  const url = `${String(BASE).replace(/\/+$/, '')}/uploads/vendors`;

  const fd = new FormData();
  fd.set('file', file);

  const token = asBearer(getAuthToken());
  const res = await fetch(url, {
    method: 'POST',
    headers: token ? { Authorization: token } : undefined,
    body: fd,
  });
  if (!res.ok) {
    // If upload API not available, fallback to prefix + filename (still yields a usable path)
    const fallbackPrefix = DEFAULT_VENDOR_UPLOAD_PREFIX.startsWith('/')
      ? DEFAULT_VENDOR_UPLOAD_PREFIX
      : `/${DEFAULT_VENDOR_UPLOAD_PREFIX}`;
    return `${fallbackPrefix}${file.name}`;
  }
  const data: any = await res.json().catch(() => ({}));
  // Try common response shapes
  const path =
    data?.path ||
    data?.url ||
    data?.Location ||
    data?.filepath ||
    data?.key ||
    data?.data?.path ||
    data?.data?.url;
  if (typeof path === 'string' && path.trim()) return path;
  const fallbackPrefix = DEFAULT_VENDOR_UPLOAD_PREFIX.startsWith('/')
    ? DEFAULT_VENDOR_UPLOAD_PREFIX
    : `/${DEFAULT_VENDOR_UPLOAD_PREFIX}`;
  return `${fallbackPrefix}${file.name}`;
}

// =========================
/** GST type mappers (API <-> UI) */
// =========================
function mapGstTypeFromApi(val?: string | null): 'Included' | 'Excluded' {
  const up = String(val ?? '').toUpperCase();
  if (up === 'EXCLUDED') return 'Excluded';
  return 'Included';
}
function mapGstTypeToApi(val?: string | null): 'INCLUDED' | 'EXCLUDED' | undefined {
  if (!val) return undefined;
  const up = String(val).toUpperCase();
  if (up.startsWith('EXCL')) return 'EXCLUDED';
  if (up.startsWith('INCL')) return 'INCLUDED';
  return undefined;
}

// =========================
// DTO builder (keeps functionality; fixes types & unique key)
// =========================
function toVendorDto(form: any) {
  // Extract first number (e.g. "5" from "5 % GST - %5")
  const gstPct = (() => {
    const s = String(form.vendorMarginGstPercentage ?? '');
    const m = s.match(/\b(\d{1,2})\b/);
    return m ? Number(m[1]) : undefined;
  })();

  const vendorMarginPercent =
    form.vendorMargin === '' || form.vendorMargin == null
      ? undefined
      : Number(form.vendorMargin);

  // Prefer new file name (server may replace with UUID path); else keep the RAW value from API; else omit
  const dtoLogo =
    form.logoFile
      ? { logoUrl: form.logoFile.name }
      : form.logoUrlRaw
      ? { logoUrl: form.logoUrlRaw }
      : {};

  // Backend unique field often mapped from GSTIN
  const companyReg = form.invoiceGstin?.trim() || undefined;

  const dto: any = {
    name: form.vendorName,
    email: form.email || undefined,
    primaryMobile: form.primaryMobile || undefined,
    altMobile: form.altMobile || undefined,
    otherNumber: form.otherNumber || undefined,
    country: form.country || 'India',
    state: form.state || undefined,
    city: form.city || undefined,
    pincode: form.pincode || undefined,
    address: form.address || undefined,

    ...dtoLogo,

    // invoice
    invoiceCompanyName: form.invoiceCompanyName || undefined,
    invoiceAddress: form.invoiceAddress || undefined,
    invoicePincode: form.invoicePincode || undefined,
    invoiceGstin: form.invoiceGstin || undefined,
    invoicePan: form.invoicePan || undefined,
    invoiceContactNo: form.invoiceContactNo || undefined,
    invoiceEmail: form.invoiceEmail || undefined,

    // margin
    vendorMarginPercent,
    vendorMarginGstType: mapGstTypeToApi(form.vendorMarginGstType),
    vendorMarginGstPct: gstPct,

    // unique key on backend (avoids Prisma P2002 collisions on empty defaults)
    companyReg,
  };

  // Include credentials if present (common requirement on create)
  if (form.username) dto.username = String(form.username).trim();
  if (form.password) dto.password = String(form.password);

  return dto;
}

/** API used by this component (same names as before) */
async function apiCreateVendor(payload: any): Promise<{ id: string }> {
  const dto = toVendorDto(payload);
  const res = await createVendor(dto);
  return { id: String(res.id) };
}
async function apiGetVendor(id: string): Promise<any> {
  const v = await getVendor(id);
  return {
    id: String(v.id),
    vendorName: v.name ?? '',
    email: v.email ?? '',
    primaryMobile: v.primaryMobile ?? '',
    altMobile: v.altMobile ?? '',
    otherNumber: v.otherNumber ?? '',
    state: v.state ?? '',
    city: v.city ?? '',
    country: v.country ?? 'India',
    pincode: v.pincode ?? '',
    role: 'Vendor',
    vendorMargin: v.vendorMarginPercent != null ? String(v.vendorMarginPercent) : '',
    vendorMarginGstType: mapGstTypeFromApi(v.vendorMarginGstType),
    vendorMarginGstPercentage:
      v.vendorMarginGstPct != null ? `${v.vendorMarginGstPct} % GST - %${v.vendorMarginGstPct}` : '5 % GST - %5',
    address: v.address ?? '',

    // Invoice
    invoiceCompanyName: v.invoiceCompanyName ?? '',
    invoiceAddress: v.invoiceAddress ?? '',
    invoicePincode: v.invoicePincode ?? '',
    invoiceGstin: v.invoiceGstin ?? '',
    invoicePan: v.invoicePan ?? '',
    invoiceContactNo: v.invoiceContactNo ?? '',
    invoiceEmail: v.invoiceEmail ?? '',

    // Logo (keep both raw and normalized)
    logoUrlRaw: v.logoUrl ?? '',
    logoUrl: normalizeLogoUrl(v.logoUrl),
  };
}
async function apiUpdateVendor(id: string, payload: any): Promise<void> {
  const dto = toVendorDto(payload);
  await updateVendor(id, dto);
}

export default function BasicInfoForm({
  mode,
  vendorId,
  onSaved,
}: {
  mode: 'add' | 'edit';
  vendorId?: string;
  onSaved: (createdOrExistingId: string) => void;
}) {
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    /** Basic details */
    vendorName: '',
    email: '',
    primaryMobile: '',
    altMobile: '',
    otherNumber: '',
    username: '',
    password: '',
    country: 'India',
    state: '',
    city: '',
    pincode: '',
    role: 'Vendor',
    vendorMargin: '',
    vendorMarginGstType: 'Included',
    vendorMarginGstPercentage: '5 % GST - %5',
    address: '',
    /** Invoice details */
    invoiceCompanyName: '',
    invoiceAddress: '',
    invoicePincode: '',
    invoiceGstin: '',
    invoicePan: '',
    invoiceContactNo: '',
    invoiceEmail: '',
    /** File */
    logoUrl: '',          // normalized (for preview only)
    logoUrlRaw: '',       // raw from API (filename or saved path) for saving
    logoFile: null as File | null,
  });

  // Prefill whenever we have a vendorId — works in add→back as well
  useEffect(() => {
    if (!vendorId) return;
    let cancelled = false;
    (async () => {
      const v = await apiGetVendor(vendorId);
      if (cancelled) return;
      setForm((f) => ({
        ...f,
        vendorName: v.vendorName ?? '',
        email: v.email ?? '',
        primaryMobile: v.primaryMobile ?? '',
        altMobile: v.altMobile ?? '',
        otherNumber: v.otherNumber ?? '',
        country: v.country ?? 'India',
        state: v.state ?? '',
        city: v.city ?? '',
        pincode: v.pincode ?? '',
        role: v.role ?? 'Vendor',
        vendorMargin: v.vendorMargin ?? '',
        vendorMarginGstType: v.vendorMarginGstType ?? 'Included',
        vendorMarginGstPercentage: v.vendorMarginGstPercentage ?? '5 % GST - %5',
        address: v.address ?? '',
        invoiceCompanyName: v.invoiceCompanyName ?? '',
        invoiceAddress: v.invoiceAddress ?? '',
        invoicePincode: v.invoicePincode ?? '',
        invoiceGstin: v.invoiceGstin ?? '',
        invoicePan: v.invoicePan ?? '',
        invoiceContactNo: v.invoiceContactNo ?? '',
        invoiceEmail: v.invoiceEmail ?? '',
        logoUrl: v.logoUrl,          // normalized preview
        logoUrlRaw: v.logoUrlRaw,    // raw for saving
        logoFile: null,
      }));
    })();
    return () => { cancelled = true; };
  }, [vendorId]);

  const set = (k: keyof typeof form, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // If a new file is picked, upload it first to get a persisted path like /uploads/vendors/<uuid>.<ext>
      let logoUrlRaw = form.logoUrlRaw;
      if (form.logoFile) {
        try {
          logoUrlRaw = await uploadVendorLogo(form.logoFile);
        } catch {
          // keep current behavior even if upload API unavailable; fall back to filename-based path
          const prefix = DEFAULT_VENDOR_UPLOAD_PREFIX.startsWith('/')
            ? DEFAULT_VENDOR_UPLOAD_PREFIX
            : `/${DEFAULT_VENDOR_UPLOAD_PREFIX}`;
          logoUrlRaw = `${prefix}${form.logoFile.name}`;
        }
      }

      const formForSave = { ...form, logoUrlRaw };

      if (mode === 'add') {
        try {
          const res = await apiCreateVendor(formForSave);
          onSaved(res.id);
        } catch (err: any) {
          const msg = String(err?.message || '');
          if (msg.includes('vendors_companyReg_key')) {
            alert(
              `A vendor with this Company Registration (likely GSTIN) already exists.\n\n` +
              `Value: ${formForSave.invoiceGstin || '(none)'}\n\n` +
              `Try a different GSTIN, or switch to Edit for that vendor.`
            );
          }
          console.error('CreateVendor failed. DTO =', toVendorDto(formForSave), err);
          throw err;
        }
      } else if (vendorId) {
        try {
          await apiUpdateVendor(vendorId, formForSave);
          onSaved(vendorId);
        } catch (err: any) {
          console.error('UpdateVendor failed. DTO =', toVendorDto(formForSave), err);
          throw err;
        }
      }
    } catch (err) {
      console.error('Failed to save vendor', err);
      alert('Failed to save vendor. Check console/network for details.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="space-y-8" onSubmit={submit}>
      {/* ===================== Basic Details ===================== */}
      <section>
        <h3 className="text-sm font-semibold mb-3">Basic Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            className="border rounded px-3 py-2"
            placeholder="Vendor Name"
            value={form.vendorName}
            onChange={(e) => set('vendorName', e.target.value)}
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="Email ID"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
          />

          <input
            className="border rounded px-3 py-2"
            placeholder="Primary Mobile Number"
            value={form.primaryMobile}
            onChange={(e) => set('primaryMobile', e.target.value)}
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="Alternative Mobile Number"
            value={form.altMobile}
            onChange={(e) => set('altMobile', e.target.value)}
          />

          {/* Only in ADD mode */}
          {mode === 'add' && (
            <>
              <input
                className="border rounded px-3 py-2"
                placeholder="Username"
                value={form.username}
                onChange={(e) => set('username', e.target.value)}
              />
              <input
                className="border rounded px-3 py-2"
                placeholder="Password"
                type="password"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
              />
            </>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
            <select
              className="border rounded px-3 py-2"
              value={form.country}
              onChange={(e) => set('country', e.target.value)}
            >
              <option value="India">India</option>
            </select>
            <select
              className="border rounded px-3 py-2"
              value={form.state}
              onChange={(e) => set('state', e.target.value)}
            >
              <option value="">Choose State</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Kerala">Kerala</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Maharashtra">Maharashtra</option>
            </select>
          </div>

          <select
            className="border rounded px-3 py-2"
            value={form.city}
            onChange={(e) => set('city', e.target.value)}
          >
            <option value="">Choose City</option>
            <option value="Rameswaram">Rameswaram</option>
            <option value="Chennai">Chennai</option>
            <option value="Madurai">Madurai</option>
          </select>
          <input
            className="border rounded px-3 py-2"
            placeholder="Pincode"
            value={form.pincode}
            onChange={(e) => set('pincode', e.target.value)}
          />

          <input
            className="border rounded px-3 py-2"
            placeholder="Other Number"
            value={form.otherNumber}
            onChange={(e) => set('otherNumber', e.target.value)}
          />
          <select
            className="border rounded px-3 py-2"
            value={form.role}
            onChange={(e) => set('role', e.target.value)}
          >
            <option value="Vendor">Vendor</option>
            <option value="Admin">Admin</option>
          </select>

          <input
            className="border rounded px-3 py-2"
            placeholder="Vendor Margin %"
            value={form.vendorMargin}
            onChange={(e) => set('vendorMargin', e.target.value)}
          />
          <select
            className="border rounded px-3 py-2"
            value={form.vendorMarginGstType}
            onChange={(e) => set('vendorMarginGstType', e.target.value)}
          >
            <option value="Included">Included</option>
            <option value="Excluded">Excluded</option>
          </select>

          <select
            className="border rounded px-3 py-2"
            value={form.vendorMarginGstPercentage}
            onChange={(e) => set('vendorMarginGstPercentage', e.target.value)}
          >
            <option value="5 % GST - %5">5 % GST - %5</option>
            <option value="12 % GST - %12">12 % GST - %12</option>
            <option value="18 % GST - %18">18 % GST - %18</option>
          </select>

          <input
            className="md:col-span-2 border rounded px-3 py-2"
            placeholder="Address"
            value={form.address}
            onChange={(e) => set('address', e.target.value)}
          />
        </div>
      </section>

      {/* ===================== Invoice Details ===================== */}
      <section>
        <h3 className="text-sm font-semibold mb-3">Invoice Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            className="border rounded px-3 py-2"
            placeholder="Company Name"
            value={form.invoiceCompanyName}
            onChange={(e) => set('invoiceCompanyName', e.target.value)}
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="Address"
            value={form.invoiceAddress}
            onChange={(e) => set('invoiceAddress', e.target.value)}
          />

          <input
            className="border rounded px-3 py-2"
            placeholder="GSTIN Number"
            value={form.invoiceGstin}
            onChange={(e) => set('invoiceGstin', e.target.value)}
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="PAN Number"
            value={form.invoicePan}
            onChange={(e) => set('invoicePan', e.target.value)}
          />

          <div className="text-xs text-muted-foreground">
            GSTIN Format: 10AABCU9603R1Z5
          </div>
          <div className="text-xs text-muted-foreground">
            Pan Format: CNFPC5441D
          </div>

          <input
            className="border rounded px-3 py-2"
            placeholder="Email ID"
            value={form.invoiceEmail}
            onChange={(e) => set('invoiceEmail', e.target.value)}
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="Pincode"
            value={form.invoicePincode}
            onChange={(e) => set('invoicePincode', e.target.value)}
          />

          <input
            className="border rounded px-3 py-2"
            placeholder="Contact No."
            value={form.invoiceContactNo}
            onChange={(e) => set('invoiceContactNo', e.target.value)}
          />

          {/* Logo upload */}
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Logo</label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                set('logoFile', f);
                if (f) set('logoUrl', ''); // keep logoUrlRaw untouched for saving
              }}
              className="block w-full text-sm file:mr-3 file:py-2 file:px-3 file:rounded file:border-0 file:bg-muted file:text-foreground"
            />

            {(form.logoFile || form.logoUrl) && (
              <div className="mt-3 flex items-center gap-3">
                <img
                  src={form.logoFile ? URL.createObjectURL(form.logoFile) : normalizeLogoUrl(form.logoUrl)}
                  alt="Vendor logo"
                  className="h-16 w-auto rounded border bg-white object-contain"
                  onLoad={(e) => {
                    if (form.logoFile) {
                      const url = (e.currentTarget as HTMLImageElement).src;
                      setTimeout(() => URL.revokeObjectURL(url), 0);
                    }
                  }}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
                <button
                  type="button"
                  className="text-xs text-red-600 underline"
                  onClick={() => {
                    set('logoFile', null);
                    set('logoUrl', '');
                    set('logoUrlRaw', '');
                  }}
                  title="Remove logo"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <button
        type="submit"
        className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded"
        disabled={saving}
      >
        {mode === 'add'
          ? saving
            ? 'Saving…'
            : 'Save & Continue'
          : saving
          ? 'Updating…'
          : 'Update & Continue'}
      </button>
    </form>
  );
}
