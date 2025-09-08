// src/components/vendor-tabs/vehicles/VendorVehicleBranches.tsx
'use client';
import React, { useEffect, useState } from 'react';

interface Branch {
  id: string;
  name: string;
  location: string;
  vehicleCount: number;
}

export default function VendorVehicleBranches({
  vendorId,
  onSelectBranch,
}: {
  vendorId: string;
  onSelectBranch: (branchId: string) => void;
}) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🔹 Replace with real API call
    async function fetchBranches() {
      setLoading(true);
      // Example response
      const res: Branch[] = [
        { id: '1', name: 'DVI-RAMESWARAM', location: 'Rameswaram', vehicleCount: 5 },
        { id: '2', name: 'DVI-CHENNAI', location: 'Chennai', vehicleCount: 3 },
      ];
      setBranches(res);
      setLoading(false);
    }
    fetchBranches();
  }, [vendorId]);

  if (loading) return <p className="p-4 text-sm text-muted-foreground">Loading branches…</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">List of Branches</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {branches.map((b) => (
          <div
            key={b.id}
            className="border rounded-lg p-4 shadow hover:shadow-md cursor-pointer flex items-center justify-between"
            onClick={() => onSelectBranch(b.id)}
          >
            <div>
              <p className="font-medium">{b.name}</p>
              <p className="text-xs text-muted-foreground">{b.location}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-purple-600">
              {b.vehicleCount}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
