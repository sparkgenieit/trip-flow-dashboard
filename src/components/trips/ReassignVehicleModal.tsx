// src/components/trips/ReassignVehicleModal.tsx
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getAvailableVehicles, assignVehicleToTrip } from '@/services/vehicles';
import { useToast } from '@/hooks/use-toast';

interface Vehicle {
  id: number;
  name: string;
  model: string;
  registrationNumber: string;
}

interface Props {
  tripId: number;
  vehicleTypeId: number;
  open: boolean;
  onClose: () => void;
  onAssigned: () => void;
}

const ReassignVehicleModal: React.FC<Props> = ({
  tripId,
  vehicleTypeId,
  open,
  onClose,
  onAssigned,
}) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      getAvailableVehicles(vehicleTypeId).then(setVehicles);
      setSelectedVehicleId(null);
      setSearchTerm('');
    }
  }, [open, vehicleTypeId]);

  const filteredVehicles = vehicles.filter((v) =>
    `${v.registrationNumber} ${v.name} ${v.model}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleAssign = async () => {
    if (!selectedVehicleId) {
      toast({ title: 'Please select a vehicle', variant: 'destructive' });
      return;
    }
    try {
      await assignVehicleToTrip(tripId, selectedVehicleId);
      toast({ title: 'Vehicle reassigned successfully!' });
      onAssigned();
      onClose();
    } catch {
      toast({ title: 'Failed to assign vehicle', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reassign Vehicle</DialogTitle>
        </DialogHeader>

        <Input
          placeholder="Search vehicle"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="max-h-48 overflow-y-auto mt-2 space-y-2">
          {filteredVehicles.map((v) => (
            <div
              key={v.id}
              className={`p-2 border rounded cursor-pointer ${selectedVehicleId === v.id
                ? 'bg-primary/10 border-primary'
                : 'hover:bg-gray-100'
              }`}
              onClick={() => setSelectedVehicleId(v.id)}
            >
              🚗 {v.registrationNumber} – {v.name} – {v.model}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAssign}>Assign</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReassignVehicleModal;
