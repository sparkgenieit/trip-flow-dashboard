import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { VehicleTypeDTO } from '@/services/vehicleTypes';

interface Props {
  vehicleType: VehicleTypeDTO | null;
  onClose: () => void;
}

export default function VehicleTypeDetailsModal({ vehicleType, onClose }: Props) {
  if (!vehicleType) return null;
  const imgs = Array.isArray(vehicleType.image) ? vehicleType.image : vehicleType.image ? [vehicleType.image] : [];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Vehicle Type Details</DialogTitle>
          <DialogDescription>Full vehicle type profile</DialogDescription>
        </DialogHeader>

        <div className="space-y-2 text-sm">
          <div><strong>Name:</strong> {vehicleType.name}</div>
          <div><strong>Rate/Km:</strong> {vehicleType.estimatedRatePerKm}</div>
          <div><strong>Base Fare:</strong> {vehicleType.baseFare}</div>
          <div><strong>Seating:</strong> {vehicleType.seatingCapacity}</div>

          {imgs.length > 0 && (
            <div className="mt-2 space-y-2">
              <strong>Images:</strong>
              <div className="flex gap-2 flex-wrap">
                {imgs.map((im: any, idx: number) => (
                  <img key={idx} src={im.url} alt={im.alt || 'image'} className="h-24 w-32 rounded border object-cover" />
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
}
