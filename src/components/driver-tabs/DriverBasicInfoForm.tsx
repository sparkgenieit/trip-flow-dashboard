'use client';
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { DriverFormData } from './DriverTabs';

export default function DriverBasicInfoForm(props: {
  value: DriverFormData;
  onChange: (patch: Partial<DriverFormData>) => void;
  vendorId?: number;
}) {
  const { value: v, onChange } = props;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Row 1 */}
      <div className="space-y-2">
        <Label>Choose Vendor {props.vendorId ? '(preselected)' : '*'}</Label>
        <Input
          placeholder={props.vendorId ? String(props.vendorId) : 'Vendor ID'}
          value={props.vendorId ? String(props.vendorId) : (v.vendorId ?? '').toString()}
          disabled={!!props.vendorId}
          onChange={(e) => onChange({ vendorId: Number(e.target.value || 0) || null })}
        />
      </div>

      <div className="space-y-2">
        <Label>Choose Vehicle Type *</Label>
        <Select
          value={v.vehicleType ?? ''}
          onValueChange={(x) => onChange({ vehicleType: x })}
        >
          <SelectTrigger><SelectValue placeholder="Select Vehicle Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Sedan">Sedan</SelectItem>
            <SelectItem value="SUV">SUV</SelectItem>
            <SelectItem value="Hatchback">Hatchback</SelectItem>
            <SelectItem value="Tempo">Tempo</SelectItem>
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
