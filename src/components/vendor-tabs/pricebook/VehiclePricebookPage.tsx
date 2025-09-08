'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

/** ───────────────────────────────────────────────────────────────────────────
 * Helpers & types
 * ─────────────────────────────────────────────────────────────────────────── */
type VehicleTypeLite = { id: string; name: string };
const DEFAULT_TYPES: VehicleTypeLite[] = [
  { id: 'sedan', name: 'Sedan' },
  { id: 'innova', name: 'Innova' },
];

const numOnly = (v: string) => v.replace(/[^\d.]/g, '');
const toKey = (id: string) => String(id);

type GstType = 'Included' | 'Excluded';
const GST_OPTIONS = [
  { label: 'No GST (0%)', value: '0' },
  { label: '5% GST - %5', value: '5' },
  { label: '12% GST - %12', value: '12' },
  { label: '18% GST - %18', value: '18' },
  { label: '28% GST - %28', value: '28' },
];

/** Driver Cost rows (per type) */
type DriverCostRow = {
  vehicleTypeId: string;
  driverCost: string;
  foodCost: string;
  accommodationCost: string;
  extraCost: string;
  morningCharges: string;
};

/** Extra Cost rows (per type) */
type ExtraCostRow = {
  vehicleTypeId: string;
  extraKm: string;
  extraHour: string;
  earlyMorning: string; // Before 6 AM
  evening: string;      // After 8 PM
};

/** Local / Outstation limit entries (chips) */
type LocalLimit = { id: string; vehicleTypeId: string; title: string; hours: string; km: string };
type OutstationLimit = { id: string; vehicleTypeId: string; title: string; km: string };

type LocalByType = Record<string, LocalLimit[]>;
type OutByType = Record<string, OutstationLimit[]>;
type ChargeByType = Record<string, string>;

/** ───────────────────────────────────────────────────────────────────────────
 * Main component
 * ─────────────────────────────────────────────────────────────────────────── */
