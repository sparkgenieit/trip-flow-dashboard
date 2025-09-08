'use client';
import React from 'react';
import { useParams } from 'react-router-dom';
import VendorVehicleTabsRoot from '../VendorVehicleTabsRoot';

export default function VendorTabsPage() {
  const { vendorId } = useParams<{ vendorId: string }>();
  if(!vendorId) return <div className="p-4">Missing vendorId</div>;
  return <VendorVehicleTabsRoot vendorId={vendorId}/>;
}
