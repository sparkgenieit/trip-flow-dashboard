import React, { useState, useEffect } from 'react';
import { createVehicle } from '@/services/vehicles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

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

interface Vendor {
  id: string;
  companyName: string;
}

interface VehicleFormProps {
  vehicle?: Vehicle;
  onClose: () => void;
}

const VehicleForm: React.FC<VehicleFormProps> = ({ vehicle, onClose }) => {
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    type: '',
    comfortLevel: '',
    ratePerKm: '',
    status: 'available',
    vendorId: '',
    lastServicedDate: '',
  });

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchVendors();

    if (vehicle) {
      setFormData({
        vehicleNumber: vehicle.registrationNumber || '',
        type: vehicle.model || '',
        comfortLevel: vehicle.comfortLevel?.toString() || '',
        ratePerKm: vehicle.price?.toString() || '',
        status: vehicle.status || 'available',
        vendorId: vehicle.vendorId?.toString() || '',
        lastServicedDate: vehicle.lastServicedDate?.split('T')[0] || '',
      });
    }
  }, [vehicle]);

  const fetchVendors = async () => {
    try {
      // Replace this with real API call if needed
      setVendors([
        { id: '1', companyName: 'City Taxi Corp' },
        { id: '2', companyName: 'Metro Transport' },
        { id: '3', companyName: 'Quick Rides' },
      ]);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: formData.vehicleNumber,
        model: formData.type,
        image: '',
        capacity: 4,
        registrationNumber: formData.vehicleNumber,
        price: parseFloat(formData.ratePerKm),
        originalPrice: parseFloat(formData.ratePerKm),
        comfortLevel: parseInt(formData.comfortLevel),
        status: formData.status,
        lastServicedDate: formData.lastServicedDate || undefined,
        vehicleTypeId: 1,
        vendorId:
          formData.vendorId && formData.vendorId !== 'independent'
            ? parseInt(formData.vendorId)
            : null,
      };

      await createVehicle(payload);

      toast({
        title: 'Success',
        description: vehicle ? 'Vehicle updated successfully' : 'Vehicle created successfully',
      });

      onClose();
    } catch (error) {
      console.error('Error saving vehicle:', error);
      toast({
        title: 'Error',
        description: 'Failed to save vehicle',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</DialogTitle>
          <DialogDescription>
            {vehicle ? 'Update vehicle information' : 'Enter details for the new vehicle'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vehicleNumber">Vehicle Number</Label>
            <Input
              id="vehicleNumber"
              value={formData.vehicleNumber}
              onChange={(e) =>
                setFormData({ ...formData, vehicleNumber: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Vehicle Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select vehicle type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SUV">SUV</SelectItem>
                <SelectItem value="hatchback">Hatchback</SelectItem>
                <SelectItem value="sedan">Sedan</SelectItem>
                <SelectItem value="XUV">XUV</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comfortLevel">Comfort Level (1–5)</Label>
            <Input
              id="comfortLevel"
              type="number"
              min="1"
              max="5"
              value={formData.comfortLevel}
              onChange={(e) =>
                setFormData({ ...formData, comfortLevel: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ratePerKm">Rate per KM</Label>
            <Input
              id="ratePerKm"
              type="number"
              step="0.01"
              value={formData.ratePerKm}
              onChange={(e) =>
                setFormData({ ...formData, ratePerKm: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="out_of_service">Out of Service</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendorId">Vendor</Label>
            <Select
              value={formData.vendorId}
              onValueChange={(value) =>
                setFormData({ ...formData, vendorId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select vendor (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="independent">Independent</SelectItem>
                {vendors.map((vendor) => (
                  <SelectItem key={vendor.id} value={vendor.id}>
                    {vendor.companyName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastServicedDate">Last Serviced Date</Label>
            <Input
              id="lastServicedDate"
              type="date"
              value={formData.lastServicedDate}
              onChange={(e) =>
                setFormData({ ...formData, lastServicedDate: e.target.value })
              }
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : vehicle ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default VehicleForm;
