'use client';
import React, { useState } from 'react';
import DriverCostTab from './tabs/DriverCostTab';
import OutstationKmTab from './tabs/OutstationKmTab';
import LocalKmTab from './tabs/LocalKmTab';

const TABS = [
  { key: 'driver', label: 'Driver Cost' },
  { key: 'outstation', label: 'Outstation KM Limit' },
  { key: 'local', label: 'Local KM Limit' },
];

export default function VehicleTypeTabs({ vendorId }: { vendorId: string }) {
  const [active, setActive] = useState<'driver' | 'outstation' | 'local'>('driver');

  return (
    <div>
      {/* --- Tab headers --- */}
      <div className="border-b mb-4 flex gap-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key as any)}
            className={`pb-2 ${
              active === t.key ? 'border-b-2 border-indigo-600 font-medium text-indigo-600' : 'text-gray-500'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* --- Tab content --- */}
      {active === 'driver' && <DriverCostTab vendorId={vendorId} />}
      {active === 'outstation' && <OutstationKmTab vendorId={vendorId} />}
      {active === 'local' && <LocalKmTab vendorId={vendorId} />}
    </div>
  );
}
