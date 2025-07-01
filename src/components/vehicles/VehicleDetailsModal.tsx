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
  image: string;
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
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VehicleDetailsModal;
