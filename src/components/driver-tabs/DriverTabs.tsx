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

// NEW services (per-tab)
import {
  createDriverBasic,
  updateDriverBasic,
  upsertDriverCost,
  upsertDriverDocs,
  upsertDriverFeedback,
  getDriverFull, // ← add this
} from '@/services/drivers';

export type DriverFormData = {
  // Basic
  vendorId?: number | null;
  vehicleType?: string | null; // display-only
  name: string;
  primaryMobile: string;
  altMobile?: string;
  whatsapp?: string;
  email?: string;
  licenseNumber?: string;
  licenseIssueDate?: string;
  licenseExpiryDate?: string;
  dob?: string;
  aadhar?: string;
  pan?: string;
  bloodGroup?: string;
  gender?: 'Male' | 'Female' | 'Other' | '';
  voterId?: string;
  address?: string;
  profileFile?: File | null;

  // >>> NEW preview fields (optional) <<<
  profileImageUrl?: string | null;
  docAadharUrl?: string | null;
  docPanUrl?: string | null;
  docVoterUrl?: string | null;
  docLicenseUrl?: string | null;

  // Cost Details
  driverSalary?: number | null;
  foodCost?: number | null;
  accommodationCost?: number | null;
  bhattaCost?: number | null;
  earlyMorningCharges?: number | null;
  eveningCharges?: number | null;

  // Documents (legacy mirrors kept by form)
  docAadhar?: File | null;
  docPan?: File | null;
  docLicense?: File | null;
  docAddressProof?: File | null;
  documents?: Array<{ id: string; type: string; file?: File | null; name?: string }>;

  // Feedback & Review
  rating?: number | null;
  feedback?: string | null;
  reviews?: Array<{ id: string; rating: number; description: string; createdAt: string }>;
};

type StepValue = 'basic' | 'cost' | 'docs' | 'review' | 'preview';

/** ------------------- helpers ------------------- **/
function buildBasicFormData(f: DriverFormData): FormData {
  const fd = new FormData();
  fd.append('fullName', f.name || '');
  fd.append('phone', f.primaryMobile || '');

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
  if (f.vendorId) fd.append('vendorId', String(f.vendorId));
  if (f.profileFile) fd.append('profileImage', f.profileFile);
  return fd;
}

function mapDbToForm(d: any): Partial<DriverFormData> {
  if (!d) return {};
  return {
    // BASIC
    vendorId: d.vendorId ?? null,
    vehicleType: d.vehicleType ?? '',
    name: d.fullName || d.name || '',
    primaryMobile: d.phone || d.primaryMobile || '',
    altMobile: d.altPhone ?? '',
    whatsapp: d.whatsappPhone ?? '',
    email: d.email ?? '',
    licenseNumber: d.licenseNumber ?? '',
    licenseIssueDate: d.licenseIssueDate ? String(d.licenseIssueDate).slice(0, 10) : '',
    licenseExpiryDate: d.licenseExpiry ? String(d.licenseExpiry).slice(0, 10) : '',
    dob: d.dob ? String(d.dob).slice(0, 10) : '',
    aadhar: d.aadhaarNumber ?? '',
    pan: d.panNumber ?? '',
    bloodGroup: d.bloodGroup ?? '',
    gender: d.gender ?? '',
    voterId: d.voterId ?? '',
    address: d.address ?? '',

    // COST
    driverSalary: d?.costDetails?.driverSalary ?? null,
    foodCost: d?.costDetails?.foodCost ?? null,
    accommodationCost: d?.costDetails?.accommodationCost ?? null,
    bhattaCost: d?.costDetails?.bhattaCost ?? null,
    earlyMorningCharges: d?.costDetails?.earlyMorningCharges ?? null,
    eveningCharges: d?.costDetails?.eveningCharges ?? null,

    // DOCS: we never prefill File objects
    documents: [],

    // FEEDBACK
    rating: d?.feedbackMeta?.ratingAvg ?? null,
    feedback: d?.feedbackMeta?.remarks ?? '',
    reviews: d?.feedbackMeta?.reviews ?? [],
  };
}
/** ------------------------------------------------ **/

