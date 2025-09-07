// src/components/vehicles/VehicleForm.tsx
// src/components/vehicles/VehicleForm.tsx
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { fetchAllVendors } from '@/services/vendor';

interface Vendor {
  id: number;
  name: string;
  companyReg: string;
  userId: number;
}

interface Vehicle {
  id: number;
  name: string;
  model: string;
  image: string | string[];
  capacity: number;
  registrationNumber: string;
  price: number;
  originalPrice: number;
  status: string;
  comfortLevel: number;
  lastServicedDate: string;
  vehicleTypeId: number;
  vendorId: number | null;
  vendor?: Vendor;

  // Optional insurance fields if backend already provides them
  insurancePolicyNumber?: string;
  insuranceStartDate?: string; // ISO
  insuranceEndDate?: string;   // ISO
  insuranceContactNumber?: string;
  rtoCode?: string;
}

interface VehicleFormProps {
  vehicle?: Vehicle;
  onClose: () => void;
}

const API_BASE =
  (import.meta as any).env?.VITE_API_BASE_URL?.replace(/\/$/, '') || '';

const toSrc = (p: string) =>
  /^https?:\/\//i.test(p)
    ? p
    : `${API_BASE}/${String(p).replace(/\\/g, '/').replace(/^\/+/, '')}`;

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

    // --- Insurance & FC ---
    insurancePolicyNumber: '',
    insuranceStartDate: '',
    insuranceEndDate: '',
    insuranceContactNumber: '',
    rtoCode: '',
  });
  const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);

  // New files picked now
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]); // only for newly selected files

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const role = localStorage.getItem('userRole');
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
  const isVendor = role === 'VENDOR';

  useEffect(() => {
    if (isAdmin) {
      fetchVendors();
    }
  }, [isAdmin]);

  // REPLACE the whole useEffect that depends on [vehicle, vehicleTypes]
// (keep the effect that fetches vehicle types as-is)

