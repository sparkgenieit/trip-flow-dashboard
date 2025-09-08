// src/dashboard/drivers/DriverForm.tsx
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

// ⤵️ Adjust service names/paths only if your project differs
import { createDriver, updateDriverMultipart } from '@/services/drivers';
import { fetchAllVendors } from '@/services/vendor';
import { getVehicles } from '@/services/vehicles';

// ---------- Types ----------
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

  // Added fields
  whatsappPhone?: string;
  altPhone?: string;
  licenseIssueDate?: string;
  dob?: string;
  gender?: string;
  bloodGroup?: string;
  aadhaarNumber?: string;
  panNumber?: string;
  voterId?: string;
  address?: string;

  // Existing files (strings when editing)
  licenseImage?: string;
  rcImage?: string;
  profileImage?: string; // NEW
}

interface DriverFormProps {
  driver?: DriverFormInput;
  onClose: () => void;
}

// ---------- Constants ----------
const GENDERS = ['Male', 'Female', 'Other'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// ---------- Component ----------
const DriverForm: React.FC<DriverFormProps> = ({ driver, onClose }) => {
  const { toast } = useToast();
  const isVendorRole =
    typeof window !== 'undefined' && localStorage.getItem('userRole') === 'VENDOR';

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
    userId: undefined,

    // added fields defaults
    whatsappPhone: '',
    altPhone: '',
    licenseIssueDate: '',
    dob: '',
    gender: '',
    bloodGroup: '',
    aadhaarNumber: '',
    panNumber: '',
    voterId: '',
    address: '',
  });

  const [vendors, setVendors] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // File states (with previews)
  const [profileImage, setProfileImage] = useState<File | null>(null); // NEW
  const [profilePreview, setProfilePreview] = useState<string | null>(null); // NEW
  const [licenseImage, setLicenseImage] = useState<File | null>(null);
  const [rcImage, setRcImage] = useState<File | null>(null);
  const [licensePreview, setLicensePreview] = useState<string | null>(null);
  const [rcPreview, setRcPreview] = useState<string | null>(null);

  // ---------- Effects ----------
  useEffect(() => {
    (async () => {
      try {
        const vs = await fetchAllVendors();
        setVendors(vs || []);
      } catch (e) {
        console.error('Failed to fetch vendors', e);
      }
      try {
        const veh = await getVehicles();
        setVehicles(veh || []);
      } catch (e) {
        console.error('Failed to fetch vehicles', e);
      }
    })();
  }, []);

  useEffect(() => {
    if (!driver) return;
    const baseURL =
      (import.meta as any)?.env?.VITE_API_BASE_URL || (process as any)?.env?.VITE_API_BASE_URL || '';

    setFormData({
      id: driver.id,
      fullName: driver.fullName || '',
      phone: driver.phone || '',
      email: driver.email || '',
      licenseNumber: driver.licenseNumber || '',
      licenseExpiry: driver.licenseExpiry?.split?.('T')?.[0] || '',
      isPartTime: !!driver.isPartTime,
      isAvailable: !!driver.isAvailable,
      vendorId: driver.vendorId ?? undefined,
      assignedVehicleId: driver.assignedVehicleId ?? undefined,
      userId: driver.userId ?? undefined,

      // added fields (optional from API)
      whatsappPhone: (driver as any).whatsappPhone || '',
      altPhone: (driver as any).altPhone || '',
      licenseIssueDate: (driver as any).licenseIssueDate?.split?.('T')?.[0] || '',
      dob: (driver as any).dob?.split?.('T')?.[0] || '',
      gender: (driver as any).gender || '',
      bloodGroup: (driver as any).bloodGroup || '',
      aadhaarNumber: (driver as any).aadhaarNumber || '',
      panNumber: (driver as any).panNumber || '',
      voterId: (driver as any).voterId || '',
      address: (driver as any).address || '',
    });

    if ((driver as any).profileImage)
      setProfilePreview(`${baseURL}/${(driver as any).profileImage}`);
    if (driver.licenseImage) setLicensePreview(`${baseURL}/${driver.licenseImage}`);
    if (driver.rcImage) setRcPreview(`${baseURL}/${driver.rcImage}`);
  }, [driver]);

  // ---------- Helpers ----------
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (f: File | null) => void,
    previewSetter: (url: string | null) => void
  ) => {
    const f = e.target.files?.[0] || null;
    setter(f);
    previewSetter(f ? URL.createObjectURL(f) : null);
  };

  // ---------- Submit ----------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('fullName', formData.fullName);
      fd.append('phone', formData.phone);
      fd.append('email', formData.email || '');
      fd.append('licenseNumber', formData.licenseNumber);
      fd.append('licenseExpiry', formData.licenseExpiry || '');
      fd.append('isPartTime', String(formData.isPartTime));
      fd.append('isAvailable', String(formData.isAvailable));

      // added fields
      if (formData.whatsappPhone) fd.append('whatsappPhone', formData.whatsappPhone);
      if (formData.altPhone) fd.append('altPhone', formData.altPhone);
      if (formData.licenseIssueDate) fd.append('licenseIssueDate', formData.licenseIssueDate);
      if (formData.dob) fd.append('dob', formData.dob);
      if (formData.gender) fd.append('gender', formData.gender);
      if (formData.bloodGroup) fd.append('bloodGroup', formData.bloodGroup);
      if (formData.aadhaarNumber) fd.append('aadhaarNumber', formData.aadhaarNumber);
      if (formData.panNumber) fd.append('panNumber', formData.panNumber);
      if (formData.voterId) fd.append('voterId', formData.voterId);
      if (formData.address) fd.append('address', formData.address);

      if (formData.vendorId) fd.append('vendorId', String(formData.vendorId));
      if (formData.assignedVehicleId) fd.append('vehicleId', String(formData.assignedVehicleId));
      if (formData.userId) fd.append('userId', String(formData.userId));

      // files
      if (profileImage) fd.append('profileImage', profileImage); // NEW
      if (licenseImage) fd.append('licenseImage', licenseImage);
      if (rcImage) fd.append('rcImage', rcImage);

      if (driver?.id) {
        await updateDriverMultipart(driver.id, fd);
        toast({ title: 'Updated', description: 'Driver updated successfully' });
      } else {
        await createDriver(fd);
        toast({ title: 'Created', description: 'Driver created successfully' });
      }
      onClose();
    } catch (err) {
      console.error(err);
      toast({
        title: 'Save failed',
        description: 'Unable to save driver. Please check the fields and try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // ---------- Render ----------
  return (
    <Dialog open={true} onOpenChange={onClose}>
      {/* Bigger modal */}
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>{driver ? 'Edit Driver' : 'Add New Driver'}</DialogTitle>
          <DialogDescription>
            {driver ? 'Update driver information' : 'Enter details for the new driver'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto pr-1">
          {/* Two-column grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name & Phone */}
            <div className="space-y-1">
              <Label htmlFor="full_name">Driver Name</Label>
              <Input
                id="full_name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="phone">Primary Mobile Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>

            {/* Email (keep required for create) */}
            <div className="space-y-1">
              <Label htmlFor="email">Email ID</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required={!driver}
              />
            </div>

            {/* WhatsApp & Alternate */}
            <div className="space-y-1">
              <Label htmlFor="whatsapp">WhatsApp Mobile Number</Label>
              <Input
                id="whatsapp"
                value={formData.whatsappPhone}
                onChange={(e) => setFormData({ ...formData, whatsappPhone: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="alt_phone">Alternate Mobile Number</Label>
              <Input
                id="alt_phone"
                value={formData.altPhone}
                onChange={(e) => setFormData({ ...formData, altPhone: e.target.value })}
              />
            </div>

            {/* License, Issue, Expiry */}
            <div className="space-y-1">
              <Label htmlFor="license_number">License Number</Label>
              <Input
                id="license_number"
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="license_issue">License Issue Date</Label>
              <Input
                id="license_issue"
                type="date"
                value={formData.licenseIssueDate}
                onChange={(e) => setFormData({ ...formData, licenseIssueDate: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="license_expiry">License Expire Date</Label>
              <Input
                id="license_expiry"
                type="date"
                value={formData.licenseExpiry}
                onChange={(e) => setFormData({ ...formData, licenseExpiry: e.target.value })}
              />
            </div>

            {/* DOB */}
            <div className="space-y-1">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              />
            </div>

            {/* Gender & Blood Group */}
            <div className="space-y-1">
              <Label>Gender</Label>
              <Select
                value={formData.gender || ''}
                onValueChange={(v) => setFormData({ ...formData, gender: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose Gender" />
                </SelectTrigger>
                <SelectContent>
                  {GENDERS.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Blood Group</Label>
              <Select
                value={formData.bloodGroup || ''}
                onValueChange={(v) => setFormData({ ...formData, bloodGroup: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose Blood Group" />
                </SelectTrigger>
                <SelectContent>
                  {BLOOD_GROUPS.map((bg) => (
                    <SelectItem key={bg} value={bg}>
                      {bg}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Aadhaar / PAN / Voter */}
            <div className="space-y-1">
              <Label htmlFor="aadhaar">Aadhaar Card Number</Label>
              <Input
                id="aadhaar"
                value={formData.aadhaarNumber}
                onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="pan">PAN Card Number</Label>
              <Input
                id="pan"
                value={formData.panNumber}
                onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="voter">Voter ID Number</Label>
              <Input
                id="voter"
                value={formData.voterId}
                onChange={(e) => setFormData({ ...formData, voterId: e.target.value })}
              />
            </div>

            {/* Vendor (hidden for vendor role) */}
            {!isVendorRole && (
              <div className="space-y-1">
                <Label>Vendor</Label>
                <Select
                  value={
                    formData.vendorId !== undefined && formData.vendorId !== null
                      ? String(formData.vendorId)
                      : 'unassigned'
                  }
                  onValueChange={(val) =>
                    setFormData({
                      ...formData,
                      vendorId: val === 'unassigned' ? undefined : Number(val),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select vendor (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">No vendor assigned</SelectItem>
                    {vendors.map((v: any) => (
                      <SelectItem key={v.id} value={String(v.id)}>
                        {v.companyReg || v.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Vehicle */}
            <div className="space-y-1">
              <Label>Assigned Vehicle</Label>
              <Select
                value={
                  formData.assignedVehicleId !== undefined && formData.assignedVehicleId !== null
                    ? String(formData.assignedVehicleId)
                    : 'unassigned'
                }
                onValueChange={(val) =>
                  setFormData({
                    ...formData,
                    assignedVehicleId: val === 'unassigned' ? undefined : Number(val),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">No vehicle assigned</SelectItem>
                  {vehicles.map((veh: any) => (
                    <SelectItem key={veh.id} value={String(veh.id)}>
                      {veh.registrationNumber} - {veh.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Address (full width) */}
            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="House/Street, Area, City, State, PIN"
              />
            </div>

            {/* Availability flags */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_available"
                checked={formData.isAvailable}
                onCheckedChange={(c) => setFormData({ ...formData, isAvailable: !!c })}
              />
              <Label htmlFor="is_available">Available for trips</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_part_time"
                checked={formData.isPartTime}
                onCheckedChange={(c) => setFormData({ ...formData, isPartTime: !!c })}
              />
              <Label htmlFor="is_part_time">Part-time driver</Label>
            </div>

            {/* ---- Documents (Profile, License, RC) ---- */}
            <div className="space-y-1">
              <Label htmlFor="profileImage">Profile Photo</Label>
              <Input
                id="profileImage"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, setProfileImage, setProfilePreview)}
              />
              {profilePreview ? (
                <img
                  src={profilePreview}
                  alt="Profile Preview"
                  className="w-28 h-28 mt-2 object-cover rounded-full border"
                />
              ) : (
                <p className="text-xs text-gray-500 italic">No preview available</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="licenseImage">License (image)</Label>
              <Input
                id="licenseImage"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, setLicenseImage, setLicensePreview)}
                required={!driver && !licensePreview} // if your backend requires on create
              />
              {licensePreview ? (
                <img
                  src={licensePreview}
                  alt="License Preview"
                  className="w-28 h-28 mt-2 object-cover rounded border"
                />
              ) : (
                <p className="text-xs text-gray-500 italic">No preview available</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="rcImage">RC (image)</Label>
              <Input
                id="rcImage"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, setRcImage, setRcPreview)}
                required={!driver && !rcPreview} // if your backend requires on create
              />
              {rcPreview ? (
                <img
                  src={rcPreview}
                  alt="RC Preview"
                  className="w-28 h-28 mt-2 object-cover rounded border"
                />
              ) : (
                <p className="text-xs text-gray-500 italic">No preview available</p>
              )}
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving…' : driver?.id ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DriverForm;