export default function DriverTabs(props: {
  driverId?: number;              // edit mode if present
  vendorId?: number;              // pre-selected vendor
  initial?: Partial<DriverFormData>;
  onCancel?: () => void;
  onSaved?: (driverId: number) => void;
}) {
  const { toast } = useToast();
  const [tab, setTab] = useState<StepValue>('basic');

  // maintain current driver id (created on Basic tab if new)
  const [currentId, setCurrentId] = useState<number | undefined>(props.driverId);

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
    profileImageUrl: null,
    docAadharUrl: null,
    docPanUrl: null,
    docVoterUrl: null,
    docLicenseUrl: null,


    driverSalary: null,
    foodCost: null,
    accommodationCost: null,
    bhattaCost: null,
    earlyMorningCharges: null,
    eveningCharges: null,

    docAadhar: null,
    docPan: null,
    docLicense: null,
    docAddressProof: null,
    documents: [],

    rating: null,
    feedback: '',
    reviews: [],
    ...(props.initial ?? {}),
  }));

  useEffect(() => {
  let alive = true;

  (async () => {
    // 1) Always set the id if provided
    if (props.driverId && !currentId) {
      setCurrentId(props.driverId);
    }

    // 2) If caller passed initial values, merge them first
    if (props.initial && Object.keys(props.initial).length > 0) {
      if (!alive) return;
      setForm((f) => ({ ...f, ...props.initial! }));
      return; // caller-provided initial takes priority; skip fetching
    }

    // 3) Otherwise (edit mode without initial), fetch from API
    if (props.driverId) {
      try {
        const d = await getDriverFull(props.driverId);
        if (!alive) return;
        setForm((f) => ({ ...f, ...mapDbToForm(d) }));
      } catch (e) {
        console.error('Failed to load driver for edit', e);
      }
    }
  })();

  return () => { alive = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [props.driverId, props.initial]);


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

  // --------- per-tab save handlers ----------
  const handleSaveBasic = async () => {
    try {
      const fd = buildBasicFormData(form);
      if (currentId) {
        await updateDriverBasic(currentId, fd);
        toast({ title: 'Basic info saved' });
      } else {
        const created = await createDriverBasic(fd);
        const newId = Number(created?.id);
        if (!newId) throw new Error('Create failed: missing id');
        setCurrentId(newId);
        toast({ title: 'Driver created' });
      }
      setTab('cost');
    } catch (e: any) {
      toast({ title: 'Failed to save Basic info', description: String(e?.message ?? e), variant: 'destructive' });
    }
  };

  const handleSaveCost = async () => {
    if (!currentId) return toast({ title: 'Create Basic first', variant: 'destructive' });
    try {
      await upsertDriverCost(currentId, {
        driverSalary: form.driverSalary ?? null,
        foodCost: form.foodCost ?? null,
        accommodationCost: form.accommodationCost ?? null,
        bhattaCost: form.bhattaCost ?? null,
        earlyMorningCharges: form.earlyMorningCharges ?? null,
        eveningCharges: form.eveningCharges ?? null,
      });
      toast({ title: 'Cost details saved' });
      setTab('docs');
    } catch (e: any) {
      toast({ title: 'Failed to save Cost details', description: String(e?.message ?? e), variant: 'destructive' });
    }
  };

  const handleSaveDocs = async () => {
    if (!currentId) return toast({ title: 'Create Basic first', variant: 'destructive' });
    try {
      await upsertDriverDocs(currentId, {
        aadhar: form.docAadhar ?? undefined,
        pan: form.docPan ?? undefined,
        voter: form.docAddressProof ?? undefined,
        license: form.docLicense ?? undefined,
      });
      toast({ title: 'Documents saved' });
      setTab('review');
    } catch (e: any) {
      toast({ title: 'Failed to save Documents', description: String(e?.message ?? e), variant: 'destructive' });
    }
  };

  const handleSaveFeedback = async () => {
    if (!currentId) return toast({ title: 'Create Basic first', variant: 'destructive' });
    try {
      await upsertDriverFeedback(currentId, {
        rating: form.rating ?? null,
        feedback: form.feedback ?? '',
        reviews: form.reviews ?? [],
      });
      toast({ title: 'Feedback saved' });
      setTab('preview');
    } catch (e: any) {
      toast({ title: 'Failed to save Feedback', description: String(e?.message ?? e), variant: 'destructive' });
    }
  };

  const finalize = async () => {
    if (!currentId) return toast({ title: 'Create Basic first', variant: 'destructive' });
    // Everything is already saved per-tab. Just finish.
    props.onSaved?.(currentId);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{currentId ? `Edit Driver #${currentId}` : 'Add Driver'}</CardTitle>
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
              <Button onClick={handleSaveBasic}>Update & Continue</Button>
            </div>
          </TabsContent>

          <TabsContent value="cost">
            <DriverCostDetailsForm
              value={form}
              onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
            />
            <div className="mt-6 flex items-center justify-between">
              <Button variant="secondary" onClick={goBack}>Back</Button>
              <Button onClick={handleSaveCost}>Update & Continue</Button>
            </div>
          </TabsContent>

          <TabsContent value="docs">
            <DriverDocumentsForm
              value={form}
              onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
            />
            <div className="mt-6 flex items-center justify-between">
              <Button variant="secondary" onClick={goBack}>Back</Button>
              <Button onClick={handleSaveDocs}>Update & Continue</Button>
            </div>
          </TabsContent>

          <TabsContent value="review">
            <DriverFeedbackReview
              value={form}
              onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
            />
            <div className="mt-6 flex items-center justify-between">
              <Button variant="secondary" onClick={goBack}>Back</Button>
              <Button onClick={handleSaveFeedback}>Preview</Button>
            </div>
          </TabsContent>

          <TabsContent value="preview">
            <DriverPreview value={form} />
            <div className="mt-6 flex items-center justify-between">
              <Button variant="secondary" onClick={goBack}>Back</Button>
              <Button onClick={finalize}>{currentId ? 'Finish' : 'Create Driver'}</Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}