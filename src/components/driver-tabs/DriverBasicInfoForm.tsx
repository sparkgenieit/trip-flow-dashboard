'use client';
import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { DriverFormData } from './DriverTabs';
import { fetchAllVendors } from '@/services/vendor';
import { getVehicleTypes } from '@/services/vehicles';


export default function DriverBasicInfoForm(props: {
  value: DriverFormData;
  onChange: (patch: Partial<DriverFormData>) => void;
  vendorId?: number;
}) {
  const { value: v, onChange } = props;

  const [vendors, setVendors] = useState<Array<{ id: number; name?: string; companyReg?: string }>>([]);

useEffect(() => {
  (async () => {
    try {
      const vs = await fetchAllVendors();
      // supports both shapes: array or { data: [...] }
      const list = Array.isArray(vs) ? vs : Array.isArray(vs?.data) ? vs.data : [];
      setVendors(list);
    } catch (e) {
      console.error('Failed to fetch vendors', e);
      setVendors([]);
    }
  })();
}, []);

  const [vehicleTypes, setVehicleTypes] = useState<Array<{ id: number; name: string }>>([]);

  useEffect(() => {
    (async () => {
      try {
        const types = await getVehicleTypes();
        const list = Array.isArray(types) ? types : Array.isArray((types as any)?.data) ? (types as any).data : [];
        setVehicleTypes(list);
      } catch (e) {
        console.error('Failed to fetch vehicle types', e);
        setVehicleTypes([]);
      }
    })();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Row 1 */}
      <div className="space-y-2">
      <Label>Choose Vendor {props.vendorId ? '(preselected)' : ''}</Label>
      <Select
        value={
          props.vendorId
            ? String(props.vendorId)
            : v.vendorId != null
              ? String(v.vendorId)
              : 'unassigned'
        }
        onValueChange={(val) => onChange({ vendorId: val === 'unassigned' ? null : Number(val) })}
        disabled={!!props.vendorId}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select vendor" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="unassigned">No vendor assigned</SelectItem>
          {vendors.map((vendor) => (
            <SelectItem key={vendor.id} value={String(vendor.id)}>
              {vendor.companyReg || vendor.name || `Vendor #${vendor.id}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

      <div className="space-y-2">
      <Label>Choose Vehicle Type *</Label>
      <Select
        value={
          // prefer numeric ID if present (recommended)
          (v as any).vehicleTypeId != null
            ? String((v as any).vehicleTypeId)
            // back-compat: if old forms store a string field
            : v.vehicleType
              ? String(v.vehicleType)
              : 'unassigned'
        }
        onValueChange={(val) => {
          if (val === 'unassigned') {
            // clear both shapes safely
            onChange({ ...( { vehicleTypeId: null } as any ), vehicleType: '' as any });
          } else {
            // write ID-first; keep a fallback name if your type has only vehicleType
            onChange({ ...( { vehicleTypeId: Number(val) } as any ), vehicleType: String(val) as any });
          }
        }}
      >
        <SelectTrigger><SelectValue placeholder="Select Vehicle Type" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="unassigned">No type selected</SelectItem>
          {vehicleTypes.map((vt) => (
            <SelectItem key={vt.id} value={String(vt.id)}>
              {vt.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

      <div className="space-y-2">
        <Label>Driver Name *</Label>
        <Input value={v.name} onChange={(e) => onChange({ name: e.target.value })} placeholder="Full Name" />
      </div>

      {/* Row 2 */}
      <div className="space-y-2">
        <Label>Primary Mobile Number *</Label>
        <Input value={v.primaryMobile} onChange={(e) => onChange({ primaryMobile: e.target.value })} placeholder="904776689" />
      </div>
      <div className="space-y-2">
        <Label>Alternative Mobile Number</Label>
        <Input value={v.altMobile ?? ''} onChange={(e) => onChange({ altMobile: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Whatsapp Mobile Number</Label>
        <Input value={v.whatsapp ?? ''} onChange={(e) => onChange({ whatsapp: e.target.value })} />
      </div>

      {/* Row 3 */}
      <div className="space-y-2">
        <Label>Email ID</Label>
        <Input type="email" value={v.email ?? ''} onChange={(e) => onChange({ email: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>License Number</Label>
        <Input value={v.licenseNumber ?? ''} onChange={(e) => onChange({ licenseNumber: e.target.value })} placeholder="CH03 78678555785" />
      </div>
      <div className="space-y-2">
        <Label>License Issue Date</Label>
        <Input type="date" value={v.licenseIssueDate ?? ''} onChange={(e) => onChange({ licenseIssueDate: e.target.value })} />
      </div>

      {/* Row 4 */}
      <div className="space-y-2">
        <Label>License Expire Date</Label>
        <Input type="date" value={v.licenseExpiryDate ?? ''} onChange={(e) => onChange({ licenseExpiryDate: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Date of Birth</Label>
        <Input type="date" value={v.dob ?? ''} onChange={(e) => onChange({ dob: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Aadhar Card Number</Label>
        <Input value={v.aadhar ?? ''} onChange={(e) => onChange({ aadhar: e.target.value })} placeholder="246884637988" />
      </div>

      {/* Row 5 */}
      <div className="space-y-2">
        <Label>PAN Card Number</Label>
        <Input value={v.pan ?? ''} onChange={(e) => onChange({ pan: e.target.value })} placeholder="CNFPC5441D" />
      </div>
      <div className="space-y-2">
        <Label>Blood Group</Label>
        <Select value={v.bloodGroup ?? ''} onValueChange={(x) => onChange({ bloodGroup: x })}>
          <SelectTrigger><SelectValue placeholder="Choose Blood Group" /></SelectTrigger>
          <SelectContent>
            {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => (
              <SelectItem key={bg} value={bg}>{bg}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Gender</Label>
        <Select value={v.gender ?? ''} onValueChange={(x) => onChange({ gender: x as any })}>
          <SelectTrigger><SelectValue placeholder="Choose Gender" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Male">Male</SelectItem>
            <SelectItem value="Female">Female</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Row 6 */}
      <div className="space-y-2">
        <Label>Voter ID Number</Label>
        <Input value={v.voterId ?? ''} onChange={(e) => onChange({ voterId: e.target.value })} />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>Address</Label>
        <Textarea value={v.address ?? ''} onChange={(e) => onChange({ address: e.target.value })} placeholder="Address" />
      </div>

      {/* Row 7 */}
      <div className="space-y-2 md:col-span-3">
        <Label>Upload Profile</Label>
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => onChange({ profileFile: e.target.files?.[0] ?? null })}
        />
      </div>
    </div>
  );
}
