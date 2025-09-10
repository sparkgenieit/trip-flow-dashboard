'use client';
import React, { useEffect, useState } from 'react';
import {
  initVehicleTypeMap,
  fetchVehicleTypes,
  replaceLocalLimits,
  vtId,
  type VehicleTypeRow,
} from '../../services/vendorPricing';
import { useToast } from '@/hooks/use-toast';

type LocalItem = {
  id?: string;
  vehicleType: string;
  title: string;     // e.g., 8H/80KM
  hours: number | '';
  kmLimit: number | '';
};

export default function LocalKmTab({ vendorId }: { vendorId: string }) {
  const [items, setItems] = useState<LocalItem[]>([]);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [form, setForm] = useState<LocalItem>({
    vehicleType: '',
    title: '',
    hours: '',
    kmLimit: '',
  });

  const [vehicleTypes, setVehicleTypes] = useState<VehicleTypeRow[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        await initVehicleTypeMap();
        const rows = await fetchVehicleTypes();
        if (alive) setVehicleTypes(rows || []);
      } catch (e) {
        console.error('vehicle-types load failed', e);
        setVehicleTypes([]);
      }
    })();
    return () => { alive = false; };
  }, []);

  const set = (k: keyof LocalItem, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const addNew = () => {
    setForm({ vehicleType: '', title: '', hours: '', kmLimit: '' });
    setIsEditing(false);
    setEditingIndex(null);
    setOpen(true);
  };

  const editRow = (idx: number) => {
    const row = items[idx];
    setForm({ vehicleType: row.vehicleType, title: row.title, hours: row.hours, kmLimit: row.kmLimit });
    setIsEditing(true);
    setEditingIndex(idx);
    setOpen(true);
  };

  const removeRow = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const { toast } = useToast();
const save = async () => {
  const normalized: LocalItem = {
    ...form,
    hours: Number(form.hours || 0),
    kmLimit: Number(form.kmLimit || 0),
  };

  // update UI list
  if (isEditing && editingIndex !== null) {
    setItems((prev) => {
      const copy = [...prev];
      copy[editingIndex] = { ...copy[editingIndex], ...normalized };
      return copy;
    });
  } else {
    setItems((prev) => [...prev, { ...normalized, id: String(Date.now()) }]);
  }

  // persist ALL rows currently in items (replace strategy)
  try {
    const rows = ([
      // include the just-edited/added row
      ...items.filter((_, idx) => !(isEditing && idx === editingIndex)),
      { ...normalized, vehicleType: normalized.vehicleType },
    ]).map((it) => ({
      vehicleTypeId: vtId(it.vehicleType),
      title: it.title,
      hours: Number(it.hours || 0),
      km: Number(it.kmLimit || 0),
    }));
    await replaceLocalLimits(vendorId, rows);
    toast({ title: 'Saved', description: 'Local KM limits saved.' });
  } catch (e: any) {
    toast({ title: 'Error', description: e?.message ?? 'Failed to save Local limits' });
  }

  setOpen(false);
};

  return (
    <div>
      <div className="flex justify-end mb-2">
        <button
          className="bg-indigo-600 text-white px-3 py-1 rounded"
          onClick={addNew}
        >
          + Add Local KM Limit
        </button>
      </div>

      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">#</th>
            <th>Vehicle Type</th>
            <th>Title</th>
            <th>Hours</th>
            <th>KM</th>
            <th className="w-32">Action</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td className="p-3 text-center text-gray-500" colSpan={6}>
                No data available in table
              </td>
            </tr>
          ) : (
            items.map((it, i) => (
              <tr key={it.id ?? i} className="border-t">
                <td className="p-2">{i + 1}</td>
                <td>{it.vehicleType}</td>
                <td>{it.title}</td>
                <td>{it.hours}</td>
                <td>{it.kmLimit}</td>
                <td>
                  <div className="flex gap-2">
                    <button onClick={() => editRow(i)} className="px-2 py-1 border rounded">Edit</button>
                    <button onClick={() => removeRow(i)} className="px-2 py-1 bg-rose-600 text-white rounded">Delete</button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Modal with exact labels */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-[560px]">
            <h2 className="text-lg font-semibold mb-4">Update Local KM Limit</h2>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Vehicle type <span className="text-rose-600">*</span>
                </label>
                <select
                  className="border px-3 py-2 w-full rounded"
                  value={form.vehicleType}
                  onChange={(e) => set('vehicleType', e.target.value)}
                >
                  <option value="">Choose Vehicle Type</option>
                  {vehicleTypes.map((vt) => (
                    <option key={vt.id} value={vt.name}>
                      {vt.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Title <span className="text-rose-600">*</span>
                </label>
                <input
                  className="border px-3 py-2 w-full rounded"
                  placeholder="Enter Title"
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Hours <span className="text-rose-600">*</span>
                </label>
                <input
                  className="border px-3 py-2 w-full rounded"
                  placeholder="Enter Hours"
                  type="number"
                  value={form.hours}
                  onChange={(e) => set('hours', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Kilometer (KM) <span className="text-rose-600">*</span>
                </label>
                <input
                  className="border px-3 py-2 w-full rounded"
                  placeholder="KM Limit"
                  type="number"
                  value={form.kmLimit}
                  onChange={(e) => set('kmLimit', e.target.value)}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
              <button onClick={save} className="px-4 py-2 bg-indigo-600 text-white rounded">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
