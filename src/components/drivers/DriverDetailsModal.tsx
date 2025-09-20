//DriverDetailsModal.tsx
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type Maybe<T> = T | null | undefined;

// Browser-safe base URL for relative image paths
const API_BASE_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) ||
  (typeof window !== 'undefined' && (window as any).__API_BASE_URL__) ||
  '';

/* -------------------- helpers -------------------- */
function fmtDate(v: Maybe<string | number | Date>) {
  if (!v) return undefined;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d.toLocaleDateString();
}

function toUrl(path?: string | null) {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL}/${String(path).replace(/^\/+/, '')}`.replace(/([^:]\/)\/+/g, '$1');
}

function isImageUrl(u?: string) {
  return !!u && /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(u);
}

/** Normalize a driver coming from GET /drivers/:id/full (new schema only) */
function mapDriver(d: any) {
  if (!d) return null;

  const vendorName = d?.vendor?.companyReg || d?.vendor?.name || undefined;

  const vehicleAssigned = d?.assignedVehicle?.registrationNumber
    ? `${d.assignedVehicle.registrationNumber}${
        d?.assignedVehicle?.model ? ` • ${d.assignedVehicle.model}` : ''
      }`
    : undefined;

  // Document URLs (support older/newer shapes and fallbacks)
  const aadharUrl = toUrl(
    d?.documents?.aadharUrl ?? d?.documents?.aadhaarUrl ?? d?.documents?.aadhar ?? d?.documents?.aadhaar
  );
  const panUrl = toUrl(d?.documents?.panUrl ?? d?.documents?.pan);
  const voterUrl = toUrl(d?.documents?.voterUrl ?? d?.documents?.voter);
  // Prefer document license; fall back to driver.licenseImage
  const licenseDoc = toUrl(d?.documents?.licenseUrl ?? d?.documents?.license ?? d?.licenseImage);

  return {
    id: d?.id,
    // BASIC
    fullName: d?.fullName || '',
    phone: d?.phone || '',
    email: d?.email || '',
    whatsappPhone: d?.whatsappPhone || '',
    altPhone: d?.altPhone || '',
    licenseNumber: d?.licenseNumber || '',
    licenseIssueDate: fmtDate(d?.licenseIssueDate),
    licenseExpiry: fmtDate(d?.licenseExpiry),
    dob: fmtDate(d?.dob),
    gender: d?.gender || '',
    bloodGroup: d?.bloodGroup || '',
    aadhaarNumber: d?.aadhaarNumber || '',
    panNumber: d?.panNumber || '',
    voterId: d?.voterId || '',
    address: d?.address || '',
    isAvailable: d?.isAvailable,
    isPartTime: d?.isPartTime,

    vendorName,
    vehicleAssigned,

    // Images
    profileImageUrl: toUrl(d?.profileImage),
    // RC removed per new form — do not show
    licenseImageUrl: licenseDoc,

    // Document previews
    docs: {
      aadharUrl,
      panUrl,
      voterUrl,
      licenseUrl: licenseDoc,
    },

    cost: d?.costDetails || null,
    feedback: d?.feedbackMeta || null,
  };
}

interface DriverDetailsModalProps {
  driver: any | null; // driver from /drivers/:id/full
  onClose: () => void;
}

const Row: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div className="flex justify-between gap-4 text-sm">
    <div className="font-medium text-muted-foreground">{label}</div>
    <div className="text-right break-words">{value ?? '—'}</div>
  </div>
);

const DocThumb: React.FC<{ label: string; url?: string }> = ({ label, url }) => (
  <div className="space-y-1">
    <div className="text-xs font-medium text-muted-foreground">{label}</div>
    {url ? (
      isImageUrl(url) ? (
        <img
          src={url}
          alt={label}
          className="w-24 h-24 rounded border object-cover"
        />
      ) : (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-xs underline"
          title="Open document"
        >
          View document
        </a>
      )
    ) : (
      <div className="text-xs text-muted-foreground">—</div>
    )}
  </div>
);

const DriverDetailsModal: React.FC<DriverDetailsModalProps> = ({ driver, onClose }) => {
  if (!driver) return null;
  const d = mapDriver(driver);
  if (!d) return null;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      {/* cap height, make inner content scrollable and keep footer clickable */}
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        {/* Sticky header */}
        <div className="px-6 pt-6 pb-3 border-b sticky top-0 bg-background z-10">
          <DialogHeader className="p-0">
            <DialogTitle>Driver Details</DialogTitle>
            <DialogDescription>Full driver profile</DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable body */}
        <div className="px-6 pb-4 overflow-y-auto max-h-[70vh] space-y-4">
          {/* Primary images (Profile + License only) */}
          {(d.profileImageUrl || d.licenseImageUrl) && (
            <div className="grid grid-cols-2 gap-6">
              <DocThumb label="Profile" url={d.profileImageUrl} />
            </div>
          )}

          {/* Core details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Row label="Name" value={d.fullName} />
              <Row label="Phone" value={d.phone} />
              <Row label="Email" value={d.email} />
              <Row label="WhatsApp" value={d.whatsappPhone} />
              <Row label="Alternate Phone" value={d.altPhone} />
              <Row label="Address" value={d.address} />
            </div>

            <div className="space-y-2">
              <Row label="License Number" value={d.licenseNumber} />
              <Row label="License Issue Date" value={d.licenseIssueDate} />
              <Row label="License Expiry" value={d.licenseExpiry} />
              <Row
                label="Status"
                value={
                  typeof d.isAvailable === 'boolean'
                    ? d.isAvailable
                      ? 'Available'
                      : 'Unavailable'
                    : '—'
                }
              />
              <Row
                label="Type"
                value={
                  typeof d.isPartTime === 'boolean'
                    ? d.isPartTime
                      ? 'Part Time'
                      : 'Full Time'
                    : '—'
                }
              />
              <Row label="Vendor" value={d.vendorName ?? 'Independent'} />
              <Row label="Vehicle Assigned" value={d.vehicleAssigned ?? 'Not assigned'} />
            </div>

            {/* Secondary details */}
            <div className="space-y-2 md:col-span-2 pt-2 border-t">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Row label="DOB" value={d.dob} />
                <Row label="Gender" value={d.gender} />
                <Row label="Blood Group" value={d.bloodGroup} />
                <Row label="Aadhaar" value={d.aadhaarNumber} />
                <Row label="PAN" value={d.panNumber} />
                <Row label="Voter ID" value={d.voterId} />
              </div>
            </div>
          </div>

          {/* Documents grid */}
          <div className="mt-2 border-t pt-4">
            <div className="text-sm font-semibold mb-2">Documents</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <DocThumb label="Aadhaar" url={d.docs?.aadharUrl} />
              <DocThumb label="PAN" url={d.docs?.panUrl} />
              <DocThumb label="Voter ID" url={d.docs?.voterUrl} />
              <DocThumb label="License" url={d.docs?.licenseUrl} />
            </div>
          </div>
        </div>

        {/* Sticky footer with always-clickable Close */}
        <div className="px-6 py-3 border-t sticky bottom-0 bg-background z-10 flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DriverDetailsModal;
