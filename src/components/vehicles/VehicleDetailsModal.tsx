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
}

interface VehicleDetailsModalProps {
  vehicle: Vehicle | null;
  onClose: () => void;
}

const API_BASE =
  (import.meta as any).env?.VITE_API_BASE_URL?.replace(/\/$/, '') || '';

const VehicleDetailsModal: React.FC<VehicleDetailsModalProps> = ({ vehicle, onClose }) => {
  if (!vehicle) return null;

  // Build a list of absolute URLs for all images (supports string or string[])
  const imgList = React.useMemo(() => {
    const list = Array.isArray(vehicle.image)
      ? vehicle.image
      : vehicle.image
      ? [vehicle.image]
      : [];
    return list.map((p) =>
      `${API_BASE}/${String(p).replace(/\\/g, '/').replace(/^\/+/, '')}`
    );
  }, [vehicle]);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Vehicle Details</DialogTitle>
          <DialogDescription>Full vehicle profile</DialogDescription>
        </DialogHeader>

        <div className="space-y-2 text-sm">
          <div><strong>Registration Number:</strong> {vehicle.registrationNumber}</div>
          <div><strong>Model:</strong> {vehicle.model}</div>
          <div><strong>Comfort Level:</strong> {vehicle.comfortLevel}/5</div>
          <div><strong>Rate per KM:</strong> ₹{vehicle.price}</div>
          <div><strong>Status:</strong> {vehicle.status}</div>
          <div><strong>Capacity:</strong> {vehicle.capacity} seater</div>
          <div>
            <strong>Last Serviced:</strong>{' '}
            {vehicle.lastServicedDate
              ? new Date(vehicle.lastServicedDate).toLocaleDateString()
              : 'N/A'}
          </div>
          <div><strong>Vendor ID:</strong> {vehicle.vendorId ?? 'Independent'}</div>
        </div>

        {/* Vehicle Images (below all details) */}
        <div className="mt-4">
          <div className="font-semibold mb-2">Vehicle Images</div>
          {imgList.length > 0 ? (
            <div className="flex gap-2 flex-wrap">
              {imgList.map((src, idx) => (
                <img
                  key={idx}
                  src={src}
                  alt={`vehicle-${idx}`}
                  className="w-28 h-28 object-cover rounded border"
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
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VehicleDetailsModal;
