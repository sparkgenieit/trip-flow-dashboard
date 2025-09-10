
'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DriverTabs, { type DriverFormData } from '@/components/driver-tabs/DriverTabs';
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { getDriverFull } from '@/services/drivers';
import { useToast } from '@/hooks/use-toast';

  const API_BASE_URL =
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) ||
    (typeof window !== 'undefined' && (window as any).__API_BASE_URL__) ||
    '';

  const joinUrl = (base: string, path?: string | null) =>
    path ? (/^https?:\/\//i.test(path) ? path : `${base.replace(/\/+$/, '')}/${String(path).replace(/^\/+/, '')}`) : null;

export default function EditDriverPage() {
  const { id, driverId: driverIdParam } = useParams<{ id?: string; driverId?: string }>();
  const driverId = useMemo<number | undefined>(() => {
  const raw = id ?? driverIdParam;
  if (!raw) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}, [id, driverIdParam]);

  const navigate = useNavigate();
  const { toast } = useToast();

  const [initial, setInitial] = useState<Partial<DriverFormData>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
    if (driverId === undefined) {
      if (mounted) setLoading(false);
      return;
    }

    // Fetch from API
    const d = await getDriverFull(driverId);

        // Map API → DriverFormData
        const mapped: Partial<DriverFormData> = {
        // BASIC
        vendorId: d?.vendorId ?? null,
        vehicleType: d?.vehicleType ?? '',
        name: d?.fullName || d?.name || '',
        primaryMobile: d?.phone || d?.primaryMobile || '',
        altMobile: d?.altPhone ?? '',
        whatsapp: d?.whatsappPhone ?? '',
        email: d?.email ?? '',
        licenseNumber: d?.licenseNumber ?? '',
        licenseIssueDate: d?.licenseIssueDate ? String(d.licenseIssueDate).slice(0, 10) : '',
        licenseExpiryDate: d?.licenseExpiry ? String(d.licenseExpiry).slice(0, 10) : '',
        dob: d?.dob ? String(d.dob).slice(0, 10) : '',
        aadhar: d?.aadhaarNumber ?? '',
        pan: d?.panNumber ?? '',
        bloodGroup: d?.bloodGroup ?? '',
        gender: d?.gender ?? '',
        voterId: d?.voterId ?? '',
        address: d?.address ?? '',

        // >>> NEW: preview URLs <<<
        profileImageUrl: joinUrl(API_BASE_URL, d?.profileImage),
        docAadharUrl:    joinUrl(API_BASE_URL, d?.documents?.aadharUrl),
        docPanUrl:       joinUrl(API_BASE_URL, d?.documents?.panUrl),
        docVoterUrl:     joinUrl(API_BASE_URL, d?.documents?.voterUrl),
        docLicenseUrl:   joinUrl(API_BASE_URL, d?.documents?.licenseUrl),

        // COST TAB
        driverSalary: d?.costDetails?.driverSalary ?? null,
        foodCost: d?.costDetails?.foodCost ?? null,
        accommodationCost: d?.costDetails?.accommodationCost ?? null,
        bhattaCost: d?.costDetails?.bhattaCost ?? null,
        earlyMorningCharges: d?.costDetails?.earlyMorningCharges ?? null,
        eveningCharges: d?.costDetails?.eveningCharges ?? null,

        // DOCS TAB (we do not prefill File objects)
        documents: [],

        // FEEDBACK TAB
        rating: d?.feedbackMeta?.ratingAvg ?? null,
        feedback: d?.feedbackMeta?.remarks ?? '',
        reviews: d?.feedbackMeta?.reviews ?? [],
      };

        if (mounted) setInitial(mapped);
      } catch (err: any) {
        toast({
          title: 'Failed to load driver',
          description: err?.message || 'Error while fetching driver details.',
          variant: 'destructive',
        });
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [driverId, toast]);

  return (
    <div className="p-4 space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild><a href="/dashboard">Dashboard</a></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild><a href="/dashboard/drivers">Drivers</a></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit Driver</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {!loading && (
        <DriverTabs

          driverId={driverId ?? undefined}
          initial={initial}
          onCancel={() => navigate(-1)}
          onSaved={() => navigate('/dashboard/drivers')}
        />

      )}
    </div>
  );
}