useEffect(() => {
  if (!vehicle || vehicleTypes.length === 0) return;

  setFormData({
    vehicleNumber: vehicle.registrationNumber ?? '',
    typeId: String(vehicle.vehicleTypeId || ''),
    type: vehicle.model ?? '',
    comfortLevel: vehicle.comfortLevel?.toString() ?? '',
    ratePerKm: vehicle.price?.toString() ?? '',
    status: vehicle.status ?? 'available',
    vendorId: (vehicle.vendorId ?? vehicle.vendor?.id ?? '').toString(),
    lastServicedDate: vehicle.lastServicedDate
      ? vehicle.lastServicedDate.split('T')[0]
      : '',

    // --- Insurance & FC (gracefully handle missing fields) ---
    insurancePolicyNumber: vehicle.insurancePolicyNumber ?? '',
    insuranceStartDate: vehicle.insuranceStartDate
      ? vehicle.insuranceStartDate.split('T')[0]
      : '',
    insuranceEndDate: vehicle.insuranceEndDate
      ? vehicle.insuranceEndDate.split('T')[0]
      : '',
    insuranceContactNumber: vehicle.insuranceContactNumber ?? '',
    rtoCode: vehicle.rtoCode ?? '',
  });
  // Do NOT pre-fill imagePreviews with existing images; those are shown separately below.
}, [vehicle, vehicleTypes]);


  useEffect(() => {
    const fetchVehicleTypes = async () => {
      const token = localStorage.getItem('authToken');
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/vehicle-types`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        });
        const data = await res.json();
        setVehicleTypes(data);
      } catch (err) {
        console.error('Failed to fetch vehicle types', err);
      }
    };

    fetchVehicleTypes();
  }, []);

  const fetchVendors = async () => {
    try {
      const res = await fetchAllVendors();
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

  // Existing images from server (string or string[])
  const existingImageUrls = React.useMemo(() => {
    const imgs = Array.isArray(vehicle?.image)
      ? vehicle?.image
      : vehicle?.image
      ? [vehicle.image]
      : [];
    return imgs.map(toSrc);
  }, [vehicle]);

  // Revoke blob URLs on unmount/change
  useEffect(() => {
    return () => {
      imagePreviews.forEach((u) => u.startsWith('blob:') && URL.revokeObjectURL(u));
    };
  }, [imagePreviews]);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.vehicleNumber);
    formDataToSend.append('model', formData.type);
    formDataToSend.append('registrationNumber', formData.vehicleNumber);
    formDataToSend.append('capacity', String(4));
    formDataToSend.append('comfortLevel', String(formData.comfortLevel));
    formDataToSend.append('status', String(formData.status));
    if (formData.lastServicedDate) {
      formDataToSend.append('lastServicedDate', formData.lastServicedDate);
    }
    formDataToSend.append('vehicleTypeId', String(formData.typeId));

    if (isAdmin && formData.vendorId) {
      formDataToSend.append('vendorId', String(formData.vendorId));
    }

    // Pricing (server maps priceSpec -> price/originalPrice)
    const priceInt = Math.trunc(Number(formData.ratePerKm || 0));
    const originalPriceInt = Math.trunc(Number(formData.ratePerKm || 0));
    formDataToSend.append('priceSpec[priceType]', 'BASE');
    formDataToSend.append('priceSpec[price]', String(priceInt));
    formDataToSend.append('priceSpec[originalPrice]', String(originalPriceInt));
    formDataToSend.append('priceSpec[currency]', 'INR');

    // --- Insurance & FC (safe to include; backend can ignore if not used) ---
    if (formData.insurancePolicyNumber)
      formDataToSend.append('insurancePolicyNumber', formData.insurancePolicyNumber);
    if (formData.insuranceStartDate)
      formDataToSend.append('insuranceStartDate', formData.insuranceStartDate);
    if (formData.insuranceEndDate)
      formDataToSend.append('insuranceEndDate', formData.insuranceEndDate);
    if (formData.insuranceContactNumber)
      formDataToSend.append('insuranceContactNumber', formData.insuranceContactNumber);
    if (formData.rtoCode)
      formDataToSend.append('rtoCode', formData.rtoCode);

    // Attach newly selected images
    imageFiles.forEach((file) => formDataToSend.append('images', file));

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
  } catch (error: any) {
    console.error('Error saving vehicle:', error);
    const message =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to save vehicle';
    toast({
      title: 'Error',
      description: message,
      variant: 'destructive',
    });
  } finally {
    setLoading(false);
  }};

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
          <Tabs defaultValue="vehicle" className="w-full">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="vehicle">Vehicle</TabsTrigger>
              <TabsTrigger value="insurance">Insurance &amp; FC</TabsTrigger>
            </TabsList>

            {/* ---------------- VEHICLE TAB ---------------- */}
            <TabsContent value="vehicle" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vehicleNumber">Vehicle Number</Label>
                <Input
                  id="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, comfortLevel: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, ratePerKm: e.target.value })}
                  required
                />
              </div>

              {/* Vehicle Images */}
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
                    setImagePreviews((old) => {
                      old.forEach((u) => u.startsWith('blob:') && URL.revokeObjectURL(u));
                      return files.map((file) => URL.createObjectURL(file));
                    });
                  }}
                />

                {/* Existing images from server */}
                {existingImageUrls.length > 0 && (
                  <div className="mt-2">
                    <div className="text-sm font-semibold mb-1">Existing</div>
                    <div className="flex flex-wrap gap-2">
                      {existingImageUrls.map((src, idx) => (
                        <img
                          key={`exist-${idx}`}
                          src={src}
                          alt={`existing-${idx}`}
                          className="w-24 h-24 object-cover border rounded"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* New previews picked now */}
                {imagePreviews.length > 0 && (
                  <div className="mt-2">
                    <div className="text-sm font-semibold mb-1">Preview</div>
                    <div className="flex flex-wrap gap-2">
                      {imagePreviews.map((src, idx) => (
                        <img
                          key={`new-${idx}`}
                          src={src}
                          alt={`new-${idx}`}
                          className="w-24 h-24 object-cover border rounded"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ))}
                    </div>
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
                    onValueChange={(value) => setFormData({ ...formData, vendorId: value })}
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
                  onChange={(e) => setFormData({ ...formData, lastServicedDate: e.target.value })}
                />
              </div>
            </TabsContent>

            {/* ---------------- INSURANCE & FC TAB ---------------- */}
            <TabsContent value="insurance" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="insurancePolicyNumber">Insurance Policy Number *</Label>
                  <Input
                    id="insurancePolicyNumber"
                    value={formData.insurancePolicyNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, insurancePolicyNumber: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="insuranceStartDate">Insurance Start Date *</Label>
                  <Input
                    id="insuranceStartDate"
                    type="date"
                    value={formData.insuranceStartDate}
                    onChange={(e) =>
                      setFormData({ ...formData, insuranceStartDate: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="insuranceEndDate">Insurance End Date *</Label>
                  <Input
                    id="insuranceEndDate"
                    type="date"
                    value={formData.insuranceEndDate}
                    onChange={(e) =>
                      setFormData({ ...formData, insuranceEndDate: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="insuranceContactNumber">Insurance Contact Number *</Label>
                  <Input
                    id="insuranceContactNumber"
                    value={formData.insuranceContactNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, insuranceContactNumber: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="rtoCode">RTO Code *</Label>
                  <Input
                    id="rtoCode"
                    value={formData.rtoCode}
                    onChange={(e) => setFormData({ ...formData, rtoCode: e.target.value })}
                    required
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

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
