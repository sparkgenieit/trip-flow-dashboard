  'use client';

  import React, { useEffect, useMemo, useState } from 'react';
  import { Button } from '@/components/ui/button';
  import { Input } from '@/components/ui/input';
  import { Label } from '@/components/ui/label';
  import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
  } from '@/components/ui/dialog';
  import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
  } from '@/components/ui/select';
  import { useToast } from '@/hooks/use-toast';
  import {
    createVendorVehicle,
    updateVendorVehicle,
    type VehiclePayload,
  } from '../services/vendorVehicles';
  import {
    initVehicleTypeMap,
    fetchVehicleTypes,
    type VehicleTypeRow,
  } from '../services/vendorPricing';

  /* ──────────────────────────────────────────────────────────────────────────
    Local types (kept in-file)
    ────────────────────────────────────────────────────────────────────────── */
  type DocType =
    | 'RC Document'
    | 'FC Document'
    | 'Government ID Proof'
    | 'Driver License Proof'
    | 'Permit Proof'
    | 'Insurance Copy'
    | 'Interior'
    | 'Exterior'
    | 'Videos'
    | 'Others';

  const DOC_TYPES: DocType[] = [
    'RC Document',
    'FC Document',
    'Government ID Proof',
    'Driver License Proof',
    'Permit Proof',
    'Insurance Copy',
    'Interior',
    'Exterior',
    'Videos',
    'Others',
  ];

  // === ADD: default statuses for Status select ===
  const STATUS_OPTIONS_DEFAULT = ['available', 'maintenance', 'in_service', 'inactive'];



  type UploadedDoc = {
    id: string;
    type: DocType;
    file: File;
    previewUrl?: string; // image previews only
  };

  // === INSERT: API base, auth, and FormData builder for uploads ===
  const API_BASE = (() => {
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
  function authHeadersMultipart(): HeadersInit {
    const token = getAuthToken();
    const bearer =
      token && token.startsWith('Bearer ') ? token : token ? `Bearer ${token}` : null;
    return { ...(bearer ? { Authorization: bearer } : {}) }; // do NOT set Content-Type for FormData
  }

  /**
   * Build FormData for vehicle create/update + uploads.
   * Sends: fields as text + image (first image file if any) + gallery[] + galleryTypes[]
   */
 async function submitVehicleMultipart(args: {
  mode: 'add' | 'edit';
  vendorId: string | number;
  vehicleId?: string | number;
  payload: VehiclePayload;
  docs: UploadedDoc[];
}) {
  const { mode, vendorId, vehicleId, payload, docs } = args;

  // Build FormData inline to avoid any ordering/hoisting issues
  const fd = new FormData();

  // primitive fields -> strings
  Object.entries({
    registrationNumber: payload.registrationNumber,
    chassisNumber: payload.chassisNumber ?? '',
    status: payload.status ?? 'available',
    vehicleTypeId: String(payload.vehicleTypeId ?? ''),
    lastServicedDate: payload.lastServicedDate ?? '',
    vehicleExpiryDate: payload.vehicleExpiryDate ?? '',
    extraKmCharge: payload.extraKmCharge ?? '',
    earlyMorningCharges: payload.earlyMorningCharges ?? '',
    eveningCharges: payload.eveningCharges ?? '',
    videoUrl: payload.videoUrl ?? '',
    insurancePolicyNumber: payload.insurancePolicyNumber ?? '',
    insuranceStartDate: payload.insuranceStartDate ?? '',
    insuranceEndDate: payload.insuranceEndDate ?? '',
    insuranceContactNumber: payload.insuranceContactNumber ?? '',
    rtoCode: payload.rtoCode ?? '',
  }).forEach(([k, v]) => fd.append(k, v == null ? '' : String(v)));

  // choose first *image* as "image" (optional), rest go to gallery[]
  const firstImageIdx = docs.findIndex((d) => /^image\//i.test(d.file.type));
  docs.forEach((d, i) => {
    const isFirstImage = i === firstImageIdx && firstImageIdx >= 0;
    if (isFirstImage) {
      fd.append('image', d.file); // backend may use this for Vehicle.image
    } else {
      fd.append('gallery', d.file);                 // multiple files OK
      fd.append('galleryTypes', d.type || 'Others'); // repeated key -> array on backend
    }
  });

  const url =
    mode === 'add'
      ? `${API_BASE}/vendors/${vendorId}/vehicles`
      : `${API_BASE}/vendors/${vendorId}/vehicles/${vehicleId}`;
  const method = mode === 'add' ? 'POST' : 'PATCH';

  const res = await fetch(url, {
    method,
    headers: authHeadersMultipart(), // do NOT set Content-Type for FormData
    body: fd,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText} - ${text}`);
  }
  return res.json();
}


  function isImageFile(f?: File | null) {
    return !!f && /^image\//i.test(f.type);
  }

  function shortName(name: string, max = 28) {
    if (name.length <= max) return name;
    const i = name.lastIndexOf('.');
    const base = i >= 0 ? name.slice(0, i) : name;
    const ext = i >= 0 ? name.slice(i) : '';
    return base.slice(0, max - 5) + '…' + ext;
  }

  function isImagePath(p?: string) {
  return !!p && /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(p);
}

function toPublicUrl(p?: string) {
  if (!p) return '';
  if (/^https?:\/\//i.test(p)) return p; // already absolute
  return `${API_BASE}${p.startsWith('/') ? p : `/${p}`}`;
}

/** Normalize any shape of additional_images (+ include .image) into simple string[] */
function normalizeExistingFromVehicle(vehicle?: any): string[] {
  const out: string[] = [];
  const push = (u?: string | null) => {
    if (u && typeof u === 'string') out.push(u);
  };

  // include main image if present
  push(vehicle?.image);

  // handle additional_images in various shapes
  const j = vehicle?.additional_images;

  // case: string[]
  if (Array.isArray(j)) {
    for (const it of j) {
      if (typeof it === 'string') push(it);
      else if (it && typeof it === 'object' && typeof it.url === 'string') push(it.url);
    }
  } else if (j && typeof j === 'object') {
    // case: { files: [...] } legacy
    if (Array.isArray(j.files)) {
      for (const it of j.files) {
        if (typeof it === 'string') push(it);
        else if (it && typeof it === 'object' && typeof it.url === 'string') push(it.url);
      }
    }
  }

  // unique
  return Array.from(new Set(out));
}

  /* ──────────────────────────────────────────────────────────────────────────
    Upload Dialog (inline)
    ────────────────────────────────────────────────────────────────────────── */
  function UploadDialog({
    open,
    onOpenChange,
    onAdd,
  }: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    onAdd: (doc: UploadedDoc) => void;
  }) {
    const [pendingType, setPendingType] = useState<DocType | ''>('');
    const [pendingFile, setPendingFile] = useState<File | null>(null);

    const preview = useMemo(
      () => (isImageFile(pendingFile) ? URL.createObjectURL(pendingFile!) : ''),
      [pendingFile]
    );

    function handleAdd() {
      if (!pendingType || !pendingFile) return;
      onAdd({
        id: crypto.randomUUID(),
        type: pendingType as DocType,
        file: pendingFile,
        previewUrl: isImageFile(pendingFile) ? preview : undefined,
      });
      setPendingType('');
      setPendingFile(null);
      onOpenChange(false);
    }

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Document Upload</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Document Type *</Label>
              <Select
                value={pendingType}
                onValueChange={(v) => setPendingType(v as DocType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose Type" />
                </SelectTrigger>
                <SelectContent>
                  {DOC_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Choose File *</Label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setPendingFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-gray-900 file:px-4 file:py-2 file:text-white"
              />
              {preview && (
                <div className="mt-2">
                  <img
                    src={preview}
                    alt="preview"
                    className="max-h-40 rounded-md border"
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAdd}
              disabled={!pendingType || !pendingFile}
            >
              Add file
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  /* ──────────────────────────────────────────────────────────────────────────
    Main Form
    ────────────────────────────────────────────────────────────────────────── */
  type VehicleFormValues = {
    // NEW — from the screenshot
    registrationNumber: string;     // e.g., TS09 AB 1234
    vehicleTypeId: string;          // select value (stringify id)
    status: string;                 // select, defaults to 'available'
    lastServicedDate: string;       // yyyy-mm-dd

    // Existing
    chassisNumber: string;
    vehicleExpiryDate: string;      // yyyy-mm-dd
    extraKmCharge?: string;
    earlyMorningCharges?: string;
    eveningCharges?: string;
    videoUrl: string;

    insurancePolicyNumber: string;
    insuranceStartDate: string;
    insuranceEndDate: string;
    insuranceContactNumber: string;
    rtoCode: string;
  };

  export default function VehicleAddEditForm({
    mode = 'add',
    vendorId,
    branchId,
    vehicle,
    initial,
    onBack,
    onCancel,
    onSaved,
    vehicleTypeOptions,   // NEW
    statusOptions,        // NEW
  }: {
    mode?: 'add' | 'edit';
    vendorId?: string | number;
    branchId?: string | number;
    vehicle?: any;
    initial?: Partial<VehicleFormValues>;
    onBack?: () => void;
    onCancel?: () => void;
    onSaved?: (result?: any) => void;
    vehicleTypeOptions?: Array<{ id: string | number; name: string }>; // NEW
    statusOptions?: string[];                                           // NEW
  }) {
    const { toast } = useToast();
    const [saving, setSaving] = useState(false);

    /* === ADD: sanitize vehicle type options (no empty IDs) === */
  const [vehicleTypes, setVehicleTypes] = useState<VehicleTypeRow[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        await initVehicleTypeMap();
        const rows = await fetchVehicleTypes();
        if (alive) setVehicleTypes(rows || []);
      } catch (e) {
        console.error('vehicle-types load failed', e);
        if (alive) setVehicleTypes([]);
      }
    })();
    return () => { alive = false; };
  }, []);

    const _statusOptions = statusOptions && statusOptions.length > 0
    ? statusOptions
    : STATUS_OPTIONS_DEFAULT;

    // prefer explicit `initial`, then fall back to same-named keys on `vehicle`
    const [values, setValues] = useState<VehicleFormValues>({
    // NEW
    registrationNumber:
      initial?.registrationNumber ?? vehicle?.registrationNumber ?? '',
    vehicleTypeId:
      initial?.vehicleTypeId ??
      (vehicle?.vehicleTypeId != null ? String(vehicle.vehicleTypeId) : ''),
    status:
      initial?.status ?? vehicle?.status ?? 'available',
    lastServicedDate:
      initial?.lastServicedDate ?? vehicle?.lastServicedDate ?? '',

    // Existing
    chassisNumber:
      initial?.chassisNumber ?? vehicle?.chassisNumber ?? '',
    vehicleExpiryDate:
      initial?.vehicleExpiryDate ?? vehicle?.vehicleExpiryDate ?? '',
    extraKmCharge:
      initial?.extraKmCharge ?? (vehicle?.extraKmCharge != null ? String(vehicle.extraKmCharge) : ''),
    earlyMorningCharges:
      initial?.earlyMorningCharges ?? (vehicle?.earlyMorningCharges != null ? String(vehicle.earlyMorningCharges) : ''),
    eveningCharges:
      initial?.eveningCharges ?? (vehicle?.eveningCharges != null ? String(vehicle.eveningCharges) : ''),
    videoUrl:
      initial?.videoUrl ?? vehicle?.videoUrl ?? '',

    insurancePolicyNumber:
      initial?.insurancePolicyNumber ?? vehicle?.insurancePolicyNumber ?? '',
    insuranceStartDate:
      initial?.insuranceStartDate ?? vehicle?.insuranceStartDate ?? '',
    insuranceEndDate:
      initial?.insuranceEndDate ?? vehicle?.insuranceEndDate ?? '',
    insuranceContactNumber:
      initial?.insuranceContactNumber ?? vehicle?.insuranceContactNumber ?? '',
    rtoCode:
      initial?.rtoCode ?? vehicle?.rtoCode ?? '',
  });

  const [existingFiles, setExistingFiles] = useState<string[]>([]);

// whenever "vehicle" prop changes (edit mode), normalize existing file paths
useEffect(() => {
  setExistingFiles(normalizeExistingFromVehicle(vehicle));
}, [vehicle]);

    // upload state
    const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([]);
    const [showUpload, setShowUpload] = useState(false);

    // required fields check (true means missing)
    const missingRequired =
    !values.registrationNumber ||         // NEW
    !values.vehicleTypeId ||              // NEW
    !values.chassisNumber ||
    !values.vehicleExpiryDate ||
    !values.videoUrl ||
    !values.insurancePolicyNumber ||
    !values.insuranceStartDate ||
    !values.insuranceEndDate ||
    !values.insuranceContactNumber ||
    !values.rtoCode;

    function setField<K extends keyof VehicleFormValues>(
      key: K,
      val: VehicleFormValues[K]
    ) {
      setValues((prev) => ({ ...prev, [key]: val }));
    }

    const handleBack = () => {
      // support either prop name
      if (onCancel) onCancel();
      else onBack?.();
    };

    async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!vendorId) {
      toast({
        title: 'Missing vendor',
        description: 'Cannot save vehicle without vendorId.',
        variant: 'destructive',
      });
      return;
    }
    if (missingRequired) {
      toast({
        title: 'Missing required fields',
        description: 'Please fill all * marked fields.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      // Build payload exactly as your VehiclePayload expects
      const payload: VehiclePayload = {
        registrationNumber: values.registrationNumber.trim(),
        chassisNumber: values.chassisNumber?.trim() || null,
        status: values.status || 'available',
        createdBy: undefined, // service defaults to 'VENDOR'
        vehicleTypeId: Number(values.vehicleTypeId),

        // dates (yyyy-mm-dd) or null
        lastServicedDate: values.lastServicedDate || null,
        vehicleExpiryDate: values.vehicleExpiryDate || null,

        // charges
        extraKmCharge: values.extraKmCharge ?? null,
        earlyMorningCharges: values.earlyMorningCharges ?? null,
        eveningCharges: values.eveningCharges ?? null,

        // media
        videoUrl: values.videoUrl || null,

        // insurance
        insurancePolicyNumber: values.insurancePolicyNumber || null,
        insuranceStartDate: values.insuranceStartDate || null,
        insuranceEndDate: values.insuranceEndDate || null,
        insuranceContactNumber: values.insuranceContactNumber || null,
        rtoCode: values.rtoCode || null,
      };

      const hasFiles = uploadedDocs.length > 0;

      let result: any;
      if (hasFiles) {
        // multipart path → backend will persist uploads into additional_images
        result = await submitVehicleMultipart({
          mode,
          vendorId: String(vendorId),
          vehicleId: mode === 'edit' ? String(vehicle?.id) : undefined,
          payload,
          docs: uploadedDocs,
        });
      } else {
        // keep your existing JSON services when no files selected
        result =
          mode === 'add'
            ? await createVendorVehicle(String(vendorId), payload)
            : await updateVendorVehicle(String(vendorId), String(vehicle?.id), payload);
      }

      toast({
        title: mode === 'add' ? 'Vehicle saved' : 'Vehicle updated',
        description: hasFiles
          ? `Uploaded ${uploadedDocs.length} file(s) too.`
          : 'Changes persisted successfully.',
      });
      onSaved?.(result);
    } catch (err: any) {
      console.error(err);
      toast({
        title: 'Save failed',
        description: err?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  }

    return (
      <div className="w-full">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Top section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Registration Number */}
            <div>
              <Label>
                Registration Number <span className="text-rose-600">*</span>
              </Label>
              <Input
                value={values.registrationNumber}
                onChange={(e) => setField('registrationNumber', e.target.value.toUpperCase())}
                placeholder="e.g. TS09 AB 1234"
              />
            </div>

            {/* Chassis Number */}
            <div>
              <Label>
                Chassis Number <span className="text-rose-600">*</span>
              </Label>
              <Input
                value={values.chassisNumber}
                onChange={(e) => setField('chassisNumber', e.target.value)}
                placeholder="Chassis Number"
              />
            </div>

            {/* Vehicle Type (native <select> like the reference) */}
              <div>
                <Label>
                  Vehicle Type <span className="text-rose-600">*</span>
                </Label>
                <select
                  className="border px-3 py-2 w-full rounded"
                  value={values.vehicleTypeId || ''}                 // keep '' until user chooses
                  onChange={(e) => setField('vehicleTypeId', e.target.value)}
                >
                  <option value="">Choose Vehicle Type</option>
                  {vehicleTypes.map((vt) => (
                    <option key={vt.id} value={String(vt.id)}>
                      {vt.name}
                    </option>
                  ))}
                </select>
              </div>

            {/* Status (select) */}
            <div>
              <Label>Status</Label>
              <Select
                value={values.status}
                onValueChange={(v) => setField('status', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="available" />
                </SelectTrigger>
                <SelectContent>
                  {(_statusOptions ?? [])
                    .map((s) => String(s).trim())
                    .filter((s) => s !== '')
                    .map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Vehicle Expiry Date */}
            <div>
              <Label>
                Vehicle Expiry Date <span className="text-rose-600">*</span>
              </Label>
              <Input
                type="date"
                value={values.vehicleExpiryDate}
                onChange={(e) => setField('vehicleExpiryDate', e.target.value)}
                placeholder="dd-mm-yyyy"
              />
            </div>

            {/* Last Serviced Date */}
            <div>
              <Label>Last Serviced Date</Label>
              <Input
                type="date"
                value={values.lastServicedDate}
                onChange={(e) => setField('lastServicedDate', e.target.value)}
                placeholder="dd-mm-yyyy"
              />
            </div>

            {/* Charges */}
            <div>
              <Label>Extra KM Charge (₹)</Label>
              <Input
                value={values.extraKmCharge}
                onChange={(e) => setField('extraKmCharge', e.target.value)}
                placeholder="0"
                inputMode="decimal"
              />
            </div>

            <div>
              <Label>Early Morning Charges (₹)</Label>
              <Input
                value={values.earlyMorningCharges}
                onChange={(e) => setField('earlyMorningCharges', e.target.value)}
                placeholder="0"
                inputMode="decimal"
              />
            </div>

            <div>
              <Label>Evening Charges (₹)</Label>
              <Input
                value={values.eveningCharges}
                onChange={(e) => setField('eveningCharges', e.target.value)}
                placeholder="0"
                inputMode="decimal"
              />
            </div>

            {/* Video */}
            <div>
              <Label>
                Vehicle Video URL <span className="text-rose-600">*</span>
              </Label>
              <Input
                value={values.videoUrl}
                onChange={(e) => setField('videoUrl', e.target.value)}
                placeholder="/media/videos/abc.mp4 or https://…"
              />
            </div>
          </div>

          {/* Insurance & FC */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>
                Insurance Policy Number <span className="text-rose-600">*</span>
              </Label>
              <Input
                value={values.insurancePolicyNumber}
                onChange={(e) =>
                  setField('insurancePolicyNumber', e.target.value)
                }
                placeholder="Insurance Policy Number"
              />
            </div>

            <div>
              <Label>
                Insurance Start Date <span className="text-rose-600">*</span>
              </Label>
              <Input
                type="date"
                value={values.insuranceStartDate}
                onChange={(e) => setField('insuranceStartDate', e.target.value)}
                placeholder="mm/dd/yyyy"
              />
            </div>

            <div>
              <Label>
                Insurance End Date <span className="text-rose-600">*</span>
              </Label>
              <Input
                type="date"
                value={values.insuranceEndDate}
                onChange={(e) => setField('insuranceEndDate', e.target.value)}
                placeholder="mm/dd/yyyy"
              />
            </div>

            <div>
              <Label>
                Insurance Contact Number <span className="text-rose-600">*</span>
              </Label>
              <Input
                value={values.insuranceContactNumber}
                onChange={(e) =>
                  setField('insuranceContactNumber', e.target.value)
                }
                placeholder="Insurance Contact Number"
                inputMode="tel"
              />
            </div>

            <div>
              <Label>
                RTO Code <span className="text-rose-600">*</span>
              </Label>
              <Input
                value={values.rtoCode}
                onChange={(e) => setField('rtoCode', e.target.value)}
                placeholder="RTO Code"
              />
            </div>
          </div>

          {/* Upload section */}
          {mode === 'edit' && existingFiles.length > 0 && (
            <div>
              <h3 className="text-[15px] font-semibold mb-3">Existing files</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {existingFiles.map((rel, i) => {
                  const url = toPublicUrl(rel);
                  const name = rel?.split('/').pop() || rel;
                  const img = isImagePath(rel);
                  return (
                    <div
                      key={`${rel}-${i}`}
                      className="relative rounded-2xl border border-gray-200 p-3 shadow-sm bg-white"
                    >
                      <div className="text-sm font-semibold mb-2">Stored</div>
                      <div className="aspect-[1/1] mb-2 flex items-center justify-center overflow-hidden rounded-xl border border-dashed">
                        {img ? (
                          <img src={url} alt={name} className="h-full w-full object-cover" />
                        ) : (
                          <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex h-28 w-28 items-center justify-center rounded-lg border text-xs text-blue-600 underline"
                            title={name}
                          >
                            Open file
                          </a>
                        )}
                      </div>
                      <div className="text-xs text-gray-700" title={name}>
                        {shortName(name)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div>
            <h3 className="text-[15px] font-semibold mb-3">Upload</h3>

            {uploadedDocs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {uploadedDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="relative rounded-2xl border border-gray-200 p-3 shadow-sm bg-pink-50"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setUploadedDocs((prev) => prev.filter((d) => d.id !== doc.id))
                      }
                      className="absolute -top-2 -right-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-800 text-white text-xs"
                      aria-label="Remove"
                    >
                      ×
                    </button>

                    <div className="text-sm font-semibold mb-2">{doc.type}</div>

                    <div className="aspect-[1/1] mb-2 flex items-center justify-center overflow-hidden rounded-xl border border-dashed">
                      {doc.previewUrl ? (
                        <img
                          src={doc.previewUrl}
                          alt={doc.file.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-28 w-28 items-center justify-center rounded-lg border">
                          <div className="text-xs text-gray-500">Preview</div>
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-gray-700">
                      {shortName(doc.file.name)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mb-4 rounded-2xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
                No Documents Found
              </div>
            )}

            <div className="flex gap-3">
              <Button type="button" onClick={() => setShowUpload(true)}>
                + Upload File
              </Button>
              {uploadedDocs.length > 0 && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowUpload(true)}
                >
                  + Upload Again
                </Button>
              )}
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleBack}
              disabled={saving}
            >
              Back
            </Button>

            <Button type="submit" disabled={missingRequired || saving}>
              {mode === 'add'
                ? saving
                  ? 'Saving…'
                  : 'Save & Continue'
                : saving
                ? 'Saving…'
                : 'Save'}
            </Button>
          </div>

          {/* Upload modal */}
          <UploadDialog
            open={showUpload}
            onOpenChange={setShowUpload}
            onAdd={(doc) => setUploadedDocs((prev) => [...prev, doc])}
          />
        </form>
      </div>
    );
  }
