// src/components/vehicle-types/VehicleTypeForm.tsx
'use client';
import React, { useEffect, useMemo, useState } from 'react';
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
import type { VehicleTypeDTO } from '@/services/vehicleTypes';
import { createVehicleType, updateVehicleType, uploadVehicleTypeImage  } from '@/services/vehicleTypes';

interface Props {
  vehicleType?: VehicleTypeDTO | null;
  onClose: () => void;
}

export default function VehicleTypeForm({ vehicleType, onClose }: Props) {
  const isEditing = Boolean(vehicleType?.id);
  const { toast } = useToast();

  const [name, setName] = useState(vehicleType?.name ?? '');
  const [estimatedRatePerKm, setRate] = useState<number>(vehicleType?.estimatedRatePerKm ?? 10);
  const [baseFare, setBaseFare] = useState<number>(vehicleType?.baseFare ?? 0);
  const [seatingCapacity, setSeats] = useState<number>(vehicleType?.seatingCapacity ?? 4);

  // ---- Single image like Driver edit ----
  // use existing image url (or dataUrl) if present
  const initialImageSrc = useMemo(() => {
    const img = Array.isArray(vehicleType?.image)
      ? vehicleType?.image?.[0]
      : vehicleType?.image || undefined;
    return (img as any)?.url || (img as any)?.dataUrl || '';
  }, [vehicleType?.image]);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(initialImageSrc);

  // revoke object URLs on unmount
  useEffect(() => {
    return () => {
      if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setFile(f);
    if (f) {
      const url = URL.createObjectURL(f);
      setPreview((old) => {
        if (old?.startsWith('blob:')) URL.revokeObjectURL(old);
        return url;
      });
    } else {
      setPreview('');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Build payload
    const payload: Partial<VehicleTypeDTO> = {
      name: name.trim(),
      estimatedRatePerKm: Number(estimatedRatePerKm),
      baseFare: Number(baseFare),
      seatingCapacity: Number(seatingCapacity),
    };

    // If a new file is picked, store as base64 dataUrl under image.url so <img src> works.
    // If you already have an upload API (like in Driver), upload here and set { url: uploadedUrl } instead.
    if (file) {
    const { url } = await uploadVehicleTypeImage(file);
    payload.image = { url };
    } else if (initialImageSrc) {
    // keep existing URL if user didn’t change it
    payload.image = { url: initialImageSrc };
    }

    try {
      if (isEditing && vehicleType?.id) {
        await updateVehicleType(vehicleType.id, payload);
        toast({ title: 'Updated', description: 'Vehicle type updated.' });
      } else {
        await createVehicleType(payload);
        toast({ title: 'Created', description: 'Vehicle type created.' });
      }
      onClose();
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to save vehicle type.', variant: 'destructive' });
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Vehicle Type' : 'Add Vehicle Type'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update vehicle type details' : 'Create a new vehicle type'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="SUV" />
            </div>
            <div>
              <Label htmlFor="rate">Estimated Rate / Km</Label>
              <Input
                id="rate"
                type="number"
                step="0.01"
                value={estimatedRatePerKm}
                onChange={(e) => setRate(parseFloat(e.target.value || '0'))}
                min={0}
                required
              />
            </div>
            <div>
              <Label htmlFor="base">Base Fare</Label>
              <Input
                id="base"
                type="number"
                step="0.01"
                value={baseFare}
                onChange={(e) => setBaseFare(parseFloat(e.target.value || '0'))}
                min={0}
                required
              />
            </div>
            <div>
              <Label htmlFor="seats">Seating Capacity</Label>
              <Input
                id="seats"
                type="number"
                value={seatingCapacity}
                onChange={(e) => setSeats(parseInt(e.target.value || '0', 10))}
                min={1}
                required
              />
            </div>
          </div>

          {/* ---- Single image input (like Driver) ---- */}
          <div className="rounded border p-3">
            <Label className="mb-2 block">Image</Label>
            <Input type="file" accept="image/*" onChange={onFileChange} />
            <div className="mt-3 flex items-start gap-3">
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="h-24 w-32 rounded border object-cover"
                />
              ) : (
                <div className="h-24 w-32 rounded border flex items-center justify-center text-xs text-gray-500">
                  No preview
                </div>
              )}
              {preview && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFile(null);
                    setPreview('');
                  }}
                >
                  Remove
                </Button>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{isEditing ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
