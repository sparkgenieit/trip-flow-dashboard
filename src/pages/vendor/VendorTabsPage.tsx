// src/pages/vendor/VendorTabsPage.tsx
'use client';
import React from 'react';
import { useParams } from 'react-router-dom';
// You can keep this alias or import directly as the same name
import VendorVehicleTabsRoot from '@/components/vendor-tabs/VendorVehicleTabsRoot';

export default function VendorTabsPage() {
  const { vendorId } = useParams<{ vendorId: string }>();

  if (!vendorId) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Missing vendor id in route. Use /dashboard/vendors/:vendorId/tabs
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* EDIT MODE: unlocks all tabs, button shows “Update & Continue” */}
      <VendorVehicleTabsRoot mode="edit" vendorId={vendorId} />
    </div>
  );
}
