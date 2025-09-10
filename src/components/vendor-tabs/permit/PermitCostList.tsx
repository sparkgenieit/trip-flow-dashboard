'use client';

import React, { useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { vtId, upsertPermitCosts } from '../services/vendorPricing';

/* ────────────────────────────────────────────────────────────────────────────
   Constants
   ─────────────────────────────────────────────────────────────────────────── */

type VehicleTypeLite = { id: string; name: string };

// keep a couple of defaults (you can swap for your API later)
const VEHICLE_TYPES: VehicleTypeLite[] = [
  { id: 'sedan', name: 'Sedan' },
  { id: 'muv_6p1', name: 'MUV 6+1' },
  { id: 'innova', name: 'Innova' },
  { id: 'innova_crysta_6p1', name: 'Innova Crysta 6+1' },
  { id: 'tempo_12', name: 'Tempo Traveller 12 Seater' },
];

// 28 states + 8 UTs (names match your screenshots)
const INDIAN_STATES = [
  { code: 'AN', name: 'Andaman and Nicobar Islands' },
  { code: 'AP', name: 'Andhra Pradesh' },
  { code: 'AR', name: 'Arunachal Pradesh' },
  { code: 'AS', name: 'Assam' },
  { code: 'BR', name: 'Bihar' },
  { code: 'CH', name: 'Chandigarh' },
  { code: 'CT', name: 'Chhattisgarh' },
  { code: 'DNDD', name: 'Dadra and Nagar Haveli and Daman and Diu' },
  { code: 'DL', name: 'Delhi' },
  { code: 'GA', name: 'Goa' },
  { code: 'GJ', name: 'Gujarat' },
  { code: 'HR', name: 'Haryana' },
  { code: 'HP', name: 'Himachal Pradesh' },
  { code: 'JH', name: 'Jharkhand' },
  { code: 'KA', name: 'Karnataka' },
  { code: 'KL', name: 'Kerala' },
  { code: 'LD', name: 'Lakshadweep' },
  { code: 'MP', name: 'Madhya Pradesh' },
  { code: 'MH', name: 'Maharashtra' },
  { code: 'MN', name: 'Manipur' },
  { code: 'ML', name: 'Meghalaya' },
  { code: 'MZ', name: 'Mizoram' },
  { code: 'NL', name: 'Nagaland' },
  { code: 'OR', name: 'Odisha' },
  { code: 'PY', name: 'Puducherry' },
  { code: 'PB', name: 'Punjab' },
  { code: 'RJ', name: 'Rajasthan' },
  { code: 'SK', name: 'Sikkim' },
  { code: 'TN', name: 'Tamil Nadu' },
  { code: 'TS', name: 'Telangana' },
  { code: 'TR', name: 'Tripura' },
  { code: 'UP', name: 'Uttar Pradesh' },
  { code: 'UK', name: 'Uttarakhand' },
  { code: 'WB', name: 'West Bengal' },
  // (J&K and Ladakh aren’t in your screenshots, so skipped intentionally)
] as const;

type StateCode = (typeof INDIAN_STATES)[number]['code'];

const rs = (v: string) => (v ? v : '0');
const numOnly = (v: string) => v.replace(/[^\d.]/g, '');

/* ────────────────────────────────────────────────────────────────────────────
   Types
   ─────────────────────────────────────────────────────────────────────────── */

type PermitRecord = {
  id: string;
  vehicleTypeId: string;
  vehicleTypeName: string;
  sourceState: StateCode;
  costs: Record<StateCode, string>; // cost per destination state
};

type ModalMode = 'view' | 'edit';

/* ────────────────────────────────────────────────────────────────────────────
   Component
   ─────────────────────────────────────────────────────────────────────────── */

export default function PermitCostList({
  vendorId,
  onBack,
}: {
  vendorId?: string | number;
  onBack?: () => void;
}) {
  const { toast } = useToast();

  // Add Permit Cost form
  const [vehicleTypeId, setVehicleTypeId] = useState<string>('');
  const [stateCode, setStateCode] = useState<StateCode | ''>('');

  // Table data
  const [rows, setRows] = useState<PermitRecord[]>([]);
  const [search, setSearch] = useState('');

  // Modal
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<ModalMode>('edit');
  const [activeId, setActiveId] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const active = useMemo(
    () => rows.find((r) => r.id === activeId) || null,
    [rows, activeId]
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter(
      (r) =>
        r.vehicleTypeName.toLowerCase().includes(term) ||
        INDIAN_STATES.find((s) => s.code === r.sourceState)?.name
          .toLowerCase()
          .includes(term)
    );
  }, [rows, search]);

  function scrollToTable() {
    setTimeout(() => tableRef.current?.scrollIntoView({ behavior: 'smooth' }), 10);
  }

  /* Add to table */
  const handleSaveAdd = async () => {
  if (!vehicleTypeId || !stateCode) return;
  const vt = VEHICLE_TYPES.find((v) => v.id === vehicleTypeId)!;

  const blank: Record<StateCode, string> = INDIAN_STATES.reduce((acc, s) => {
    acc[s.code] = '0'; return acc;
  }, {} as Record<StateCode, string>);

  const rec: PermitRecord = {
    id: crypto.randomUUID(),
    vehicleTypeId,
    vehicleTypeName: vt.name,
    sourceState: stateCode as StateCode,
    costs: blank,
  };

  setRows((prev) => [...prev, rec]);
  // Persist immediately with zeros (you can update later from modal)
  try {
    await upsertPermitCosts(vendorId!, [{
      vehicleTypeId: vtId(rec.vehicleTypeId),
      sourceState: rec.sourceState,
      costs: Object.fromEntries(Object.entries(rec.costs).map(([k, v]) => [k, Number(v || 0)])),
    }]);
    toast({ title: 'Added', description: 'Permit cost row created.' });
  } catch (e:any) {
    console.error(e);
    toast({ title: 'Error', description: e.message || 'Failed to save' });
  }
  scrollToTable();
};

const saveModal = async () => {
  setOpen(false);
  const rec = active;
  if (!rec || !vendorId) return;
  try {
    await upsertPermitCosts(vendorId, [{
      vehicleTypeId: vtId(rec.vehicleTypeId),
      sourceState: rec.sourceState,
      costs: Object.fromEntries(Object.entries(rec.costs).map(([k, v]) => [k, Number((v as string) || 0)])),
    }]);
    toast({ title: 'Updated', description: 'Permit costs saved.' });
  } catch (e:any) {
    console.error(e);
    toast({ title: 'Error', description: e.message || 'Failed to update' });
  }
};

  /* ──────────────────────────────────────────────────────────────────────────
     Render
     ────────────────────────────────────────────────────────────────────────── */

  const headerBadge =
    typeof vendorId !== 'undefined' ? (
      <span className="text-muted-foreground text-sm">
        Edit Vendor » <span className="font-semibold">Permit Cost</span>
      </span>
    ) : null;

  return (
    <div className="space-y-6">
      {headerBadge}

      {/* Add Permit Cost */}
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-pink-600">Add Permit Cost</h3>
          <div className="hidden md:block">
            <Button variant="secondary" onClick={scrollToTable}>
              Back To List
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label>
              Vehicle Type <span className="text-rose-600">*</span>
            </Label>
            <Select value={vehicleTypeId} onValueChange={setVehicleTypeId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose Vehicle Type" />
              </SelectTrigger>
              <SelectContent>
                {VEHICLE_TYPES.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>
              State <span className="text-rose-600">*</span>
            </Label>
            <Select
              value={stateCode}
              onValueChange={(v) => setStateCode(v as StateCode)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select State" />
              </SelectTrigger>
              <SelectContent>
                {INDIAN_STATES.map((s) => (
                  <SelectItem key={s.code} value={s.code}>
                    {s.code} - {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Button variant="secondary" onClick={scrollToTable}>
            Back To List
          </Button>
          <Button onClick={handleSaveAdd} disabled={!vehicleTypeId || !stateCode}>
            Save
          </Button>
        </div>
      </section>

      {/* Permit Details Table */}
      <section ref={tableRef} className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Permit Details</h3>
          <div className="flex items-center gap-2">
            <Label className="text-sm">Search:</Label>
            <Input
              className="h-9 w-56"
              placeholder="Type to filter…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[800px] w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="p-3 font-medium w-16">S.NO</th>
                <th className="p-3 font-medium w-40">VIEW&EDIT PERMITCOST</th>
                <th className="p-3 font-medium">VEHICLE TYPE</th>
                <th className="p-3 font-medium">SOURCE STATE</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-muted-foreground">
                    No rows yet. Use “Add Permit Cost” above.
                  </td>
                </tr>
              ) : (
                filtered.map((r, i) => {
                  const state = INDIAN_STATES.find((s) => s.code === r.sourceState);
                  return (
                    <tr key={r.id} className="border-t">
                      <td className="p-3">{i + 1}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            title="View"
                            onClick={() => openModal(r.id, 'view')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Edit"
                            onClick={() => openModal(r.id, 'edit')}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Delete"
                            onClick={() => removeRow(r.id)}
                          >
                            <Trash2 className="h-4 w-4 text-rose-600" />
                          </Button>
                        </div>
                      </td>
                      <td className="p-3">{r.vehicleTypeName}</td>
                      <td className="p-3">
                        {r.sourceState} - {state?.name}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer (Prev/Next placeholders to match screenshot spacing) */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Showing {filtered.length ? 1 : 0} to {filtered.length} of {filtered.length} entries
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">Previous</Button>
            <div className="rounded-md border px-3 py-1 text-sm">1</div>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Button variant="secondary" onClick={onBack}>
            Back
          </Button>
          <Button
            onClick={() =>
              toast({ title: 'Submitted', description: 'Permit details submitted.' })
            }
          >
            Submit
          </Button>
        </div>
      </section>

      {/* ───────────────────────── Modal ───────────────────────── */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-base">
              {mode === 'edit' ? 'Update' : 'View'} Permit Cost
            </DialogTitle>
            {active && (
              <div className="mt-1 text-sm">
                Source State :{' '}
                <span className="font-semibold text-pink-600">
                  {INDIAN_STATES.find((s) => s.code === active.sourceState)?.name}
                </span>{' '}
                | Vehicle Type :{' '}
                <span className="font-semibold text-pink-600">
                  {active.vehicleTypeName}
                </span>
              </div>
            )}
          </DialogHeader>

          {/* 3-column grid of states with ₹ inputs */}
          <div className="max-h-[65vh] overflow-auto rounded-lg border p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {active &&
                INDIAN_STATES.map((s) => {
                  const value = rs(active.costs[s.code]);
                  return (
                    <div key={s.code}>
                      <Label>
                        {s.name} <span className="text-rose-600">*</span>
                      </Label>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                          ₹
                        </span>
                        <Input
                          className="pl-7"
                          value={value}
                          inputMode="decimal"
                          onChange={(e) => updateCost(s.code, e.target.value)}
                          disabled={mode === 'view'}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              {mode === 'view' ? 'Close' : 'Cancel'}
            </Button>
            {mode === 'edit' && (
              <Button onClick={saveModal}>Update</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
