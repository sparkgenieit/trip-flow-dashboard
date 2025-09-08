// src/components/driver-tabs/DriverTabs.tsx
'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import DriverBasicInfoForm from './DriverBasicInfoForm';
import DriverCostDetailsForm from './DriverCostDetailsForm';
import DriverDocumentsForm from './DriverDocumentsForm';
import DriverFeedbackReview from './DriverFeedbackReview';
import DriverPreview from './DriverPreview';

// ✅ import your working services
import { createDriver, updateDriverMultipart } from '@/services/drivers';

export type DriverFormData = {
  // Basic Info fields only (labels match your reference)
  vendorId?: number | null;
  vehicleType?: string | null;     // shown in UI; not sent to API
  name: string;                    // -> fullName
  primaryMobile: string;           // -> phone
  altMobile?: string;              // -> altPhone
  whatsapp?: string;               // -> whatsappPhone
  email?: string;                  // -> email
  licenseNumber?: string;          // -> licenseNumber
  licenseIssueDate?: string;       // -> licenseIssueDate (YYYY-MM-DD)
  licenseExpiryDate?: string;      // -> licenseExpiry
  dob?: string;                    // -> dob
  aadhar?: string;                 // -> aadhaarNumber
  pan?: string;                    // -> panNumber
  bloodGroup?: string;             // -> bloodGroup
  gender?: 'Male' | 'Female' | 'Other' | '';
  voterId?: string;                // -> voterId
  address?: string;                // -> address
  profileFile?: File | null;       // -> profileImage (file)

  // you can keep any extra fields for other steps...
  // (omitted here for brevity)
};

type StepValue = 'basic' | 'cost' | 'docs' | 'review' | 'preview';

/** ------------------- MAPPERS ------------------- **/

// Old API record -> Basic tab data
export function mapOldDriverToBasic(d: any): Partial<DriverFormData> {
  const dt = (s?: string) => (s?.split?.('T')?.[0] ?? s ?? '');

  return {
    vendorId: d?.vendorId ?? null,
    // vehicleType has no 1:1 in your API; keep whatever you want to display
    name: d?.fullName || '',
    primaryMobile: d?.phone || '',
    altMobile: d?.altPhone || '',
    whatsapp: d?.whatsappPhone || '',
    email: d?.email || '',
    licenseNumber: d?.licenseNumber || '',
    licenseIssueDate: dt(d?.licenseIssueDate),
    licenseExpiryDate: dt(d?.licenseExpiry),
    dob: dt(d?.dob),
    aadhar: d?.aadhaarNumber || '',
    pan: d?.panNumber || '',
    bloodGroup: d?.bloodGroup || '',
    gender: d?.gender || '',
    voterId: d?.voterId || '',
    address: d?.address || '',
    // profileFile cannot be reconstructed from a URL string; leave null
    profileFile: null,
  };
}

// Basic tab data -> FormData for your existing APIs
function buildServiceFormData(f: DriverFormData): FormData {
  const fd = new FormData();

  // required / common
  fd.append('fullName', f.name || '');
  fd.append('phone', f.primaryMobile || '');

  // optional common fields
  if (f.email) fd.append('email', f.email);
  if (f.whatsapp) fd.append('whatsappPhone', f.whatsapp);
  if (f.altMobile) fd.append('altPhone', f.altMobile);
  if (f.licenseNumber) fd.append('licenseNumber', f.licenseNumber);
  if (f.licenseIssueDate) fd.append('licenseIssueDate', f.licenseIssueDate);
  if (f.licenseExpiryDate) fd.append('licenseExpiry', f.licenseExpiryDate);
  if (f.dob) fd.append('dob', f.dob);
  if (f.gender) fd.append('gender', f.gender);
  if (f.bloodGroup) fd.append('bloodGroup', f.bloodGroup);
  if (f.aadhar) fd.append('aadhaarNumber', f.aadhar);
  if (f.pan) fd.append('panNumber', f.pan);
  if (f.voterId) fd.append('voterId', f.voterId);
  if (f.address) fd.append('address', f.address);

  // relations
  if (f.vendorId) fd.append('vendorId', String(f.vendorId));

  // files
  if (f.profileFile) fd.append('profileImage', f.profileFile);

  // NOTE: vehicleType is display-only here; your previous service expects assignedVehicleId (not in Basic)
  return fd;
}

/** ------------------------------------------------ **/

