// REPLACE-FILE: src/components/vendor-tabs/vehicles/VendorVehicleBranches.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { listVendorBranches } from '../services/vendorVehicles'; // ← services path aligned with your other files

type BranchRow = {
  id: number;
  name: string;
  location?: string | null;
};

export default function VendorVehicleBranches({
  vendorId,
  onSelectBranch,
}: {
  vendorId: string | number;
  onSelectBranch: (branchId: string) => void;
}) {
  const [branches, setBranches] = useState<BranchRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const rows = await listVendorBranches(vendorId);
        if (alive) setBranches(rows || []);
      } catch (e) {
        console.error('Failed to load branches', e);
        if (alive) setBranches([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [vendorId]);

  if (loading) {
    return <p className="p-4 text-sm text-muted-foreground">Loading branches…</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">List of Branches</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {branches.map((b) => (
          <button
            key={b.id}
            type="button"
            className="border rounded-lg p-4 shadow hover:shadow-md cursor-pointer flex items-center justify-between bg-white"
            onClick={() => onSelectBranch(String(b.id))}
          >
            <div>
              <p className="font-medium">{b.name}</p>
              <p className="text-xs text-muted-foreground">{b.location ?? ''}</p>
            </div>
            {/* If you later add per-branch vehicle counts, render them here */}
          </button>
        ))}
      </div>
    </div>
  );
}
