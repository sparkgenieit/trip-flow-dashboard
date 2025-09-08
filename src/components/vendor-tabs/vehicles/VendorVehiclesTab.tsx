'use client';
import React, { useEffect, useMemo, useState } from 'react';
import VendorVehicleList from './VendorVehicleList';
import VehicleAddEditForm from './VehicleAddEditForm';

type Branch = {
  id: string;
  name: string;
  vehicleCount: number;
  location?: string;
};

type Mode = 'list' | 'add' | 'edit';

export default function VendorVehiclesTab({ vendorId }: { vendorId: string }) {
  // ---- STATE
  const [mode, setMode] = useState<Mode>('list'); // << SHOW LIST FIRST
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [editVehicle, setEditVehicle] = useState<any | null>(null);

  const selected = useMemo(
    () => branches.find((b) => b.id === selectedBranchId) || null,
    [branches, selectedBranchId]
  );

  // ---- LOAD MOCK BRANCHES (replace with API)
  useEffect(() => {
    const mock: Branch[] = [
      { id: '1', name: 'DVI-RAMESWARAM', vehicleCount: 5, location: 'Rameswaram' },
      { id: '2', name: 'DVI-CHENNAI',     vehicleCount: 3, location: 'Chennai' },
      { id: '3', name: 'DVI-MADURAI',     vehicleCount: 2, location: 'Madurai' },
    ];
    setBranches(mock);
    if (!selectedBranchId && mock.length) setSelectedBranchId(mock[0].id);
  }, [vendorId]);

  // ---- INTENTS
  const openAdd = () => {
    if (!selected) return;
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
    // TODO: refresh vehicles for selected branch via API
    setMode('list');
    setEditVehicle(null);
  };

  // ---- UI
  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {mode === 'list' ? 'List of Branch' : mode === 'add' ? 'Add Vehicle' : 'Edit Vehicle'}
        </h2>

        
      </div>

      {/* ------- LIST MODE ------- */}
      {mode === 'list' && (
        <>
          {/* Branch cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {branches.map((b) => {
              const active = b.id === selectedBranchId;
              return (
                <button
                  key={b.id}
                  onClick={() => setSelectedBranchId(b.id)}
                  className={[
                    'group relative w-full text-left rounded-lg border p-4 shadow-sm transition bg-white',
                    active ? 'border-indigo-300 ring-2 ring-indigo-200' : 'hover:shadow-md',
                  ].join(' ')}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl bg-fuchsia-100 text-fuchsia-700 grid place-items-center font-semibold">
                      {b.name.charAt(0)}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{b.name}</p>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                          <span aria-hidden>🚗</span>
                          {b.vehicleCount}
                        </span>
                      </div>
                      {b.location && <p className="text-xs text-muted-foreground">{b.location}</p>}
                    </div>

                    <span
                      className={['text-gray-400 transition-transform', active ? 'rotate-0' : '-rotate-90'].join(' ')}
                    >
                      {active ? '▾' : '▸'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Vehicle table for selected branch */}
          {selected && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold">
                Vehicle List in <span className="text-indigo-700">{selected.name}</span>
              </h3>

              <VendorVehicleList
                branchId={selected.id}
                onRequestAdd={openAdd}
                onRequestEdit={openEdit}
              />
            </div>
          )}

          <div className="flex justify-end">
            <button className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white">
              Skip &amp; Continue
            </button>
          </div>
        </>
      )}

      {/* ------- ADD / EDIT MODE ------- */}
      {mode !== 'list' && selected && (
        <div className="space-y-4">
         
          <VehicleAddEditForm
            mode={mode}
            vendorId={Number(vendorId)}
            branchId={selected.id}
            vehicle={editVehicle || undefined}
            onCancel={backToList}
            onSaved={onSaved}
          />
        </div>
      )}
    </div>
  );
}
