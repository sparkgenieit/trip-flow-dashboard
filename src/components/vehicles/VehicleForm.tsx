import React, { useState, useEffect } from 'react';
import { createVehicle } from '@/services/vehicles'; // Adjust the path as needed
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
  vehicle_number: string;
  type: string;
  comfort_level: number;
  rate_per_km: number;
  status: string;
  vendor_id: string;
  last_serviced_date: string;
}

interface Vendor {
  id: string;
  company_name: string;
}

interface VehicleFormProps {
  vehicle?: Vehicle;
  onClose: () => void;
}

const VehicleForm: React.FC<VehicleFormProps> = ({ vehicle, onClose }) => {
  const [formData, setFormData] = useState({
    vehicle_number: '',
    type: '',
    comfort_level: '',
    rate_per_km: '',
    status: 'available',
    vendor_id: '',
    last_serviced_date: '',
  });

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchVendors();
    if (vehicle) {
      setFormData({
        vehicle_number: vehicle.vehicle_number || '',
        type: vehicle.type || '',
        comfort_level: vehicle.comfort_level?.toString() || '',
        rate_per_km: vehicle.rate_per_km?.toString() || '',
        status: vehicle.status || 'available',
        vendor_id: vehicle.vendor_id || '',
        last_serviced_date: vehicle.last_serviced_date || '',
      });
    }
  }, [vehicle]);

  const fetchVendors = async () => {
    try {
      setVendors([
        { id: 'vendor1', company_name: 'City Taxi Corp' },
        { id: 'vendor2', company_name: 'Metro Transport' },
        { id: 'vendor3', company_name: 'Quick Rides' },
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
      name: formData.vehicle_number,
      model: formData.type,
      image: '', // add image upload logic later
      capacity: 4, // if you collect this from user, replace it
      registrationNumber: formData.vehicle_number,
      price: parseFloat(formData.rate_per_km),
      originalPrice: parseFloat(formData.rate_per_km),
      comfortLevel: parseInt(formData.comfort_level),
      status: formData.status,
      lastServicedDate: formData.last_serviced_date || undefined,
      vehicleTypeId: 1, // hardcoded or dynamically mapped from `formData.type`
      vendorId: formData.vendor_id !== 'independent' ? parseInt(formData.vendor_id) : undefined,
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
            <Label htmlFor="vehicle_number">Vehicle Number</Label>
            <Input
              id="vehicle_number"
              value={formData.vehicle_number}
              onChange={(e) =>
                setFormData({ ...formData, vehicle_number: e.target.value })
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
            <Label htmlFor="comfort_level">Comfort Level (1–5)</Label>
            <Input
              id="comfort_level"
              type="number"
              min="1"
              max="5"
              value={formData.comfort_level}
              onChange={(e) =>
                setFormData({ ...formData, comfort_level: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rate_per_km">Rate per KM</Label>
            <Input
              id="rate_per_km"
              type="number"
              step="0.01"
              value={formData.rate_per_km}
              onChange={(e) =>
                setFormData({ ...formData, rate_per_km: e.target.value })
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
            <Label htmlFor="vendor_id">Vendor</Label>
            <Select
              value={formData.vendor_id}
              onValueChange={(value) =>
                setFormData({ ...formData, vendor_id: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select vendor (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="independent">Independent</SelectItem>
                {vendors.map((vendor) => (
                  <SelectItem key={vendor.id} value={vendor.id}>
                    {vendor.company_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_serviced_date">Last Serviced Date</Label>
            <Input
              id="last_serviced_date"
              type="date"
              value={formData.last_serviced_date}
              onChange={(e) =>
                setFormData({ ...formData, last_serviced_date: e.target.value })
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
