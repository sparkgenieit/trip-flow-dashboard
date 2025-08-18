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
import { createVehicleType, updateVehicleType } from '@/services/vehicleTypes';

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

  // Support backends that store image as a plain string path (recommended)
  // or older shapes like { url } / { dataUrl } / string[]
  const initialImageSrc = useMemo(() => {
    const img: any = Array.isArray(vehicleType?.image)
      ? vehicleType?.image?.[0]
      : (vehicleType?.image as any);

    if (!img) return '';
    if (typeof img === 'string') return img;                // e.g. "uploads/vehicle-types/xyz.jpg" or full URL
    if (typeof img === 'object') return img.url || img.dataUrl || '';
    return '';
  }, [vehicleType?.image]);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(initialImageSrc);

  // revoke object URLs on unmount or change
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
      setPreview(old => {
        if (old?.startsWith('blob:')) URL.revokeObjectURL(old);
        return url;
      });
    } else {
      setPreview('');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Build multipart form-data for inline upload
    const fd = new FormData();
    fd.append('name', name.trim());
    fd.append('estimatedRatePerKm', String(Number(estimatedRatePerKm)));
    fd.append('baseFare', String(Number(baseFare)));
    fd.append('seatingCapacity', String(Number(seatingCapacity)));

    // If user picked a new file, send it. Else:
    // - on UPDATE: omit 'image' so backend keeps existing value
    // - on CREATE: optionally allow using an existing URL/path if present (rare)
    if (file) {
      fd.append('image', file); // field name must be "image"
    } else if (!isEditing && initialImageSrc) {
      // only for create when you already have a URL/path to keep
      fd.append('image', initialImageSrc);
    }

    try {
      if (isEditing && vehicleType?.id) {
        await updateVehicleType(vehicleType.id, fd); // must support FormData
        toast({ title: 'Updated', description: 'Vehicle type updated.' });
      } else {
        await createVehicleType(fd); // must support FormData
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

          {/* ---- Single image input ---- */}
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