export default function VehiclePricebookPage({ vendorId }: { vendorId: number | string }) {
  const { toast } = useToast();

  /** Always show exactly TWO vehicle types (fallback to Sedan + Innova). */
  const [types, setTypes] = useState<VehicleTypeLite[]>(DEFAULT_TYPES);

  // ── Vendor margin section
  const [marginPercent, setMarginPercent] = useState<string>('5');
  const [gstType, setGstType] = useState<GstType>('Included');
  const [gstPercent, setGstPercent] = useState<string>('5');

  // ── Driver cost + Extra cost
  const typeIds = useMemo(() => types.map((t) => toKey(t.id)), [types]);

  const [driverCosts, setDriverCosts] = useState<Record<string, DriverCostRow>>({});
  const [extraCosts, setExtraCosts] = useState<Record<string, ExtraCostRow>>({});

  // ── Local pricebook
  const [localStartDate, setLocalStartDate] = useState('');
  const [localEndDate, setLocalEndDate] = useState('');
  const [localLimits, setLocalLimits] = useState<LocalByType>({});
  const [localCharges, setLocalCharges] = useState<ChargeByType>({});
  const [openLocal, setOpenLocal] = useState(false);

  // ── Outstation pricebook
  const [outStartDate, setOutStartDate] = useState('');   // NEW
  const [outEndDate, setOutEndDate] = useState('');       // NEW
  const [outCharges, setOutCharges] = useState<ChargeByType>({});
  const [outLimits, setOutLimits] = useState<OutByType>({});
  const [openOut, setOpenOut] = useState(false);

  // ───────────────────────────────────────────────────────────────────────────
  // Init with exactly TWO rows (Sedan & Innova) OR from your API (first two)
  // ───────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    // If you later want to load from API, slice to 2:
    // const fetched: VehicleTypeLite[] = await fetch(...);
    // setTypes((fetched && fetched.length) ? fetched.slice(0, 2) : DEFAULT_TYPES);

    const blankDrivers: Record<string, DriverCostRow> = {};
    const blankExtras: Record<string, ExtraCostRow> = {};
    const blanksLocal: LocalByType = {};
    const blanksOut: OutByType = {};
    const blanksLocalCharge: ChargeByType = {};
    const blanksOutCharge: ChargeByType = {};

    DEFAULT_TYPES.slice(0, 2).forEach((t) => {
      const k = toKey(t.id);
      blankDrivers[k] = {
        vehicleTypeId: k,
        driverCost: '0',
        foodCost: '0',
        accommodationCost: '0',
        extraCost: '0',
        morningCharges: '0',
      };
      blankExtras[k] = {
        vehicleTypeId: k,
        extraKm: '0',
        extraHour: '0',
        earlyMorning: '0',
        evening: '0',
      };
      blanksLocal[k] = [];
      blanksOut[k] = [];
      blanksLocalCharge[k] = '';
      blanksOutCharge[k] = '';
    });

    setDriverCosts(blankDrivers);
    setExtraCosts(blankExtras);
    setLocalLimits(blanksLocal);
    setOutLimits(blanksOut);
    setLocalCharges(blanksLocalCharge);
    setOutCharges(blanksOutCharge);
  }, []);

  /** Update helpers */
  const updateDriver = (id: string, key: keyof DriverCostRow, v: string) =>
    setDriverCosts((prev) => ({ ...prev, [id]: { ...prev[id], [key]: numOnly(v) } }));

  const updateExtra = (id: string, key: keyof ExtraCostRow, v: string) =>
    setExtraCosts((prev) => ({ ...prev, [id]: { ...prev[id], [key]: numOnly(v) } }));

  /** Local modal state */
  const [localForm, setLocalForm] = useState<{ typeId: string; title: string; hours: string; km: string }>({
    typeId: '',
    title: '',
    hours: '',
    km: '',
  });

  /** Outstation modal state */
  const [outForm, setOutForm] = useState<{ typeId: string; title: string; km: string }>({
    typeId: '',
    title: '',
    km: '',
  });

  /** Add Local limit */
  const addLocalLimit = () => {
    const { typeId, title, hours, km } = localForm;
    if (!typeId || !title || !hours || !km) return;
    setLocalLimits((prev) => ({
      ...prev,
      [typeId]: [...(prev[typeId] || []), { id: crypto.randomUUID(), vehicleTypeId: typeId, title, hours: numOnly(hours), km: numOnly(km) }],
    }));
    setLocalForm({ typeId: '', title: '', hours: '', km: '' });
    setOpenLocal(false);
  };

  /** Add Outstation limit */
  const addOutLimit = () => {
    const { typeId, title, km } = outForm;
    if (!typeId || !title || !km) return;
    setOutLimits((prev) => ({
      ...prev,
      [typeId]: [...(prev[typeId] || []), { id: crypto.randomUUID(), vehicleTypeId: typeId, title, km: numOnly(km) }],
    }));
    setOutForm({ typeId: '', title: '', km: '' });
    setOpenOut(false);
  };

  /** Remove chips */
  const removeLocal = (typeId: string, id: string) =>
    setLocalLimits((p) => ({ ...p, [typeId]: (p[typeId] || []).filter((x) => x.id !== id) }));

  const removeOut = (typeId: string, id: string) =>
    setOutLimits((p) => ({ ...p, [typeId]: (p[typeId] || []).filter((x) => x.id !== id) }));

  /** Saves (wire to your API later) */
  const saveMargin = async () => {
    toast({ title: 'Updated', description: 'Vendor margin saved.' });
  };
  const saveDriverCosts = async () => {
    toast({ title: 'Updated', description: 'Driver cost details saved.' });
  };
  const saveExtraCosts = async () => {
    toast({ title: 'Updated', description: 'Vehicle extra cost details saved.' });
  };
  const saveLocal = async () => {
    toast({ title: 'Updated', description: 'Local pricebook saved.' });
  };
  const saveOut = async () => {
    toast({ title: 'Updated', description: 'Outstation pricebook saved.' });
  };

  /** ─────────────────────────────────────────────────────────────────────────
   * Render
   * ───────────────────────────────────────────────────────────────────────── */
  return (
    <div className="space-y-8">
      {/* Header note */}
      <div className="text-sm text-muted-foreground">
        Vehicle Pricebook page for <span className="font-medium text-foreground">{vendorId}</span>
      </div>

      {/* Vendor Margin Details */}
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Vendor Margin Details</h3>
          <Button onClick={saveMargin}>Update</Button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <Label>Vendor Margin %</Label>
            <Input
              placeholder="5"
              value={marginPercent}
              onChange={(e) => setMarginPercent(numOnly(e.target.value))}
              inputMode="decimal"
            />
          </div>

          <div>
            <Label>Vendor Margin GST Type</Label>
            <Select value={gstType} onValueChange={(v) => setGstType(v as GstType)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Included">Included</SelectItem>
                <SelectItem value="Excluded">Excluded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Vendor Margin GST Percentage</Label>
            <Select value={gstPercent} onValueChange={(v) => setGstPercent(v)}>
              <SelectTrigger><SelectValue placeholder="Select GST" /></SelectTrigger>
              <SelectContent>
                {GST_OPTIONS.map((g) => (
                  <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Driver Cost Details (2 vehicle types with text boxes) */}
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Driver Cost Details</h3>
          <Button onClick={saveDriverCosts}>Update</Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {types.slice(0, 2).map((t) => {
            const k = toKey(t.id);
            const row = driverCosts[k];
            return (
              <div key={k} className="rounded-xl border p-4">
                <div className="mb-3 text-base font-semibold">{t.name}</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Driver Cost (₹)</Label>
                    <Input value={row?.driverCost ?? ''} inputMode="decimal"
                      onChange={(e) => updateDriver(k, 'driverCost', e.target.value)} />
                  </div>
                  <div>
                    <Label>Food Cost (₹)</Label>
                    <Input value={row?.foodCost ?? ''} inputMode="decimal"
                      onChange={(e) => updateDriver(k, 'foodCost', e.target.value)} />
                  </div>
                  <div>
                    <Label>Accommodation Cost (₹)</Label>
                    <Input value={row?.accommodationCost ?? ''} inputMode="decimal"
                      onChange={(e) => updateDriver(k, 'accommodationCost', e.target.value)} />
                  </div>
                  <div>
                    <Label>Extra Cost (₹)</Label>
                    <Input value={row?.extraCost ?? ''} inputMode="decimal"
                      onChange={(e) => updateDriver(k, 'extraCost', e.target.value)} />
                  </div>
                  <div>
                    <Label>Morning Charges (₹)</Label>
                    <Input value={row?.morningCharges ?? ''} inputMode="decimal"
                      onChange={(e) => updateDriver(k, 'morningCharges', e.target.value)} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Vehicle Extra Cost Details (2 vehicle types with text boxes) */}
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Vehicle Extra Cost Details</h3>
          <Button onClick={saveExtraCosts}>Update</Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {types.slice(0, 2).map((t) => {
            const k = toKey(t.id);
            const row = extraCosts[k];
            return (
              <div key={k} className="rounded-xl border p-4">
                <div className="mb-3 text-base font-semibold">{t.name}</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Extra KM Charge (₹)</Label>
                    <Input value={row?.extraKm ?? ''} inputMode="decimal"
                      onChange={(e) => updateExtra(k, 'extraKm', e.target.value)} />
                  </div>
                  <div>
                    <Label>Extra Hour Charge (₹)</Label>
                    <Input value={row?.extraHour ?? ''} inputMode="decimal"
                      onChange={(e) => updateExtra(k, 'extraHour', e.target.value)} />
                  </div>
                  <div>
                    <Label>Early Morning (₹) (Before 6 AM)</Label>
                    <Input value={row?.earlyMorning ?? ''} inputMode="decimal"
                      onChange={(e) => updateExtra(k, 'earlyMorning', e.target.value)} />
                  </div>
                  <div>
                    <Label>Evening Charges (₹) (After 8 PM)</Label>
                    <Input value={row?.evening ?? ''} inputMode="decimal"
                      onChange={(e) => updateExtra(k, 'evening', e.target.value)} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Local Pricebook */}
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">Vehicle Rental Cost Details | Local Pricebook</h3>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={() => setOpenLocal(true)}>+ Add KM Limit</Button>
            <div className="flex items-center gap-2">
              <Label className="whitespace-nowrap">Start Date</Label>
              <Input type="date" value={localStartDate} onChange={(e) => setLocalStartDate(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <Label className="whitespace-nowrap">End Date</Label>
              <Input type="date" value={localEndDate} onChange={(e) => setLocalEndDate(e.target.value)} />
            </div>
            <Button onClick={saveLocal}>Update</Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {types.slice(0, 2).map((t) => {
            const k = toKey(t.id);
            const chips = localLimits[k] || [];
            return (
              <div key={k} className="rounded-xl border p-4">
                <div className="mb-3 text-base font-semibold">{t.name}</div>

                {/* chips */}
                <div className="mb-3 flex flex-wrap gap-2">
                  {chips.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No KM limits added yet.</div>
                  ) : (
                    chips.map((c) => (
                      <span key={c.id} className="inline-flex items-center gap-2 rounded-full bg-pink-50 px-3 py-1 text-xs font-medium">
                        {c.title} — {c.hours} hrs / {c.km} km
                        <button className="ml-1 text-gray-500 hover:text-gray-700" onClick={() => removeLocal(k, c.id)} aria-label="Remove">✕</button>
                      </span>
                    ))
                  )}
                </div>

                {/* Rental charge */}
                <div className="max-w-xs">
                  <Label>Rental Charge (₹)</Label>
                  <Input value={localCharges[k] || ''} onChange={(e) =>
                    setLocalCharges((p) => ({ ...p, [k]: numOnly(e.target.value) }))
                  } inputMode="decimal" placeholder="Enter the Rental Charge" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Outstation Pricebook */}
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">Vehicle Rental Cost Details | Outstation Pricebook</h3>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={() => setOpenOut(true)}>+ Add KM Limit</Button>
            {/* NEW: Start/End Date to match screenshots */}
            <div className="flex items-center gap-2">
              <Label className="whitespace-nowrap">Start Date</Label>
              <Input type="date" value={outStartDate} onChange={(e) => setOutStartDate(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <Label className="whitespace-nowrap">End Date</Label>
              <Input type="date" value={outEndDate} onChange={(e) => setOutEndDate(e.target.value)} />
            </div>
            <Button onClick={saveOut}>Update</Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {types.slice(0, 2).map((t) => {
            const k = toKey(t.id);
            const chips = outLimits[k] || [];
            return (
              <div key={k} className="rounded-xl border p-4">
                {/* row-style like screenshot: name | list | input */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:items-start">
                  <div className="text-base font-semibold text-pink-600 underline underline-offset-2">{t.name}</div>

                  <div className="min-h-[38px]">
                    {chips.length === 0 ? (
                      <div className="text-sm text-muted-foreground">Outstation KM Limit</div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {chips.map((c) => (
                          <span key={c.id} className="inline-flex items-center gap-1 text-pink-600 font-medium">
                            {c.km} KM
                            <button className="ml-1 text-gray-500 hover:text-gray-700" onClick={() => removeOut(k, c.id)} aria-label="Remove">✕</button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="max-w-xs">
                    <Label>Rental Charge (₹)</Label>
                    <Input value={outCharges[k] || ''} onChange={(e) =>
                      setOutCharges((p) => ({ ...p, [k]: numOnly(e.target.value) }))
                    } inputMode="decimal" placeholder="Enter the Rental Charge" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4">
          <Button variant="secondary">Back</Button>
        </div>
      </section>

      {/* ─────────────────────── Popups ─────────────────────── */}

      {/* Add Local KM Limit */}
      <Dialog open={openLocal} onOpenChange={setOpenLocal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Add Local KM Limit</DialogTitle></DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Vehicle type *</Label>
              <Select value={localForm.typeId} onValueChange={(v) => setLocalForm((f) => ({ ...f, typeId: v }))}>
                <SelectTrigger><SelectValue placeholder="Choose Vehicle Type" /></SelectTrigger>
                <SelectContent>
                  {types.slice(0, 2).map((t) => (
                    <SelectItem key={t.id} value={toKey(t.id)}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Title *</Label>
              <Input placeholder="Enter Title" value={localForm.title}
                     onChange={(e) => setLocalForm((f) => ({ ...f, title: e.target.value }))} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Hours *</Label>
                <Input placeholder="Enter Hours" inputMode="decimal" value={localForm.hours}
                       onChange={(e) => setLocalForm((f) => ({ ...f, hours: numOnly(e.target.value) }))} />
              </div>
              <div>
                <Label>Kilometer (KM) *</Label>
                <Input placeholder="KM Limit" inputMode="decimal" value={localForm.km}
                       onChange={(e) => setLocalForm((f) => ({ ...f, km: numOnly(e.target.value) }))} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setOpenLocal(false)}>Cancel</Button>
            <Button type="button" onClick={addLocalLimit} disabled={!localForm.typeId || !localForm.title || !localForm.hours || !localForm.km}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Outstation KM Limit */}
      <Dialog open={openOut} onOpenChange={setOpenOut}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Update Outstation KM Limit</DialogTitle></DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Vehicle type *</Label>
              <Select value={outForm.typeId} onValueChange={(v) => setOutForm((f) => ({ ...f, typeId: v }))}>
                <SelectTrigger><SelectValue placeholder="Choose Vehicle Type" /></SelectTrigger>
                <SelectContent>
                  {types.slice(0, 2).map((t) => (
                    <SelectItem key={t.id} value={toKey(t.id)}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Outstation KM Limit Title *</Label>
              <Input placeholder="Outstation KM Limit Title" value={outForm.title}
                     onChange={(e) => setOutForm((f) => ({ ...f, title: e.target.value }))} />
            </div>

            <div>
              <Label>Outstation KM Limit *</Label>
              <Input placeholder="Outstation KM Limit" inputMode="decimal" value={outForm.km}
                     onChange={(e) => setOutForm((f) => ({ ...f, km: numOnly(e.target.value) }))} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setOpenOut(false)}>Cancel</Button>
            <Button type="button" onClick={addOutLimit} disabled={!outForm.typeId || !outForm.title || !outForm.km}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
