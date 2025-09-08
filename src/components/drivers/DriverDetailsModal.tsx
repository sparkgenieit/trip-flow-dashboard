import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// Browser-safe base URL for relative image paths
const API_BASE_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) ||
  (typeof window !== 'undefined' && (window as any).__API_BASE_URL__) ||
  '';

type Maybe<T> = T | null | undefined;

function fmtDate(v: Maybe<string | number | Date>) {
  if (!v) return undefined;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d.toLocaleDateString();
}

function toUrl(path?: string) {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL}/${path}`.replace(/([^:]\/)\/+/g, '$1'); // collapse //
}

// Normalize any backend shape to one display object
function mapDriver(d: any) {
  if (!d) return null;

  const fullName =
    d?.profiles?.full_name ??
    d?.fullName ??
    d?.name ??
    '';

  const phone =
    d?.profiles?.phone ??
    d?.phone ??
    d?.whatsappPhone ??
    '';

  const email = d?.profiles?.email ?? d?.email ?? '';

  const licenseNumber = d?.license_number ?? d?.licenseNumber ?? '';
  const licenseExpiryRaw = d?.license_expiry ?? d?.licenseExpiry ?? null;

  const isAvailable =
    typeof d?.is_available === 'boolean' ? d.is_available :
    typeof d?.isAvailable === 'boolean' ? d.isAvailable :
    undefined;

  const isPartTime =
    typeof d?.is_part_time === 'boolean' ? d.is_part_time :
    typeof d?.isPartTime === 'boolean' ? d.isPartTime :
    undefined;

  const vendorName =
    d?.vendors?.company_name ??
    d?.vendor?.companyReg ??
    d?.vendor?.name ??
    d?.vendorName ??
    null;

  const vehicleNumber =
    d?.vehicles?.vehicle_number ??
    d?.assignedVehicle?.registrationNumber ??
    null;

  const vehicleModel =
    d?.vehicles?.type ??
    d?.assignedVehicle?.model ??
    null;

  // NEW FIELDS
  const whatsappPhone = d?.whatsappPhone ?? d?.whatsapp_phone ?? null;
  const altPhone = d?.altPhone ?? d?.alt_phone ?? null;
  const licenseIssueDateRaw = d?.licenseIssueDate ?? d?.license_issue_date ?? null;
  const dobRaw = d?.dob ?? d?.date_of_birth ?? null;
  const gender = d?.gender ?? null;
  const bloodGroup = d?.bloodGroup ?? d?.blood_group ?? null;
  const aadhaarNumber = d?.aadhaarNumber ?? d?.aadhaar_number ?? null;
  const panNumber = d?.panNumber ?? d?.pan_number ?? null;
  const voterId = d?.voterId ?? d?.voter_id ?? null;
  const address = d?.address ?? d?.profiles?.address ?? null;

  // Images
  const profileImage = d?.profileImage ?? d?.profile_image ?? null;
  const licenseImage = d?.licenseImage ?? d?.license_image ?? null;
  const rcImage = d?.rcImage ?? d?.rc_image ?? null;

  return {
    id: d?.id ?? d?.driver_id ?? '',
    fullName,
    phone,
    email,
    licenseNumber,
    licenseExpiry: fmtDate(licenseExpiryRaw),
    isAvailable,
    isPartTime,
    vendorName,
    vehicleNumber,
    vehicleModel,

    whatsappPhone,
    altPhone,
    licenseIssueDate: fmtDate(licenseIssueDateRaw),
    dob: fmtDate(dobRaw),
    gender,
    bloodGroup,
    aadhaarNumber,
    panNumber,
    voterId,
    address,

    profileImageUrl: toUrl(profileImage),
    licenseImageUrl: toUrl(licenseImage),
    rcImageUrl: toUrl(rcImage),
  };
}

interface DriverDetailsModalProps {
  driver: any | null; // accept mixed shapes; we normalize
  onClose: () => void;
}

const Row: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div className="flex justify-between gap-4 text-sm">
    <div className="font-medium text-muted-foreground">{label}</div>
    <div className="text-right break-words">{value ?? '—'}</div>
  </div>
);

const DriverDetailsModal: React.FC<DriverDetailsModalProps> = ({ driver, onClose }) => {
  if (!driver) return null;
  const d = mapDriver(driver);
  if (!d) return null;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Driver Details</DialogTitle>
          <DialogDescription>Full driver profile</DialogDescription>
        </DialogHeader>

        {/* Images */}
        {(d.profileImageUrl || d.licenseImageUrl || d.rcImageUrl) && (
          <div className="grid grid-cols-3 gap-4 pb-2">
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground">Profile</div>
              {d.profileImageUrl ? (
                <img
                  src={d.profileImageUrl}
                  alt="Profile"
                  className="w-24 h-24 object-cover rounded-full border"
                />
              ) : (
                <div className="text-xs text-muted-foreground">—</div>
              )}
            </div>
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground">License</div>
              {d.licenseImageUrl ? (
                <img
                  src={d.licenseImageUrl}
                  alt="License"
                  className="w-24 h-24 object-cover rounded border"
                />
              ) : (
                <div className="text-xs text-muted-foreground">—</div>
              )}
            </div>
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground">RC</div>
              {d.rcImageUrl ? (
                <img
                  src={d.rcImageUrl}
                  alt="RC"
                  className="w-24 h-24 object-cover rounded border"
                />
              ) : (
                <div className="text-xs text-muted-foreground">—</div>
              )}
            </div>
          </div>
        )}

        {/* Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <Row label="Status" value={d.isAvailable === undefined ? '—' : d.isAvailable ? 'Available' : 'Unavailable'} />
            <Row label="Type" value={d.isPartTime === undefined ? '—' : d.isPartTime ? 'Part Time' : 'Full Time'} />
            <Row label="Vendor" value={d.vendorName ?? 'Independent'} />
            <Row
              label="Vehicle Assigned"
              value={
                d.vehicleNumber
                  ? `${d.vehicleNumber}${d.vehicleModel ? ` • ${d.vehicleModel}` : ''}`
                  : 'Not assigned'
              }
            />
          </div>

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

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DriverDetailsModal;