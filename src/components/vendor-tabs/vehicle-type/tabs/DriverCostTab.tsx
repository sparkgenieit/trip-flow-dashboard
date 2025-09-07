'use client';
import React, { useState } from 'react';

interface DriverCost {
  id?: string;
  vehicleType: string;
  driverBhatta: number | '';
  foodCost: number | '';
  accomCost: number | '';
  extraCost: number | '';
  morningCharges: number | '';
  eveningCharges: number | '';
}

export default function DriverCostTab({ vendorId }: { vendorId: string }) {
  const [items, setItems] = useState<DriverCost[]>([]);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [form, setForm] = useState<DriverCost>({
    vehicleType: '',
    driverBhatta: '',
    foodCost: '',
    accomCost: '',
    extraCost: '',
    morningCharges: '',
    eveningCharges: '',
  });

  const set = (k: keyof DriverCost, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const addNew = () => {
    setForm({
      vehicleType: '',
      driverBhatta: '',
      foodCost: '',
      accomCost: '',
      extraCost: '',
      morningCharges: '',
      eveningCharges: '',
    });
    setIsEditing(false);
    setEditingIndex(null);
    setOpen(true);
  };

  const editRow = (idx: number) => {
    const row = items[idx];
    setForm({ ...row });
    setIsEditing(true);
    setEditingIndex(idx);
    setOpen(true);
  };

  const removeRow = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const save = () => {
    const normalized: DriverCost = {
      ...form,
      driverBhatta: Number(form.driverBhatta || 0),
      foodCost: Number(form.foodCost || 0),
      accomCost: Number(form.accomCost || 0),
      extraCost: Number(form.extraCost || 0),
      morningCharges: Number(form.morningCharges || 0),
      eveningCharges: Number(form.eveningCharges || 0),
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
          + Add Vehicle Type – Driver Cost
        </button>
      </div>

      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">#</th>
            <th>Vehicle Type</th>
            <th>Driver Bhatta (₹)</th>
            <th>Food Cost (₹)</th>
            <th>Accomodation Cost (₹)</th>
            <th>Extra Cost (₹)</th>
            <th>Morning / hr (₹)</th>
            <th>Evening / hr (₹)</th>
            <th className="w-32">Action</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td className="p-3 text-center text-gray-500" colSpan={9}>
                No rows yet. Click “Add Vehicle Type – Driver Cost” to create one.
              </td>
            </tr>
          ) : (
            items.map((it, i) => (
              <tr key={it.id ?? i} className="border-t">
                <td className="p-2">{i + 1}</td>
                <td>{it.vehicleType}</td>
                <td>{it.driverBhatta}</td>
                <td>{it.foodCost}</td>
                <td>{it.accomCost}</td>
                <td>{it.extraCost}</td>
                <td>{it.morningCharges}</td>
                <td>{it.eveningCharges}</td>
                <td>
                  <div className="flex gap-2">
                    <button
                      onClick={() => editRow(i)}
                      className="px-2 py-1 border rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => removeRow(i)}
                      className="px-2 py-1 bg-rose-600 text-white rounded"
                    >
                      Delete
                    </button>
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
          <div className="bg-white p-6 rounded shadow w-[680px]">
            <h2 className="text-lg font-semibold mb-4">
              Vehicle Type - Driver Cost
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Vehicle type */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Vehicle type <span className="text-rose-600">*</span>
                </label>
                <select
                  className="border px-3 py-2 w-full rounded"
                  value={form.vehicleType}
                  onChange={(e) => set('vehicleType', e.target.value)}
                >
                  <option value="">Choose Any One</option>
                  <option value="Sedan">Sedan</option>
                  <option value="MUV 6+1">MUV 6+1</option>
                  <option value="Innova">Innova</option>
                  <option value="Innova Crysta 6+1">Innova Crysta 6+1</option>
                  <option value="Tempo Traveller 12 Seater">
                    Tempo Traveller 12 Seater
                  </option>
                </select>
              </div>

              {/* Driver Bhatta */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Driver Bhatta (₹) <span className="text-rose-600">*</span>
                </label>
                <input
                  className="border px-3 py-2 w-full rounded"
                  placeholder="Driver Bhatta"
                  type="number"
                  value={form.driverBhatta}
                  onChange={(e) => set('driverBhatta', e.target.value)}
                />
              </div>

              {/* Driver Food Cost */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Driver Food Cost (₹) <span className="text-rose-600">*</span>
                </label>
                <input
                  className="border px-3 py-2 w-full rounded"
                  placeholder="Food Cost"
                  type="number"
                  value={form.foodCost}
                  onChange={(e) => set('foodCost', e.target.value)}
                />
              </div>

              {/* Driver Accomodation Cost */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Driver Accomodation Cost (₹) <span className="text-rose-600">*</span>
                </label>
                <input
                  className="border px-3 py-2 w-full rounded"
                  placeholder="Accomodation Cost"
                  type="number"
                  value={form.accomCost}
                  onChange={(e) => set('accomCost', e.target.value)}
                />
              </div>

              {/* Extra Cost */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Extra Cost (₹) <span className="text-rose-600">*</span>
                </label>
                <input
                  className="border px-3 py-2 w-full rounded"
                  placeholder="Extra Cost"
                  type="number"
                  value={form.extraCost}
                  onChange={(e) => set('extraCost', e.target.value)}
                />
              </div>

              {/* Early Morning Charges Per Hour (Before 6 AM) */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Early Morning Charges Per Hour (Before 6 AM) (₹){' '}
                  <span className="text-rose-600">*</span>
                </label>
                <input
                  className="border px-3 py-2 w-full rounded"
                  placeholder="Early Morning Charges"
                  type="number"
                  value={form.morningCharges}
                  onChange={(e) => set('morningCharges', e.target.value)}
                />
              </div>

              {/* Evening Charges Per Hour (After 8 PM) */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Evening Charges Per Hour (After 8 PM) (₹){' '}
                  <span className="text-rose-600">*</span>
                </label>
                <input
                  className="border px-3 py-2 w-full rounded"
                  placeholder="Evening Charges"
                  type="number"
                  value={form.eveningCharges}
                  onChange={(e) => set('eveningCharges', e.target.value)}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={save}
                className="px-4 py-2 bg-indigo-600 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
