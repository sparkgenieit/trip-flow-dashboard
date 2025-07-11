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

interface Driver {
  id: string;
  license_number: string;
  license_expiry: string;
  is_part_time: boolean;
  is_available: boolean;
  vendor_id: string;
  assigned_vehicle_id: string;
  profiles: {
    full_name: string;
    phone: string;
  };
  vendors: {
    company_name: string;
  };
  vehicles: {
    vehicle_number: string;
    type: string;
  };
}

interface DriverDetailsModalProps {
  driver: Driver | null;
  onClose: () => void;
}

const DriverDetailsModal: React.FC<DriverDetailsModalProps> = ({ driver, onClose }) => {
  if (!driver) return null;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Driver Details</DialogTitle>
          <DialogDescription>Full driver profile</DialogDescription>
        </DialogHeader>

        <div className="space-y-2 text-sm">
          <div><strong>Name:</strong> {driver.profiles?.full_name}</div>
          <div><strong>Phone:</strong> {driver.profiles?.phone}</div>
          <div><strong>License Number:</strong> {driver.license_number}</div>
          <div><strong>License Expiry:</strong> {driver.license_expiry ? new Date(driver.license_expiry).toLocaleDateString() : 'Not set'}</div>
          <div><strong>Status:</strong> {driver.is_available ? 'Available' : 'Unavailable'}</div>
          <div><strong>Type:</strong> {driver.is_part_time ? 'Part Time' : 'Full Time'}</div>
          <div><strong>Vendor:</strong> {driver.vendors?.company_name || 'Independent'}</div>
          <div><strong>Vehicle Assigned:</strong> {driver.vehicles?.vehicle_number || 'Not assigned'}</div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DriverDetailsModal;
