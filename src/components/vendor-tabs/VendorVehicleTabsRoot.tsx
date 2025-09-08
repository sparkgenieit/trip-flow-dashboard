// src/components/vendor-tabs/VendorVehicleTabsRoot.tsx
'use client';
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import BasicInfoForm from './basic-info/BasicInfoForm';
import BranchesForm from './branches/BranchesForm';
import VehicleTypeTabs from './vehicle-type/VehicleTypeTabs';
import  VendorVehiclesTab from './vehicles/VendorVehiclesTab';
import VehiclePricebookPage from './pricebook/VehiclePricebookPage';
import PermitCostList from './permit/PermitCostList';

type Step = 1 | 2 | 3 | 4 | 5 | 6;

export default function VendorVehicleTabsRoot({
  mode,
  vendorId: vendorIdProp,
}: {
  mode: 'add' | 'edit';
  vendorId?: string;
}) {
  // When adding, we don’t have an id until Step 1 is saved.
  // When editing, we already have one.
  const [vendorId, setVendorId] = useState<string | undefined>(vendorIdProp);
  const [step, setStep] = useState<Step>(1);

  const pageTitle = mode === 'add' ? 'Add Vendor' : 'Edit Vendor';
  const steps = useMemo(
    () => ['Basic Info', 'Branch', 'Vehicle Type', 'Vehicle', 'Vehicle Pricebook', 'Permit'],
    []
  );

  // In ADD mode, lock steps > 1 until vendorId exists
  const isLocked = (target: Step) => mode === 'add' && !vendorId && target > 1;

  const goTo = (target: Step) => {
    if (isLocked(target)) return; // don’t navigate if locked
    setStep(target);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <BasicInfoForm
            mode={mode}
            vendorId={vendorId}
            onSaved={(createdId) => {
              // capture new id the first time we save in ADD flow
              if (!vendorId) setVendorId(createdId);
              // move forward
              setStep(2);
            }}
          />
        );
      case 2:
        return <BranchesForm vendorId={vendorId} />;
      case 3:
        return <VehicleTypeTabs vendorId={vendorId} />;
      case 4:
        return <VendorVehiclesTab vendorId={vendorId} />;
      case 5:
        return <VehiclePricebookPage vendorId={vendorId} />;
      case 6:
        return <PermitCostList vendorId={vendorId} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb + Title */}
      <div className="space-y-1">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <ol className="flex items-center gap-2">
            <li>
              <Link to="/dashboard" className="hover:underline">
                Dashboard
              </Link>
            </li>
            <li>›</li>
            <li>
              <Link to="/dashboard/vendors" className="hover:underline">
                Vendors
              </Link>
            </li>
            <li>›</li>
            <li className="text-foreground">{pageTitle}</li>
          </ol>
        </nav>
        <h1 className="text-xl font-semibold">{pageTitle}</h1>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-4">
        {steps.map((label, idx) => {
          const n = (idx + 1) as Step;
          const locked = isLocked(n);
          const active = step === n;
          return (
            <div key={n} className="flex items-center">
              <button
                onClick={() => goTo(n)}
                aria-disabled={locked}
                disabled={locked}
                className={[
                  'h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold',
                  active ? 'bg-primary text-white' : 'bg-muted text-foreground',
                  locked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
                ].join(' ')}
                title={locked ? 'Save Basic Info first' : label}
              >
                {n}
              </button>
              <button
                onClick={() => goTo(n)}
                aria-disabled={locked}
                disabled={locked}
                className={[
                  'ml-2 text-sm',
                  active ? 'font-semibold' : 'text-muted-foreground',
                  locked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
                ].join(' ')}
                title={locked ? 'Save Basic Info first' : label}
              >
                {label}
              </button>
              {n !== 6 && <div className="w-8 h-[2px] bg-muted mx-2" />}
            </div>
          );
        })}
      </div>

      {/* Body */}
      <div className="bg-white rounded-lg shadow p-4">{renderStep()}</div>
    </div>
  );
}
