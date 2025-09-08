'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DriverTabs, { DriverFormData } from '@/components/driver-tabs/DriverTabs';
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { getDrivers } from '@/services/drivers'; // <-- ensure this exists

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
        const d = await getDrivers(driverId);

        const mapped: Partial<DriverFormData> = {
          vendorId: d?.vendorId ?? null,
          vehicleType: d?.vehicleType ?? '',
          name: d?.fullName || d?.name || '',
          primaryMobile: d?.phone || d?.primaryMobile || '',
          altMobile: d?.altMobile ?? '',
          whatsapp: d?.whatsapp ?? '',
          email: d?.email ?? '',
          licenseNumber: d?.licenseNumber ?? '',
          licenseIssueDate: d?.licenseIssueDate?.slice(0,10) ?? '',
          licenseExpiryDate: d?.licenseExpiryDate?.slice(0,10) ?? '',
          dob: d?.dob?.slice(0,10) ?? '',
          aadhar: d?.aadhar ?? '',
          pan: d?.pan ?? '',
          bloodGroup: d?.bloodGroup ?? '',
          gender: d?.gender ?? '',
          voterId: d?.voterId ?? '',
          address: d?.address ?? '',
          // cost/doc/review fields if your API returns them:
          baseSalaryMonthly: d?.baseSalaryMonthly ?? null,
          dailyAllowance: d?.dailyAllowance ?? null,
          overtimePerHour: d?.overtimePerHour ?? null,
          nightAllowance: d?.nightAllowance ?? null,
          notes: d?.notes ?? '',
          rating: d?.rating ?? null,
          remarks: d?.remarks ?? '',
          dateOfJoining: d?.dateOfJoining?.slice(0,10) ?? '',
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
