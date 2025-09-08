// src/components/vendors/driver-cost/DriverCostFormModal.tsx
'use client';
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getVehicleTypes, type VehicleTypeDTO } from '@/services/vehicleTypes';
import { createDriverCost } from '../services/vendorPricing';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function DriverCostFormModal({
  vendorId,
  onClose,
}: {
  vendorId: number | string;
  onClose: (created?: boolean) => void;
}) {
  const { toast } = useToast();
  const [vehicleTypes, setVehicleTypes] = useState<VehicleTypeDTO[]>([]);
  const [vehicleTypeId, setVehicleTypeId] = useState<string>('');
  const [driverBhatta, setDriverBhatta] = useState<string>('0');
  const [foodCost, setFoodCost] = useState<string>('0');
  const [accomodationCost, setAccomodationCost] = useState<string>('0');
  const [extraCost, setExtraCost] = useState<string>('0');
  const [morningChargesPerHour, setMorning] = useState<string>('0');
  const [eveningChargesPerHour, setEvening] = useState<string>('0');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getVehicleTypes().then(setVehicleTypes).catch(() => {
      toast({ title: 'Failed to load vehicle types', variant: 'destructive' });
    });
  }, []);

  const save = async () => {
    if (!vehicleTypeId) {
      toast({ title: 'Choose a Vehicle Type', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      await createDriverCost({
        vendorId,
        vehicleTypeId: Number(vehicleTypeId),
        driverBhatta: Number(driverBhatta || 0),
        foodCost: Number(foodCost || 0),
        accomodationCost: Number(accomodationCost || 0),
        extraCost: Number(extraCost || 0),
        morningChargesPerHour: Number(morningChargesPerHour || 0),
        eveningChargesPerHour: Number(eveningChargesPerHour || 0),
      });
      toast({ title: 'Saved' });
      onClose(true);
    } catch (e) {
      console.error(e);
      toast({ title: 'Save failed', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[680px]">
        <DialogHeader>
          <DialogTitle>Vehicle Type – Driver Cost</DialogTitle>
          <DialogDescription>Fill costs for the selected vehicle type.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label>Vehicle type</Label>
            <Select value={vehicleTypeId} onValueChange={(v) => setVehicleTypeId(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Choose any one" />
              </SelectTrigger>
              <SelectContent>
                {vehicleTypes.map((vt) => (
                  <SelectItem key={vt.id} value={String(vt.id)}>
                    {vt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Driver Bhatta (₹)</Label>
            <Input value={driverBhatta} onChange={(e) => setDriverBhatta(e.target.value)} />
          </div>
          <div>
            <Label>Food Cost (₹)</Label>
            <Input value={foodCost} onChange={(e) => setFoodCost(e.target.value)} />
          </div>
          <div>
            <Label>Accomodation Cost (₹)</Label>
            <Input value={accomodationCost} onChange={(e) => setAccomodationCost(e.target.value)} />
          </div>
          <div>
            <Label>Extra Cost (₹)</Label>
            <Input value={extraCost} onChange={(e) => setExtraCost(e.target.value)} />
          </div>
          <div>
            <Label>Early Morning Charges / hr (₹)</Label>
            <Input value={morningChargesPerHour} onChange={(e) => setMorning(e.target.value)} />
          </div>
          <div>
            <Label>Evening Charges / hr (₹)</Label>
            <Input value={eveningChargesPerHour} onChange={(e) => setEvening(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onClose()} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving} className="bg-gray-900 hover:bg-gray-800">
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
