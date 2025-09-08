'use client';

import React, { useMemo, useState } from 'react';
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

type UploadedDoc = {
  id: string;
  type: DocType;
  file: File;
  previewUrl?: string; // image previews only
};

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
  chassisNumber: string;
  vehicleExpiryDate: string; // yyyy-mm-dd
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
  branchId,      // NEW: accepted to match caller
  vehicle,       // NEW: accepted to match caller
  initial,       // still supported
  onBack,        // still supported
  onCancel,      // NEW: accepted to match caller
  onSaved,
}: {
  mode?: 'add' | 'edit';
  vendorId?: string | number;
  branchId?: string | number;              // NEW
  vehicle?: any;                           // NEW (prefills if provided)
  initial?: Partial<VehicleFormValues>;
  onBack?: () => void;
  onCancel?: () => void;                   // NEW
  onSaved?: (result?: any) => void;
}) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  // prefer explicit `initial`, then fall back to same-named keys on `vehicle`
  const [values, setValues] = useState<VehicleFormValues>({
    chassisNumber:
      initial?.chassisNumber ?? vehicle?.chassisNumber ?? '',
    vehicleExpiryDate:
      initial?.vehicleExpiryDate ?? vehicle?.vehicleExpiryDate ?? '',
    extraKmCharge:
      initial?.extraKmCharge ?? vehicle?.extraKmCharge ?? '',
    earlyMorningCharges:
      initial?.earlyMorningCharges ?? vehicle?.earlyMorningCharges ?? '',
    eveningCharges:
      initial?.eveningCharges ?? vehicle?.eveningCharges ?? '',
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

  // upload state
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([]);
  const [showUpload, setShowUpload] = useState(false);

  // required fields check (true means missing)
  const missingRequired =
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
      const fd = new FormData();

      // Append identifying context if your API needs it
      if (vendorId !== undefined) fd.append('vendorId', String(vendorId));
      if (branchId !== undefined) fd.append('branchId', String(branchId));

      // Append form fields
      Object.entries(values).forEach(([k, v]) => fd.append(k, v ?? ''));

      // Append uploaded documents
      uploadedDocs.forEach((d, i) => {
        fd.append(`documents[${i}][type]`, d.type);
        fd.append(`documents[${i}][file]`, d.file);
      });

      // TODO: POST formData to your API (adjust URL & method)
      // const url =
      //   mode === 'add'
      //     ? `/api/vendors/${vendorId}/vehicles`
      //     : `/api/vendors/${vendorId}/vehicles/${vehicle?.id ?? 'update'}`;
      // const res = await fetch(url, { method: 'POST', body: fd });
      // const result = await res.json();

      toast({
        title: mode === 'add' ? 'Vehicle saved' : 'Vehicle updated',
        description: `${uploadedDocs.length} document(s) attached.`,
      });
      onSaved?.(/* result */);
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

          <div>
            <Label>
              Vehicle Expiry Date <span className="text-rose-600">*</span>
            </Label>
            <Input
              type="date"
              value={values.vehicleExpiryDate}
              onChange={(e) => setField('vehicleExpiryDate', e.target.value)}
              placeholder="mm/dd/yyyy"
            />
          </div>

          <div>
            <Label>Extra KM Charge (₹)</Label>
            <Input
              value={values.extraKmCharge}
              onChange={(e) => setField('extraKmCharge', e.target.value)}
              placeholder="Extra KM Charge"
              inputMode="decimal"
            />
          </div>

          <div>
            <Label>Early Morning Charges (₹) (Before 6 AM)</Label>
            <Input
              value={values.earlyMorningCharges}
              onChange={(e) => setField('earlyMorningCharges', e.target.value)}
              placeholder="Early Morning Charges"
              inputMode="decimal"
            />
          </div>

          <div>
            <Label>Evening Charges (₹) (After 8 PM)</Label>
            <Input
              value={values.eveningCharges}
              onChange={(e) => setField('eveningCharges', e.target.value)}
              placeholder="Evening Charges"
              inputMode="decimal"
            />
          </div>

          <div>
            <Label>
              Vehicle Video URL <span className="text-rose-600">*</span>
            </Label>
            <Input
              value={values.videoUrl}
              onChange={(e) => setField('videoUrl', e.target.value)}
              placeholder="Enter Video URL"
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
