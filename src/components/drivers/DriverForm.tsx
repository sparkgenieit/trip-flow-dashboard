import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { createDriver, updateDriverMultipart  } from '@/services/drivers';
import { fetchAllVendors } from '@/services/vendor';
import { getVehicles } from '@/services/vehicles';

export interface DriverFormInput {
  id?: number;
  fullName: string;
  phone: string;
  email: string;
  licenseNumber: string;
  licenseExpiry: string;
  isPartTime: boolean;
  isAvailable: boolean;
  vendorId?: number | null;
  assignedVehicleId?: number | null;
  userId?: number;
  licenseImage?: string;
  rcImage?: string;
}


interface DriverFormProps {
  driver?: DriverFormInput;
  onClose: () => void;
}

const DriverForm: React.FC<DriverFormProps> = ({ driver, onClose }) => {
  const isVendor = localStorage.getItem('userRole') === 'VENDOR';

  const [formData, setFormData] = useState<DriverFormInput>({
  fullName: '',
  phone: '',
  email: '',
  licenseNumber: '',
  licenseExpiry: '',
  isPartTime: false,
  isAvailable: true,
  vendorId: undefined,
  assignedVehicleId: undefined,
  userId: undefined
});

  const [vendors, setVendors] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [licenseImage, setLicenseImage] = useState<File | null>(null);
  const [rcImage, setRcImage] = useState<File | null>(null);
  const [licensePreview, setLicensePreview] = useState<string | null>(null);
  const [rcPreview, setRcPreview] = useState<string | null>(null);
  const { toast } = useToast();

useEffect(() => {
  fetchVendorsAndVehicles();

  if (driver) {
    setFormData({
      fullName: driver.fullName,
      phone: driver.phone,
      email: driver.email,
      licenseNumber: driver.licenseNumber,
      licenseExpiry: driver.licenseExpiry?.split('T')[0] || '',
      isPartTime: driver.isPartTime,
      isAvailable: driver.isAvailable,
      vendorId: driver.vendorId ?? undefined,
      assignedVehicleId: driver.assignedVehicleId ?? undefined,
      userId: driver.userId ?? undefined,
      id: driver.id,
    });

    const baseURL = import.meta.env.VITE_API_BASE_URL;
    if (driver.licenseImage) {
      setLicensePreview(`${baseURL}/${driver.licenseImage}`);
    }
    if (driver.rcImage) {
      setRcPreview(`${baseURL}/${driver.rcImage}`);
    }
  }
}, [driver]);

const fetchVendorsAndVehicles = async () => {
  try {
       const vendorsRes = await fetchAllVendors(); // ✅ API call
    setVendors(vendorsRes);
    
    const vehiclesRes = await getVehicles();
    setVehicles(vehiclesRes);
  } catch (error) {
    console.error('Error fetching vendors/vehicles:', error);
  }
};

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

    const fd = new FormData();
    fd.append('fullName', formData.fullName);
    fd.append('phone', formData.phone);
    fd.append('email', formData.email);
    fd.append('licenseNumber', formData.licenseNumber);
    fd.append('licenseExpiry', formData.licenseExpiry);
    fd.append('isPartTime', String(formData.isPartTime));
    fd.append('isAvailable', String(formData.isAvailable));

    if (formData.vendorId) fd.append('vendorId', String(formData.vendorId));
    if (formData.assignedVehicleId) fd.append('vehicleId', String(formData.assignedVehicleId));
    if (formData.userId) fd.append('userId', String(formData.userId));
    if (licenseImage) fd.append('licenseImage', licenseImage);
    if (rcImage) fd.append('rcImage', rcImage);
  try {
    if (driver && driver.id) {
      await updateDriverMultipart(driver.id, fd);
      toast({ title: 'Success', description: 'Driver updated successfully' });
    } else {
      await createDriver(fd);
      toast({ title: 'Success', description: 'Driver created successfully' });
    }
    onClose();
  } catch (error) {
    console.error('Save error:', error);
    toast({
      title: 'Error',
      description: 'Failed to save driver',
      variant: 'destructive',
    });
  } finally {
    setLoading(false);
  }
};

    const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (file: File | null) => void,
    previewSetter: (url: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setter(file);
      previewSetter(URL.createObjectURL(file));
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{driver ? 'Edit Driver' : 'Add New Driver'}</DialogTitle>
          <DialogDescription>
            {driver ? 'Update driver information' : 'Enter details for the new driver'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto pr-2 space-y-4">
        <div className="space-y-4">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>

          {!driver && (
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="license_number">License Number</Label>
            <Input
              id="license_number"
              value={formData.licenseNumber}
              onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="license_expiry">License Expiry</Label>
            <Input
              id="license_expiry"
              type="date"
              value={formData.licenseExpiry}
              onChange={(e) => setFormData({ ...formData, licenseExpiry: e.target.value })}
            />
          </div>
          {/* ✅ License Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="licenseImage">License</Label>
            <Input
              id="licenseImage"
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, setLicenseImage, setLicensePreview)}
            />
            {licensePreview ? (
              <img
                src={licensePreview}
                alt="License Preview"
                className="w-24 h-24 mt-2 object-cover rounded border"
              />
            ) : (
              <p className="text-xs text-gray-500 italic">No preview available</p>
            )}
          </div>


          {/* ✅ RC Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="rcImage">RC</Label>
            <Input
              id="rcImage"
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, setRcImage, setRcPreview)}
            />
            {rcPreview ? (
              <img
                src={rcPreview}
                alt="RC Preview"
                className="w-24 h-24 mt-2 object-cover rounded border"
              />
            ) : (
              <p className="text-xs text-gray-500 italic">No preview available</p>
            )}
          </div>


   {!isVendor && (
  <div className="space-y-2">
    <Label htmlFor="vendor_id">Vendor</Label>
    <Select
      value={formData.vendorId !== undefined ? String(formData.vendorId) : 'unassigned'}
      onValueChange={(value) =>
        setFormData({
          ...formData,
          vendorId: value === 'unassigned' ? undefined : Number(value),
        })
      }
    >
      <SelectTrigger>
        <SelectValue placeholder="Select vendor (optional)" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="unassigned">No vendor assigned</SelectItem>
        {vendors.map((vendor: any) => (
          <SelectItem key={vendor.id} value={vendor.id.toString()}>
            {vendor.companyReg || vendor.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
)}



          {/* 🔁 REPLACE THIS BLOCK: Assigned Vehicle Select */}
    <div className="space-y-2">
      <Label htmlFor="assigned_vehicle_id">Assigned Vehicle</Label>
      <Select
        value={formData.assignedVehicleId !== undefined ? String(formData.assignedVehicleId) : 'unassigned'}
        onValueChange={(value) =>
          setFormData({
            ...formData,
            assignedVehicleId: value === 'unassigned' ? undefined : Number(value),
          })
        }
      >
    <SelectTrigger>
      <SelectValue placeholder="Select vehicle (optional)" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="unassigned">No vehicle assigned</SelectItem> {/* ✅ Safe fallback value */}
      {vehicles.map((vehicle: any) => (
        <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
          {vehicle.registrationNumber} - {vehicle.model}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>


          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_part_time"
              checked={formData.isPartTime}
              onCheckedChange={(checked) => setFormData({ ...formData, isPartTime: checked as boolean })}
            />
            <Label htmlFor="is_part_time">Part-time driver</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_available"
              checked={formData.isAvailable}
              onCheckedChange={(checked) => setFormData({ ...formData, isAvailable: checked as boolean })}
            />
            <Label htmlFor="is_available">Available for trips</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : driver ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DriverForm;
