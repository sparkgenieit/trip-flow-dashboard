// REPLACE-FILE: src/components/vendor-tabs/vehicles/VendorVehicleList.tsx
'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { listVendorVehicles, type VehicleRow } from '../services/vendorVehicles';
import { fetchVehicleTypes, initVehicleTypeMap, type VehicleTypeRow } from '../services/vendorPricing';

function fmt(d?: string | null) {
  if (!d) return '';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return '';
  const dd = String(dt.getDate()).padStart(2, '0');
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const yyyy = dt.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

type Props = {
  vendorId: string | number;
  branchId?: string | number;            // reserved if you link vehicles to branches later
  onRequestAdd?: () => void;
  onRequestEdit?: (row: VehicleRow) => void;
  refreshKey?: number;                   // change to force reload after save
};

export default function VendorVehicleList({
  vendorId,
  branchId,
  onRequestAdd,
  onRequestEdit,
  refreshKey,
}: Props) {
  const [rows, setRows] = useState<VehicleRow[]>([]);
  const [vt, setVt] = useState<VehicleTypeRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        await initVehicleTypeMap();
        const [types, vehicles] = await Promise.all([
          fetchVehicleTypes().catch(() => []),
          listVendorVehicles(vendorId),
        ]);
        if (!alive) return;
        setVt(types || []);
        // If you add branch linkage later, filter here by branchId
        setRows(vehicles || []);
      } catch (e) {
        console.error('Failed to load vehicles', e);
        if (alive) setRows([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [vendorId, branchId, refreshKey]);

  const vtNameById = useMemo(() => {
    const m = new Map<number, string>();
    (vt || []).forEach((v) => m.set(v.id, v.name));
    return (id?: number) => (id ? m.get(id) || `#${id}` : '');
  }, [vt]);

  if (loading) {
    return <p className="p-4 text-sm text-muted-foreground">Loading vehicles…</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Vehicle List</h2>
        {onRequestAdd && (
          <button
            type="button"
            onClick={onRequestAdd}
            className="px-3 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            + Add vehicle
          </button>
        )}
      </div>

      <table className="w-full border rounded-md overflow-hidden">
        <thead>
          <tr className="bg-gray-50 text-left text-sm">
            <th className="p-2">#</th>
            <th className="p-2">Vehicle Reg. No</th>
            <th className="p-2">Vehicle Type</th>
            <th className="p-2">FC Expiry Date</th>
            <th className="p-2">Status</th>
            <th className="p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className="p-4 text-center text-sm text-muted-foreground" colSpan={6}>
                No vehicles yet.
              </td>
            </tr>
          ) : (
            rows.map((v, i) => (
              <tr key={v.id} className="border-t text-sm">
                <td className="p-2">{i + 1}</td>
                <td className="p-2">{v.registrationNumber}</td>
                <td className="p-2">{vtNameById(v.vehicleTypeId)}</td>
                <td className="p-2">{fmt(v.vehicleExpiryDate as any)}</td>
                <td className="p-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                      (v as any).status === 'inactive'
                        ? 'bg-gray-200 text-gray-600'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {(v as any).status ?? 'available'}
                  </span>
                </td>
                <td className="p-2">
                  <button
                    type="button"
                    onClick={() => onRequestEdit?.(v)}
                    className="text-indigo-600 hover:text-indigo-700"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
