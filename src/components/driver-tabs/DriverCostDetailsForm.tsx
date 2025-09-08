'use client';
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { DriverFormData } from './DriverTabs';

export default function DriverCostDetailsForm(props: {
  value: DriverFormData;
  onChange: (patch: Partial<DriverFormData>) => void;
}) {
  const { value: v, onChange } = props;

  return (
    // 4 columns like the reference: first row has 4 fields, next row has 2
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Row 1 */}
      <div className="space-y-2">
        <Label>Driver Salary ₹ *</Label>
        <Input
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          placeholder="Driver Salary"
          value={v.driverSalary ?? ''}
          onChange={(e) =>
            onChange({ driverSalary: e.target.value ? Number(e.target.value) : null })
          }
        />
      </div>

      <div className="space-y-2">
        <Label>Food Cost ₹ *</Label>
        <Input
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          placeholder="Food Cost"
          value={v.foodCost ?? ''}
          onChange={(e) =>
            onChange({ foodCost: e.target.value ? Number(e.target.value) : null })
          }
        />
      </div>

      <div className="space-y-2">
        <Label>Accomodation Cost ₹ *</Label>
        <Input
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          placeholder="Accomodation Cost"
          value={v.accommodationCost ?? ''}
          onChange={(e) =>
            onChange({ accommodationCost: e.target.value ? Number(e.target.value) : null })
          }
        />
      </div>

      <div className="space-y-2">
        <Label>Bhatta Cost ₹ *</Label>
        <Input
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          placeholder="Bhatta Cost"
          value={v.bhattaCost ?? ''}
          onChange={(e) =>
            onChange({ bhattaCost: e.target.value ? Number(e.target.value) : null })
          }
        />
      </div>

      {/* Row 2 */}
      <div className="space-y-2 md:col-span-2">
        <Label>Early Morning Charges(₹)(Before 6 AM) *</Label>
        <Input
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          placeholder="Early Morning Charges"
          value={v.earlyMorningCharges ?? ''}
          onChange={(e) =>
            onChange({ earlyMorningCharges: e.target.value ? Number(e.target.value) : null })
          }
        />
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label>Evening Charges (₹)(After 6 PM) *</Label>
        <Input
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          placeholder="Evening Charges"
          value={v.eveningCharges ?? ''}
          onChange={(e) =>
            onChange({ eveningCharges: e.target.value ? Number(e.target.value) : null })
          }
        />
      </div>
    </div>
  );
}