export default function DriverTabs(props: {
  driverId?: number;              // editing mode if provided
  vendorId?: number;              // pre-selected vendor (hide vendor dropdown)
  initial?: Partial<DriverFormData>;
  onCancel?: () => void;
  onSaved?: (driverId: number) => void;
}) {
  const { toast } = useToast();
  const [tab, setTab] = useState<StepValue>('basic');

  const [form, setForm] = useState<DriverFormData>(() => ({
    vendorId: props.vendorId ?? null,
    vehicleType: '',
    name: '',
    primaryMobile: '',
    altMobile: '',
    whatsapp: '',
    email: '',
    licenseNumber: '',
    licenseIssueDate: '',
    licenseExpiryDate: '',
    dob: '',
    aadhar: '',
    pan: '',
    bloodGroup: '',
    gender: '',
    voterId: '',
    address: '',
    profileFile: null,
    ...(props.initial ?? {}),
  }));

  // hydrate when edit data arrives
  useEffect(() => {
    if (props.initial && Object.keys(props.initial).length) {
      setForm((f) => ({ ...f, ...props.initial! }));
    }
  }, [props.initial]);

  const isEdit = !!props.driverId;

  const steps: { key: StepValue; label: string }[] = useMemo(
    () => [
      { key: 'basic',   label: '1 Basic Info' },
      { key: 'cost',    label: '2 Cost Details' },
      { key: 'docs',    label: '3 Upload Document' },
      { key: 'review',  label: '4 Feedback & Review' },
      { key: 'preview', label: '5 Preview' },
    ],
    []
  );

  const goNext = () => {
    const idx = steps.findIndex(s => s.key === tab);
    if (idx < steps.length - 1) setTab(steps[idx + 1].key);
  };
  const goBack = () => {
    const idx = steps.findIndex(s => s.key === tab);
    if (idx > 0) setTab(steps[idx - 1].key);
    else props.onCancel?.();
  };

  // ✅ call your working services with the mapped FormData
  const saveDriver = async () => {
    try {
      const fd = buildServiceFormData(form);

      if (isEdit && props.driverId) {
        await updateDriverMultipart(props.driverId, fd);
        toast({ title: 'Driver updated' });
        props.onSaved?.(props.driverId);
      } else {
        const res = await createDriver(fd);
        // if your create returns the created driver, prefer res.id
        const newId = res?.id ?? Math.floor(Math.random() * 100000);
        toast({ title: 'Driver created' });
        props.onSaved?.(newId);
      }
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Save failed', description: String(e?.message ?? e), variant: 'destructive' });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isEdit ? 'Edit Driver' : 'Add Driver'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={tab} onValueChange={(v) => setTab(v as StepValue)} className="w-full">
          <TabsList className="grid grid-cols-5 w-full">
            {steps.map(s => (
              <TabsTrigger key={s.key} value={s.key} className="text-xs md:text-sm">
                {s.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="basic">
            <DriverBasicInfoForm
              value={form}
              onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
              vendorId={props.vendorId}
            />
            <div className="mt-6 flex items-center justify-between">
              <Button variant="secondary" onClick={goBack}>Back</Button>
              <Button onClick={goNext}>Update & Continue</Button>
            </div>
          </TabsContent>

          <TabsContent value="cost">
            <DriverCostDetailsForm
              value={form as any}
              onChange={(patch) => setForm((f) => ({ ...f, ...(patch as any) }))}
            />
            <div className="mt-6 flex items-center justify-between">
              <Button variant="secondary" onClick={goBack}>Back</Button>
              <Button onClick={goNext}>Update & Continue</Button>
            </div>
          </TabsContent>

          <TabsContent value="docs">
            <DriverDocumentsForm
              value={form as any}
              onChange={(patch) => setForm((f) => ({ ...f, ...(patch as any) }))}
            />
            <div className="mt-6 flex items-center justify-between">
              <Button variant="secondary" onClick={goBack}>Back</Button>
              <Button onClick={goNext}>Update & Continue</Button>
            </div>
          </TabsContent>

          <TabsContent value="review">
            <DriverFeedbackReview
              value={form as any}
              onChange={(patch) => setForm((f) => ({ ...f, ...(patch as any) }))}
            />
            <div className="mt-6 flex items-center justify-between">
              <Button variant="secondary" onClick={goBack}>Back</Button>
              <Button onClick={() => setTab('preview')}>Preview</Button>
            </div>
          </TabsContent>

          <TabsContent value="preview">
            <DriverPreview value={form as any} />
            <div className="mt-6 flex items-center justify-between">
              <Button variant="secondary" onClick={goBack}>Back</Button>
              <Button onClick={saveDriver}>{isEdit ? 'Save Changes' : 'Create Driver'}</Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
