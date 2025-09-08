'use client';
import React, { useEffect, useState } from 'react';

export interface Vehicle {
  id: string;
  regNo: string;
  type: string;
  expiry: string;
  status: boolean;
}

type Props = {
  branchId: string;
  /** Called when parent wants to show the "Add Vehicle" form (optional hook). */
  onRequestAdd?: () => void;
  /** Called when user clicks Edit on a row. */
  onRequestEdit?: (row: Vehicle) => void;
};

export default function VendorVehicleList({
  branchId,
  onRequestAdd,
  onRequestEdit,
}: Props) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🔹 Replace with real API call using branchId
    async function fetchVehicles() {
      setLoading(true);
      const res: Vehicle[] = [
        { id: '1', regNo: 'TN65A0500', type: 'Sedan',   expiry: '31/08/2050', status: true },
        { id: '2', regNo: 'TN65A0400', type: 'MUV 6+1', expiry: '31/08/2050', status: true },
      ];
      setVehicles(res);
      setLoading(false);
    }
    fetchVehicles();
  }, [branchId]);

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
          {vehicles.map((v, i) => (
            <tr key={v.id} className="border-t text-sm">
              <td className="p-2">{i + 1}</td>
              <td className="p-2">{v.regNo}</td>
              <td className="p-2">{v.type}</td>
              <td className="p-2">{v.expiry}</td>
              <td className="p-2">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                    v.status
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {v.status ? 'Active' : 'Inactive'}
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
          ))}
        </tbody>
      </table>
    </div>
  );
}
