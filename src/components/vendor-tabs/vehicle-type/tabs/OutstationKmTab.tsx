'use client';
import React, { useState } from 'react';

type OutstationItem = {
  id?: string;
  vehicleType: string;
  title: string;   // Outstation KM Limit Title
  kmLimit: number | '';
};

export default function OutstationKmTab({ vendorId }: { vendorId: string }) {
  const [items, setItems] = useState<OutstationItem[]>([]);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [form, setForm] = useState<OutstationItem>({
    vehicleType: '',
    title: '',
    kmLimit: '',
  });

  const set = (k: keyof OutstationItem, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const addNew = () => {
    setForm({ vehicleType: '', title: '', kmLimit: '' });
    setIsEditing(false);
    setEditingIndex(null);
    setOpen(true);
  };

  const editRow = (idx: number) => {
    const row = items[idx];
    setForm({ vehicleType: row.vehicleType, title: row.title, kmLimit: row.kmLimit });
    setIsEditing(true);
    setEditingIndex(idx);
    setOpen(true);
  };

  const removeRow = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const save = () => {
    const normalized: OutstationItem = {
      ...form,
      kmLimit: Number(form.kmLimit || 0),
    };

    if (isEditing && editingIndex !== null) {
      setItems((prev) => {
        const copy = [...prev];
        copy[editingIndex] = { ...copy[editingIndex], ...normalized };
        return copy;
      });
    } else {
      setItems((prev) => [...prev, { ...normalized, id: String(Date.now()) }]);
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
          + Add Outstation KM Limit
        </button>
      </div>

      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">#</th>
            <th>Vehicle Type</th>
            <th>Outstation KM Limit Title</th>
            <th>Outstation KM Limit</th>
            <th className="w-32">Action</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td className="p-3 text-center text-gray-500" colSpan={5}>
                No rows yet. Click “Add Outstation KM Limit” to create one.
              </td>
            </tr>
          ) : (
            items.map((it, i) => (
              <tr key={it.id ?? i} className="border-t">
                <td className="p-2">{i + 1}</td>
                <td>{it.vehicleType}</td>
                <td>{it.title}</td>
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
            <h2 className="text-lg font-semibold mb-4">Update Outstation KM Limit</h2>

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
                  <option value="Sedan">Sedan</option>
                  <option value="MUV 6+1">MUV 6+1</option>
                  <option value="Innova">Innova</option>
                  <option value="Innova Crysta 6+1">Innova Crysta 6+1</option>
                  <option value="Tempo Traveller 12 Seater">Tempo Traveller 12 Seater</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Outstation KM Limit Title <span className="text-rose-600">*</span>
                </label>
                <input
                  className="border px-3 py-2 w-full rounded"
                  placeholder="Outstation KM Limit Title"
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Outstation KM Limit <span className="text-rose-600">*</span>
                </label>
                <input
                  className="border px-3 py-2 w-full rounded"
                  placeholder="Outstation KM Limit"
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
