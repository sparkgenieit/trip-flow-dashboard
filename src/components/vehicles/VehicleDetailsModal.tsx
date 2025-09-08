// REPLACE ENTIRE FILE
// src/components/vehicles/VehicleDetailsModal.tsx
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
import { Badge } from '@/components/ui/badge';

interface VendorLite {
  id: number;
  companyReg?: string;
  name?: string;
}

interface Vehicle {
  id: number;
  name: string;
  model: string;
  image?: string | string[]; // single path or array
  capacity: number;
  registrationNumber: string;
  price: number;
  originalPrice: number;
  status: string;
  comfortLevel: number;
  lastServicedDate: string | null;
  vehicleTypeId: number;
  vendorId: number | null;
  vendor?: VendorLite | null;

  // Insurance & FC
  insurancePolicyNumber?: string | null;
  insuranceStartDate?: string | null; // date (ISO or date-only)
  insuranceEndDate?: string | null;   // date (ISO or date-only)
  insuranceContactNumber?: string | null;
  rtoCode?: string | null;
}

interface VehicleDetailsModalProps {
  vehicle: Vehicle | null;
  onClose: () => void;
}

const API_BASE =
  (import.meta as any).env?.VITE_API_BASE_URL?.replace(/\/$/, '') || '';

const toSrc = (p: string) =>
  /^https?:\/\//i.test(p)
    ? p
    : `${API_BASE}/${String(p).replace(/\\/g, '/').replace(/^\/+/, '')}`;

const safeDate = (d?: string | null) => {
  if (!d) return 'N/A';
  const onlyDate = /^\d{4}-\d{2}-\d{2}$/.test(d) ? `${d}T00:00:00Z` : d;
  const dt = new Date(onlyDate);
  return isNaN(+dt) ? 'N/A' : dt.toLocaleDateString();
};

const toDate = (d?: string | null) => {
  if (!d) return null;
  const s = /^\d{4}-\d{2}-\d{2}$/.test(d) ? `${d}T00:00:00Z` : d;
  const dt = new Date(s);
  return isNaN(+dt) ? null : dt;
};

const daysUntil = (d?: string | null) => {
  const dt = toDate(d);
  if (!dt) return null;
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diff = dt.getTime() - startOfToday.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const VehicleDetailsModal: React.FC<VehicleDetailsModalProps> = ({ vehicle, onClose }) => {
  if (!vehicle) return null;

  // Build a list of absolute URLs for all images (supports string or string[])
  const imgList = React.useMemo(() => {
    const list = Array.isArray(vehicle.image)
      ? vehicle.image
      : vehicle.image
      ? [vehicle.image]
      : [];
    return list.map(toSrc);
  }, [vehicle]);

  const vendorLabel =
    vehicle.vendor?.companyReg ||
    vehicle.vendor?.name ||
    (vehicle.vendorId != null ? `Vendor #${vehicle.vendorId}` : 'Independent');

  const d = daysUntil(vehicle.insuranceEndDate ?? null);
  const isExpired = d !== null && d < 0;
  const dueSoon = d !== null && d >= 0 && d <= 15;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-3xl sm:max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <DialogTitle className="text-xl">
                Vehicle Details · {vehicle.registrationNumber}
              </DialogTitle>
              <DialogDescription>Full vehicle profile</DialogDescription>
            </div>
            <div className="flex gap-2">
              {isExpired && <Badge variant="destructive">Insurance expired</Badge>}
              {!isExpired && dueSoon && <Badge variant="secondary">Due in {d}d</Badge>}
              <Badge variant={vehicle.status === 'available' ? 'default' : 'secondary'}>
                {vehicle.status}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Info panels */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Vehicle panel */}
            <section className="rounded-lg border p-4">
              <h4 className="font-semibold mb-3">Vehicle</h4>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <dt className="text-muted-foreground">Registration</dt>
                <dd>{vehicle.registrationNumber}</dd>

                <dt className="text-muted-foreground">Model</dt>
                <dd>{vehicle.model}</dd>

                <dt className="text-muted-foreground">Comfort</dt>
                <dd>{vehicle.comfortLevel}/5</dd>

                <dt className="text-muted-foreground">Rate / Km</dt>
                <dd>₹{vehicle.price}</dd>

                <dt className="text-muted-foreground">Capacity</dt>
                <dd>{vehicle.capacity} seater</dd>

                <dt className="text-muted-foreground">Last Serviced</dt>
                <dd>{safeDate(vehicle.lastServicedDate)}</dd>

                <dt className="text-muted-foreground">Vendor</dt>
                <dd>{vendorLabel}</dd>
              </dl>
            </section>

            {/* Insurance & FC panel */}
            <section className="rounded-lg border p-4">
              <h4 className="font-semibold mb-3">Insurance &amp; FC</h4>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <dt className="text-muted-foreground">Policy Number</dt>
                <dd>{vehicle.insurancePolicyNumber || 'N/A'}</dd>

                <dt className="text-muted-foreground">Start Date</dt>
                <dd>{safeDate(vehicle.insuranceStartDate)}</dd>

                <dt className="text-muted-foreground">End Date</dt>
                <dd className="flex items-center gap-2">
                  {safeDate(vehicle.insuranceEndDate)}
                  {isExpired && <Badge variant="destructive">Expired</Badge>}
                  {!isExpired && dueSoon && <Badge variant="secondary">Due in {d}d</Badge>}
                </dd>

                <dt className="text-muted-foreground">Contact Number</dt>
                <dd>{vehicle.insuranceContactNumber || 'N/A'}</dd>

                <dt className="text-muted-foreground">RTO Code</dt>
                <dd>{vehicle.rtoCode || 'N/A'}</dd>
              </dl>
            </section>
          </div>

          {/* Image gallery */}
          <section className="rounded-lg border p-4">
            <h4 className="font-semibold mb-3">Vehicle Images</h4>
            {imgList.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {imgList.map((src, idx) => (
                  <img
                    key={idx}
                    src={src}
                    alt={`vehicle-${idx}`}
                    className="h-28 w-full object-cover rounded border"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="h-32 w-full rounded border flex items-center justify-center text-sm text-gray-500">
                No image available
              </div>
            )}
          </section>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VehicleDetailsModal;