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
  image: string[];
  capacity: number;
  registrationNumber: string;
  price: number;
  originalPrice: number;
  status: string;
  comfortLevel: number;
  lastServicedDate: string;
  vehicleTypeId: number;
  vendorId: number | null;
}

interface VehicleDetailsModalProps {
  vehicle: Vehicle | null;
  onClose: () => void;
}

const VehicleDetailsModal: React.FC<VehicleDetailsModalProps> = ({ vehicle, onClose }) => {
  if (!vehicle) return null;
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Vehicle Details</DialogTitle>
          <DialogDescription>Full vehicle profile</DialogDescription>
        </DialogHeader>

        <div className="space-y-2 text-sm">
          <div><strong>Registration Number:</strong> {vehicle.registrationNumber}</div>
          <div><strong>Type:</strong> {vehicle.model}</div>
          <div><strong>Comfort Level:</strong> {vehicle.comfortLevel}/5</div>
          <div><strong>Rate per KM:</strong> ₹{vehicle.price}</div>
          <div><strong>Status:</strong> {vehicle.status}</div>
          <div><strong>Capacity:</strong> {vehicle.capacity} seater</div>
          <div><strong>Last Serviced:</strong> {vehicle.lastServicedDate ? new Date(vehicle.lastServicedDate).toLocaleDateString() : 'N/A'}</div>
          <div><strong>Vendor ID:</strong> {vehicle.vendorId ?? 'Independent'}</div>
          {vehicle.image && Array.isArray(vehicle.image) && vehicle.image.length > 0 && (
  <div className="space-y-1 mt-2">
    <strong>Vehicle Images:</strong>
    <div className="flex gap-2 mt-1 flex-wrap">
      {vehicle.image.map((img, idx) => (
        <img
          key={idx}
          src={`${import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')}/${img.replace(/^\/+/, '')}`}
          alt={`vehicle-${idx}`}
          className="w-24 h-24 object-cover border rounded"
        />
      ))}
    </div>
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
