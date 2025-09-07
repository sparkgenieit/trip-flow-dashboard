'use client';
import React, { useEffect, useMemo, useState } from 'react';

type Branch = {
  id?: string;                // server id (optional)
  name: string;               // Branch Name
  location: string;           // Branch Location
  email: string;
  primaryMobile: string;
  altMobile: string;
  country: string;
  state: string;
  city: string;
  pincode: string;
  gstType: 'Included' | 'Excluded';
  gstPercent: '5 % GST - %5' | '12 % GST - %12' | '18 % GST - %18';
  address: string;
  _localKey: string;          // stable key for list rendering
};

/** ------------- Replace these with your real API calls ------------- */
async function apiFetchBranches(vendorId?: string): Promise<Branch[]> {
  if (!vendorId) return [];
  // Mock one pre-filled branch like your screenshot
  return [
    {
      id: 'b1',
      name: 'DVI-RAMESWARAM',
      location: 'RAMESWARAM',
      email: 'vsr@dvi.co.in',
      primaryMobile: '9047776899',
      altMobile: '9047776899',
      country: 'India',
      state: 'Tamil Nadu',
      city: 'Rameswaram',
      pincode: '62362',
      gstType: 'Included',
      gstPercent: '5 % GST - %5',
      address: 'rameswaram',
      _localKey: 'b1',
    },
  ];
}
async function apiUpsertBranches(vendorId: string, branches: Branch[]) {
  // Send to your backend. On success, return normalized branches (with ids)
  return new Promise<Branch[]>((resolve) =>
    setTimeout(() => {
      resolve(
        branches.map((b, i) => ({
          ...b,
          id: b.id ?? `new-${i}`,
        }))
      );
    }, 400)
  );
}
/** ------------------------------------------------------------------ */

function newEmptyBranch(): Branch {
  return {
    name: '',
    location: '',
    email: '',
    primaryMobile: '',
    altMobile: '',
    country: 'India',
    state: '',
    city: '',
    pincode: '',
    gstType: 'Included',
    gstPercent: '5 % GST - %5',
    address: '',
    _localKey: Math.random().toString(36).slice(2),
  };
}

export default function BranchesForm({ vendorId }: { vendorId?: string }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const data = await apiFetchBranches(vendorId);
      if (!mounted) return;
      setBranches(data.length ? data : [newEmptyBranch()]);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [vendorId]);

  const canAdd = useMemo(() => branches.length < 10, [branches.length]);

  const updateField = (idx: number, key: keyof Branch, value: any) => {
    setBranches((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [key]: value };
      return copy;
    });
  };

  const addBranch = () => {
    if (!canAdd) return;
    setBranches((prev) => [...prev, newEmptyBranch()]);
  };

  const removeBranch = (idx: number) => {
    setBranches((prev) => prev.filter((_, i) => i !== idx));
  };

  const saveAll = async () => {
    if (!vendorId) return; // vendor must be created in Step 1
    setSaving(true);
    try {
      const cleaned = branches.map((b) => ({
        ...b,
        name: b.name.trim(),
        location: b.location.trim(),
        email: b.email.trim(),
        address: b.address.trim(),
      }));
      const saved = await apiUpsertBranches(vendorId, cleaned);
      // keep stable local keys for React
      const keyed = saved.map((b, i) => ({ ...b, _localKey: branches[i]?._localKey ?? Math.random().toString(36).slice(2) }));
      setBranches(keyed);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading branches…</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header with Add Branch */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Branch Details</h3>
        <button
          type="button"
          onClick={addBranch}
          disabled={!canAdd}
          className="px-3 py-2 rounded bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
          title={canAdd ? 'Add Branch' : 'Limit reached'}
        >
          + Add Branch
        </button>
      </div>

      {/* Branch Cards */}
      <div className="space-y-6">
        {branches.map((b, idx) => (
          <div
            key={b._localKey}
            className="rounded-lg border bg-white p-4 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm font-medium">Branch #{idx + 1}</div>
              <button
                type="button"
                onClick={() => removeBranch(idx)}
                className="px-3 py-1.5 rounded bg-rose-100 text-rose-700 hover:bg-rose-200"
              >
                × Delete
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                className="border rounded px-3 py-2"
                placeholder="Branch Name"
                value={b.name}
                onChange={(e) => updateField(idx, 'name', e.target.value)}
              />
              <input
                className="border rounded px-3 py-2"
                placeholder="Branch Location"
                value={b.location}
                onChange={(e) => updateField(idx, 'location', e.target.value)}
              />
              <input
                className="border rounded px-3 py-2"
                placeholder="Email ID"
                value={b.email}
                onChange={(e) => updateField(idx, 'email', e.target.value)}
              />
              <input
                className="border rounded px-3 py-2"
                placeholder="Primary Mobile Number"
                value={b.primaryMobile}
                onChange={(e) => updateField(idx, 'primaryMobile', e.target.value)}
              />
              <input
                className="border rounded px-3 py-2"
                placeholder="Alternative Mobile Number"
                value={b.altMobile}
                onChange={(e) => updateField(idx, 'altMobile', e.target.value)}
              />
              <select
                className="border rounded px-3 py-2"
                value={b.country}
                onChange={(e) => updateField(idx, 'country', e.target.value)}
              >
                <option value="India">India</option>
              </select>

              <select
                className="border rounded px-3 py-2"
                value={b.state}
                onChange={(e) => updateField(idx, 'state', e.target.value)}
              >
                <option value="">State</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Kerala">Kerala</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Maharashtra">Maharashtra</option>
              </select>
              <select
                className="border rounded px-3 py-2"
                value={b.city}
                onChange={(e) => updateField(idx, 'city', e.target.value)}
              >
                <option value="">City</option>
                <option value="Rameswaram">Rameswaram</option>
                <option value="Chennai">Chennai</option>
                <option value="Madurai">Madurai</option>
              </select>

              <input
                className="border rounded px-3 py-2"
                placeholder="Pincode"
                value={b.pincode}
                onChange={(e) => updateField(idx, 'pincode', e.target.value)}
              />

              <select
                className="border rounded px-3 py-2"
                value={b.gstType}
                onChange={(e) =>
                  updateField(idx, 'gstType', e.target.value as Branch['gstType'])
                }
              >
                <option value="Included">Included</option>
                <option value="Excluded">Excluded</option>
              </select>

              <select
                className="border rounded px-3 py-2"
                value={b.gstPercent}
                onChange={(e) =>
                  updateField(
                    idx,
                    'gstPercent',
                    e.target.value as Branch['gstPercent']
                  )
                }
              >
                <option value="5 % GST - %5">5 % GST - %5</option>
                <option value="12 % GST - %12">12 % GST - %12</option>
                <option value="18 % GST - %18">18 % GST - %18</option>
              </select>

              <input
                className="md:col-span-2 border rounded px-3 py-2"
                placeholder="Address"
                value={b.address}
                onChange={(e) => updateField(idx, 'address', e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={saveAll}
          className="px-4 py-2 rounded bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
          disabled={saving || !vendorId}
          title={!vendorId ? 'Save Basic Info first' : 'Save branches'}
        >
          {saving ? 'Saving…' : 'Save Branches'}
        </button>
      </div>
    </div>
  );
}
