'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DriverTabs, { DriverFormData } from '@/components/driver-tabs/DriverTabs';
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { getDriverFull } from '@/services/drivers'; // <-- ensure this exists

export default function EditDriverPage() {
  const { id } = useParams<{ id: string }>();
  const driverId = useMemo(() => Number(id), [id]);
  const navigate = useNavigate();

  const [initial, setInitial] = useState<Partial<DriverFormData>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // ⭐ expects a function that returns the driver by id
        // shape can vary—map it into DriverFormData fields below.
        const d = await getDriverFull(driverId);

        // nested tab data come from: d.costDetails, d.documents, d.feedbackMeta
        const mapped: Partial<DriverFormData> = {
          vendorId: d?.vendorId ?? null,
          vehicleType: d?.vehicleType ?? '',
          name: d?.fullName || d?.name || '',
          primaryMobile: d?.phone || d?.primaryMobile || '',
          altMobile: d?.altPhone ?? '',
          whatsapp: d?.whatsappPhone ?? '',
          email: d?.email ?? '',
          licenseNumber: d?.licenseNumber ?? '',
          licenseIssueDate: d?.licenseIssueDate ? String(d.licenseIssueDate).slice(0,10) : '',
          licenseExpiryDate: d?.licenseExpiry ? String(d.licenseExpiry).slice(0,10) : '',
          dob: d?.dob ? String(d.dob).slice(0,10) : '',
          aadhar: d?.aadhaarNumber ?? '',
          pan: d?.panNumber ?? '',
          bloodGroup: d?.bloodGroup ?? '',
          gender: d?.gender ?? '',
          voterId: d?.voterId ?? '',
          address: d?.address ?? '',

          // COST
          driverSalary: d?.costDetails?.driverSalary ?? null,
          foodCost: d?.costDetails?.foodCost ?? null,
          accommodationCost: d?.costDetails?.accommodationCost ?? null,
          bhattaCost: d?.costDetails?.bhattaCost ?? null,
          earlyMorningCharges: d?.costDetails?.earlyMorningCharges ?? null,
          eveningCharges: d?.costDetails?.eveningCharges ?? null,

          // DOCS (we don’t prefill File objects; user will see “file uploaded” in preview)
          documents: [],

          // FEEDBACK
          rating: d?.feedbackMeta?.ratingAvg ?? null,
          feedback: d?.feedbackMeta?.remarks ?? '',
          reviews: d?.feedbackMeta?.reviews ?? [],
        };

        if (mounted) setInitial(mapped);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [driverId]);

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
          driverId={driverId}
          initial={initial}
          onCancel={() => navigate(-1)}
          onSaved={() => navigate('/dashboard/drivers')}
        />
      )}
    </div>
  );
}
