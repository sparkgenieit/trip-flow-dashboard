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
  // images
  image: string | string[];
  additional_images?: string[] | any;

  // identifiers
  registrationNumber: string;
  chassisNumber?: string | null;

  status: string; // 'available' | 'maintenance' | 'out_of_service'
  createdBy?: 'ADMIN' | 'VENDOR' | 'SUPER_ADMIN';

  // dates & maintenance
  lastServicedDate?: string; // ISO
  vehicleExpiryDate?: string; // ISO

  // pricing removed from schema (kept optional to read if backend hydrates)
  price?: number;

  // misc charges
  extraKmCharge?: number | null;
  earlyMorningCharges?: number | null;
  eveningCharges?: number | null;
  videoUrl?: string | null;

  // insurance
  insurancePolicyNumber?: string;
  insuranceStartDate?: string; // ISO
  insuranceEndDate?: string; // ISO
  insuranceContactNumber?: string;
  rtoCode?: string;

  // relations
  vehicleTypeId: number;
  vendorId: number | null;
  vendor?: Vendor;
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
    vehicleNumber: '', // UI field; sent as registrationNumber
    typeId: '', // vehicleTypeId
    status: 'available',
    vendorId: '',
    lastServicedDate: '',

    // NEW schema fields
    chassisNumber: '',
    vehicleExpiryDate: '',
    extraKmCharge: '',
    earlyMorningCharges: '',
    eveningCharges: '',
    videoUrl: '',

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

  const setSingleImageFile = (file: File | null) => {
    // Revoke any existing preview blob URLs
    setImagePreviews((old) => {
      old.forEach((u) => u.startsWith('blob:') && URL.revokeObjectURL(u));
      return [];
    });

    if (file) {
      const url = URL.createObjectURL(file);
      setImageFiles([file]);
      setImagePreviews([url]);
    } else {
      setImageFiles([]);
      setImagePreviews([]);
    }
  };

  const handlePickSingleImage: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0] ?? null;
    setSingleImageFile(file);
  };

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'vehicle' | 'insurance'>('vehicle');
  const { toast } = useToast();

  const role = localStorage.getItem('userRole');
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
  const isVendor = role === 'VENDOR';

  useEffect(() => {
    if (isAdmin) {
      fetchVendors();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!vehicle || vehicleTypes.length === 0) return;

    setFormData({
      vehicleNumber: vehicle.registrationNumber ?? '',
      typeId: String(vehicle.vehicleTypeId || ''),
      status: vehicle.status ?? 'available',
      vendorId: (vehicle.vendorId ?? vehicle.vendor?.id ?? '').toString(),
      lastServicedDate: vehicle.lastServicedDate
        ? String(vehicle.lastServicedDate).split('T')[0]
        : '',

      // NEW fields
      chassisNumber: (vehicle.chassisNumber ?? '') as string,
      vehicleExpiryDate: vehicle.vehicleExpiryDate
        ? String(vehicle.vehicleExpiryDate).split('T')[0]
        : '',
      extraKmCharge:
        vehicle.extraKmCharge != null ? String(vehicle.extraKmCharge) : '',
      earlyMorningCharges:
        vehicle.earlyMorningCharges != null
          ? String(vehicle.earlyMorningCharges)
          : '',
      eveningCharges:
        vehicle.eveningCharges != null ? String(vehicle.eveningCharges) : '',
      videoUrl: vehicle.videoUrl ?? '',

      // Insurance
      insurancePolicyNumber: vehicle.insurancePolicyNumber ?? '',
      insuranceStartDate: vehicle.insuranceStartDate
        ? String(vehicle.insuranceStartDate).split('T')[0]
        : '',
      insuranceEndDate: vehicle.insuranceEndDate
        ? String(vehicle.insuranceEndDate).split('T')[0]
        : '',
      insuranceContactNumber: vehicle.insuranceContactNumber ?? '',
      rtoCode: vehicle.rtoCode ?? '',
    });
    // Do NOT pre-fill imagePreviews with existing images; those are shown separately.
  }, [vehicle, vehicleTypes]);

  useEffect(() => {
    const fetchVehicleTypes = async () => {
      const token = localStorage.getItem('authToken');
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/vehicle-types`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : '',
            },
          }
        );
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

  // Revoke blob URLs on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach(
        (u) => u.startsWith('blob:') && URL.revokeObjectURL(u)
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();

      // ── Core Vehicle fields (schema-aligned)
      formDataToSend.append('registrationNumber', formData.vehicleNumber);
      formDataToSend.append('status', String(formData.status));
      if (formData.lastServicedDate) {
        formDataToSend.append('lastServicedDate', formData.lastServicedDate);
      }
      formDataToSend.append('vehicleTypeId', String(formData.typeId || ''));

      // NEW: prisma fields (optional)
      if (formData.chassisNumber)
        formDataToSend.append('chassisNumber', formData.chassisNumber);
      if (formData.vehicleExpiryDate)
        formDataToSend.append('vehicleExpiryDate', formData.vehicleExpiryDate);
      if (formData.extraKmCharge !== '')
        formDataToSend.append('extraKmCharge', String(formData.extraKmCharge));
      if (formData.earlyMorningCharges !== '')
        formDataToSend.append(
          'earlyMorningCharges',
          String(formData.earlyMorningCharges)
        );
      if (formData.eveningCharges !== '')
        formDataToSend.append(
          'eveningCharges',
          String(formData.eveningCharges)
        );
      if (formData.videoUrl)
        formDataToSend.append('videoUrl', formData.videoUrl);

      // Vendor
      if (isAdmin && formData.vendorId) {
        formDataToSend.append('vendorId', String(formData.vendorId));
      }

      // Insurance & FC
      if (formData.insurancePolicyNumber)
        formDataToSend.append(
          'insurancePolicyNumber',
          formData.insurancePolicyNumber
        );
      if (formData.insuranceStartDate)
        formDataToSend.append(
          'insuranceStartDate',
          formData.insuranceStartDate
        );
      if (formData.insuranceEndDate)
        formDataToSend.append('insuranceEndDate', formData.insuranceEndDate);
      if (formData.insuranceContactNumber)
        formDataToSend.append(
          'insuranceContactNumber',
          formData.insuranceContactNumber
        );
      if (formData.rtoCode) formDataToSend.append('rtoCode', formData.rtoCode);

      // Image (schema: single 'image' string + optional additional_images JSON)
      if (imageFiles[0]) {
        formDataToSend.append('image', imageFiles[0]);
      }

      if (vehicle?.id) {
        await updateVehicle(vehicle.id, formDataToSend);
      } else {
        await createVehicle(formDataToSend);
      }

      toast({
        title: 'Success',
        description: vehicle
          ? 'Vehicle updated successfully'
          : 'Vehicle created successfully',
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
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] px-6 py-4 overflow-visible">
        <DialogHeader>
          <DialogTitle>{vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</DialogTitle>
          <DialogDescription>
            {vehicle
              ? 'Update vehicle information'
              : 'Enter details for the new vehicle'}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="max-h-[70vh] overflow-y-auto pr-2 space-y-4"
        >
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as 'vehicle' | 'insurance')}
            className="w-full"
          >
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
                  onValueChange={(value) =>
                    setFormData({ ...formData, typeId: value })
                  }
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
                <Label htmlFor="chassisNumber">Chassis Number</Label>
                <Input
                  id="chassisNumber"
                  value={formData.chassisNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, chassisNumber: e.target.value })
                  }
                />
              </div>

              {/* Vehicle Image (single, replace-on-select) */}
              <div className="space-y-2">
                <Label htmlFor="image">Vehicle Image</Label>

                {/* Single picker: choosing a new file replaces current preview */}
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handlePickSingleImage}
                />

                {/* If a new image is picked, show ONLY that preview */}
                {imagePreviews.length > 0 ? (
                  <div className="mt-2">
                    <div className="text-sm font-semibold mb-1">Preview</div>
                    <div className="relative inline-block">
                      <img
                        src={imagePreviews[0]}
                        alt="preview"
                        className="w-24 h-24 object-cover border rounded"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display =
                            'none';
                        }}
                      />
                      <button
                        type="button"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full border bg-white text-sm leading-6 shadow hover:bg-gray-50"
                        title="Remove"
                        onClick={() => setSingleImageFile(null)}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ) : (
                  // Otherwise show the current server image (first one), if any
                  existingImageUrls.length > 0 && (
                    <div className="mt-2">
                      <div className="text-sm font-semibold mb-1">Current</div>
                      <img
                        src={existingImageUrls[0]}
                        alt="current"
                        className="w-24 h-24 object-cover border rounded"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display =
                            'none';
                        }}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Choose a file above to replace the current image.
                      </p>
                    </div>
                  )
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
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
                    setFormData({
                      ...formData,
                      lastServicedDate: e.target.value,
                    })
                  }
                />
              </div>

              {/* NEW: Vehicle Expiry Date */}
              <div className="space-y-2">
                <Label htmlFor="vehicleExpiryDate">Vehicle Expiry Date</Label>
                <Input
                  id="vehicleExpiryDate"
                  type="date"
                  value={formData.vehicleExpiryDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vehicleExpiryDate: e.target.value,
                    })
                  }
                />
              </div>

              {/* NEW: Charges */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="extraKmCharge">Extra KM Charge</Label>
                  <Input
                    id="extraKmCharge"
                    type="number"
                    step="0.01"
                    value={formData.extraKmCharge}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        extraKmCharge: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="earlyMorningCharges">Early Morning Charges</Label>
                  <Input
                    id="earlyMorningCharges"
                    type="number"
                    step="0.01"
                    value={formData.earlyMorningCharges}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        earlyMorningCharges: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eveningCharges">Evening Charges</Label>
                  <Input
                    id="eveningCharges"
                    type="number"
                    step="0.01"
                    value={formData.eveningCharges}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        eveningCharges: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* NEW: Video URL */}
              <div className="space-y-2">
                <Label htmlFor="videoUrl">Video URL</Label>
                <Input
                  id="videoUrl"
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, videoUrl: e.target.value })
                  }
                  placeholder="https://…"
                />
              </div>
            </TabsContent>

            {/* ---------------- INSURANCE & FC TAB ---------------- */}
            <TabsContent value="insurance" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="insurancePolicyNumber">
                    Insurance Policy Number *
                  </Label>
                  <Input
                    id="insurancePolicyNumber"
                    value={formData.insurancePolicyNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        insurancePolicyNumber: e.target.value,
                      })
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
                      setFormData({
                        ...formData,
                        insuranceStartDate: e.target.value,
                      })
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
                      setFormData({
                        ...formData,
                        insuranceEndDate: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="insuranceContactNumber">
                    Insurance Contact Number *
                  </Label>
                  <Input
                    id="insuranceContactNumber"
                    value={formData.insuranceContactNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        insuranceContactNumber: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="rtoCode">RTO Code *</Label>
                  <Input
                    id="rtoCode"
                    value={formData.rtoCode}
                    onChange={(e) =>
                      setFormData({ ...formData, rtoCode: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex items-center justify-between">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>

            {activeTab === 'insurance' ? (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setActiveTab('vehicle')}
                >
                  ← Back
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : vehicle ? 'Update' : 'Create'}
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                disabled={loading}
                onClick={() => setActiveTab('insurance')}
              >
                Next
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default VehicleForm;
