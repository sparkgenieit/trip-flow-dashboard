// REPLACE-FILE: src/components/vendor-tabs/vehicles/VendorVehiclesTab.tsx
'use client';
import React, { useEffect, useMemo, useState } from 'react';
import VendorVehicleList from './VendorVehicleList';
import VehicleAddEditForm from './VehicleAddEditForm';
import VendorVehicleBranches from './VendorVehicleBranches';

type Mode = 'list' | 'add' | 'edit';

export default function VendorVehiclesTab({ vendorId }: { vendorId: string | number }) {
  const [mode, setMode] = useState<Mode>('list');
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [editVehicle, setEditVehicle] = useState<any | null>(null);
  const [refreshKey, setRefreshKey] = useState(0); // bump to reload list

  useEffect(() => {
    // when vendor changes, reset selection and mode
    setSelectedBranchId(null);
    setMode('list');
    setEditVehicle(null);
  }, [vendorId]);

  const openAdd = () => {
    setEditVehicle(null);
    setMode('add');
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0);
  };
  const openEdit = (row: any) => {
    setEditVehicle(row);
    setMode('edit');
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0);
  };
  const backToList = () => {
    setMode('list');
    setEditVehicle(null);
  };
  const onSaved = () => {
    setMode('list');
    setEditVehicle(null);
    setRefreshKey((n) => n + 1); // trigger reload in list
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {mode === 'list' ? 'List of Branch' : mode === 'add' ? 'Add Vehicle' : 'Edit Vehicle'}
        </h2>
      </div>

      {/* ------- LIST MODE ------- */}
      {mode === 'list' && (
        <>
          {/* Branch cards (live) */}
          <VendorVehicleBranches
            vendorId={String(vendorId)}
            onSelectBranch={(id) => setSelectedBranchId(id)}
          />

          {/* Vehicle table (live) */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold">
              Vehicle List{selectedBranchId ? ` in Branch #${selectedBranchId}` : ''}
            </h3>
            <VendorVehicleList
              vendorId={vendorId}
              branchId={selectedBranchId ?? undefined}
              onRequestAdd={openAdd}
              onRequestEdit={openEdit}
              refreshKey={refreshKey}
            />
          </div>

          <div className="flex justify-end">
            <button className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white">
              Skip &amp; Continue
            </button>
          </div>
        </>
      )}

      {/* ------- ADD / EDIT MODE ------- */}
      {mode !== 'list' && (
        <div className="space-y-4">
          <VehicleAddEditForm
            mode={mode}
            vendorId={Number(vendorId)}
            branchId={selectedBranchId ?? undefined}
            vehicle={editVehicle || undefined}
            onCancel={backToList}
            onSaved={onSaved}
          />
        </div>
      )}
    </div>
  );
}
