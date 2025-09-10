// src/components/vendor-tabs/basic-info/BasicInfoForm.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { createVendor, getVendor, updateVendor } from '../services/vendorService';

function toVendorDto(form: any) {
  const gstPctStr = String(form.vendorMarginGstPercentage ?? '').replace(/[^\d]/g, '');
  return {
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

    // logo: you likely upload separately; we keep the filename or URL if you already have it
    logoUrl: form.logoFile ? form.logoFile.name : undefined,

    // invoice
    invoiceCompanyName: form.invoiceCompanyName || undefined,
    invoiceAddress: form.invoiceAddress || undefined,
    invoicePincode: form.invoicePincode || undefined,
    invoiceGstin: form.invoiceGstin || undefined,
    invoicePan: form.invoicePan || undefined,
    invoiceContactNo: form.invoiceContactNo || undefined,
    invoiceEmail: form.invoiceEmail || undefined,

    // margin
    vendorMarginPercent: form.vendorMargin || undefined,
    vendorMarginGstType: form.vendorMarginGstType || undefined,
    vendorMarginGstPct: gstPctStr || undefined,
  };
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
    vendorMarginGstType: (v.vendorMarginGstType as any) ?? 'Included',
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

    logoUrl: v.logoUrl ?? '',
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
    logoFile: null as File | null,
  });

  // Pre-fill in edit mode
  useEffect(() => {
    if (mode === 'edit' && vendorId) {
      apiGetVendor(vendorId).then((v) =>
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
          logoFile: null,
        }))
      );
    }
  }, [mode, vendorId]);

  const set = (k: keyof typeof form, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Build payload (attach file if present)
      const payload: any = { ...form };
      if (form.logoFile) {
        // Example: convert to FormData if your API expects multipart
        // const fd = new FormData();
        // Object.entries(payload).forEach(([k, v]) => fd.append(k, String(v ?? '')));
        // fd.set('logo', form.logoFile);
        // await apiCreateVendor(fd as any);
      }

      if (mode === 'add') {
        const res = await apiCreateVendor(payload);
        onSaved(res.id);
      } else if (vendorId) {
        await apiUpdateVendor(vendorId, payload);
        onSaved(vendorId);
      }
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
              onChange={(e) => set('logoFile', e.target.files?.[0] ?? null)}
              className="block w-full text-sm file:mr-3 file:py-2 file:px-3 file:rounded file:border-0 file:bg-muted file:text-foreground"
            />
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
