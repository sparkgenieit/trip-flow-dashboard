'use client';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import DriverTabs from '@/components/driver-tabs/DriverTabs';
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator
} from '@/components/ui/breadcrumb';

export default function AddDriverPage() {
  const navigate = useNavigate();

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
            <BreadcrumbPage>Add Driver</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <DriverTabs
        onCancel={() => navigate(-1)}
        onSaved={() => navigate('/dashboard/drivers')}
      />
    </div>
  );
}
