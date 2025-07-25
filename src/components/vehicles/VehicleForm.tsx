import React, { useState, useEffect } from 'react';
import { createVehicle, updateVehicle } from '@/services/vehicles';
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
import { fetchAllVendors } from '@/services/vendor';

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
  vendor?: Vendor; // ✅ Add this line
}

interface Vendor {
  id: number;
  name: string;
  companyReg: string;
  userId: number;
}

interface VehicleFormProps {
  vehicle?: Vehicle;
  onClose: () => void;
}

const VehicleForm: React.FC<VehicleFormProps> = ({ vehicle, onClose }) => {
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    typeId: '',
    type: '',
    comfortLevel: '',
    ratePerKm: '',
    status: 'available',
    vendorId: '',
    lastServicedDate: '',
  });
  const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const role = localStorage.getItem('userRole');
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
  const isVendor =  role === 'VENDOR';

  useEffect(() => {
    if (isAdmin) {
      fetchVendors();
    }

if (vehicle) {
  setFormData({
    vehicleNumber: vehicle.registrationNumber ?? '',
    typeId: String(vehicle.vehicleTypeId || ''),
    type: vehicle.model ?? '',
    comfortLevel: vehicle.comfortLevel?.toString() ?? '',
    ratePerKm: vehicle.price?.toString() ?? '',
    status: vehicle.status ?? 'available',
    vendorId: (
      vehicle.vendorId ??
      vehicle.vendor?.id ??
      ''
    ).toString(),
    lastServicedDate: vehicle.lastServicedDate
      ? vehicle.lastServicedDate.split('T')[0]
      : '',
  });
}
  }, [vehicle]);

 const fetchVendors = async () => {
  try {
    const res = await fetchAllVendors(); // real API call
    setVendors(res || []);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    toast({
      title: 'Error',
      description: 'Failed to load vendors',
      variant: 'destructive',
    });
  }
};

const token = localStorage.getItem("authToken");
fetch(`${import.meta.env.VITE_API_BASE_URL}/vehicle-types`, {
  headers: {
    Authorization: token ? `Bearer ${token}` : '',
  },
})
  .then((res) => res.json())
  .then(setVehicleTypes)
  .catch((err) => console.error("Failed to fetch vehicle types", err));


const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
   const formDataToSend = new FormData();
  formDataToSend.append('name', formData.vehicleNumber);
  formDataToSend.append('model', formData.type);
  formDataToSend.append('registrationNumber', formData.vehicleNumber);
  formDataToSend.append('capacity', String(4));
  formDataToSend.append('price', String(formData.ratePerKm));
  formDataToSend.append('originalPrice', String(formData.ratePerKm));
  formDataToSend.append('comfortLevel', String(formData.comfortLevel));
  formDataToSend.append('status', String(formData.status));
  formDataToSend.append('lastServicedDate', formData.lastServicedDate || '');
  formDataToSend.append('vehicleTypeId', String(formData.typeId)); // ✅ DYNAMIC

if (isAdmin && formData.vendorId) {
  formDataToSend.append('vendorId', String(formData.vendorId));
}

// ✅ PLACE THIS HERE
imageFiles.forEach((file) => {
  formDataToSend.append('images', file);
});

    if (vehicle?.id) {
      await updateVehicle(vehicle.id, formDataToSend);
    } else {
      await createVehicle(formDataToSend);
    }

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
      <DialogContent className="sm:max-w-[600px] px-6 py-4 overflow-visible">
        <DialogHeader>
          <DialogTitle>{vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</DialogTitle>
          <DialogDescription>
            {vehicle ? 'Update vehicle information' : 'Enter details for the new vehicle'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto pr-2 space-y-4">
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
  <Label>Vehicle Type</Label>
  <Select
    value={formData.typeId}
    onValueChange={(value) => setFormData({ ...formData, typeId: value })}
  >
    <SelectTrigger>
      <SelectValue placeholder="Select vehicle type" />
    </SelectTrigger>
    <SelectContent>
      {vehicleTypes.map((type) => (
        <SelectItem key={type.id} value={String(type.id)}>
          {type.name}
        </SelectItem>
      ))}
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
            <Label htmlFor="images">Vehicle Images</Label>
            <Input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setImageFiles(files);
                setImagePreviews(files.map(file => URL.createObjectURL(file)));
              }}
            />
            {imagePreviews.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {imagePreviews.map((src, idx) => (
                  <img
                    key={idx}
                    src={src}
                    alt={`preview-${idx}`}
                    className="w-24 h-24 object-cover border rounded"
                  />
                ))}
              </div>
            )}
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

          {isAdmin && (
            <div className="space-y-2">
              <Label htmlFor="vendorId">Vendor</Label>
              <Select
                value={formData.vendorId}
                onValueChange={(value) =>
                  setFormData({ ...formData, vendorId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id.toString()}>
                      {vendor.companyReg}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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