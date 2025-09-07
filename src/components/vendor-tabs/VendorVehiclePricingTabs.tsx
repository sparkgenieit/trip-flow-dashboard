'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import DriverCostFormModal from './vehicle-type/DriverCostFormModal';
import { fetchDriverCostsByVendor, type DriverCostDTO } from './services/vendorPricing';

type Step = 1 | 2 | 3 | 4 | 5 | 6;

export default function VendorVehiclePricingTabs({ vendorId }: { vendorId: number | string }) {
  const [step, setStep] = useState<Step>(3);
  const [activeInnerTab, setActiveInnerTab] = useState<'driver' | 'outstation' | 'local'>('driver');
  const [showAdd, setShowAdd] = useState(false);
  const [data, setData] = useState<DriverCostDTO[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const rows = await fetchDriverCostsByVendor(vendorId);
        setData(rows || []);
      } catch (e) {
        console.error(e);
        toast({ title: 'Failed to load driver costs', variant: 'destructive' });
      }
    })();
  }, [vendorId]);

  const steps = useMemo(
    () => ['Basic Info', 'Branch', 'Vehicle Type', 'Vehicle', 'Vehicle Pricebook', 'Permit'],
    []
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div key={n} className="flex items-center">
            <div
              className={[
                'h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold',
                step === (n as Step) ? 'bg-primary text-white' : 'bg-muted text-foreground',
              ].join(' ')}
            >
              {n}
            </div>
            <span className={`ml-2 text-sm ${step === n ? 'font-semibold' : 'text-muted-foreground'}`}>
              {steps[n - 1]}
            </span>
            {n !== 6 && <div className="w-8 h-[2px] bg-muted mx-2" />}
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs value={activeInnerTab} onValueChange={(v) => setActiveInnerTab(v as any)}>
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="driver">Driver Cost</TabsTrigger>
                <TabsTrigger value="outstation">Outstation KM Limit</TabsTrigger>
                <TabsTrigger value="local">Local KM Limit</TabsTrigger>
              </TabsList>

              {activeInnerTab === 'driver' && (
                <Button onClick={() => setShowAdd(true)} className="bg-gray-900 hover:bg-gray-800">
                  + Add Vehicle Type – Driver Cost
                </Button>
              )}
            </div>

            <TabsContent value="driver" className="mt-4">
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr className="text-left">
                      <th className="px-3 py-2">S.No</th>
                      <th className="px-3 py-2">Vehicle Type</th>
                      <th className="px-3 py-2">Driver Bhatta (₹)</th>
                      <th className="px-3 py-2">Food Cost (₹)</th>
                      <th className="px-3 py-2">Accomodation (₹)</th>
                      <th className="px-3 py-2">Extra Cost (₹)</th>
                      <th className="px-3 py-2">Morning / hr (₹)</th>
                      <th className="px-3 py-2">Evening / hr (₹)</th>
                      <th className="px-3 py-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.length === 0 && (
                      <tr>
                        <td colSpan={9} className="px-3 py-6 text-center text-muted-foreground">
                          No rows yet. Click “Add Vehicle Type – Driver Cost” to create one.
                        </td>
                      </tr>
                    )}
                    {data.map((row, idx) => (
                      <tr
                        key={row.id ?? `${row.vehicleTypeId}-${idx}`}
                        className={idx % 2 ? 'bg-white' : 'bg-muted/20'}
                      >
                        <td className="px-3 py-2">{idx + 1}</td>
                        <td className="px-3 py-2">{row.vehicleTypeName}</td>
                        <td className="px-3 py-2">{row.driverBhatta?.toFixed(2) ?? '0.00'}</td>
                        <td className="px-3 py-2">{row.foodCost?.toFixed(2) ?? '0.00'}</td>
                        <td className="px-3 py-2">{row.accomodationCost?.toFixed(2) ?? '0.00'}</td>
                        <td className="px-3 py-2">{row.extraCost?.toFixed(2) ?? '0.00'}</td>
                        <td className="px-3 py-2">{row.morningChargesPerHour?.toFixed(2) ?? '0.00'}</td>
                        <td className="px-3 py-2">{row.eveningChargesPerHour?.toFixed(2) ?? '0.00'}</td>
                        <td className="px-3 py-2 text-right">
                          <Button size="sm" variant="secondary" className="mr-2">
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive">
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="outstation" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Default Outstation KM / day</Label>
                  <Input placeholder="e.g. 300" />
                </div>
                <div>
                  <Label>Max Outstation Hrs / day</Label>
                  <Input placeholder="e.g. 12" />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button className="bg-gray-900 hover:bg-gray-800">Save</Button>
              </div>
            </TabsContent>

            <TabsContent value="local" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Local Package – Base KM</Label>
                  <Input placeholder="e.g. 80" />
                </div>
                <div>
                  <Label>Local Package – Base Hrs</Label>
                  <Input placeholder="e.g. 8" />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button className="bg-gray-900 hover:bg-gray-800">Save</Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {showAdd && (
        <DriverCostFormModal
          vendorId={vendorId}
          onClose={(created) => {
            setShowAdd(false);
            if (created) {
              fetchDriverCostsByVendor(vendorId)
                .then((rows) => setData(rows || []))
                .catch(() => toast({ title: 'Refresh failed', variant: 'destructive' }));
            }
          }}
        />
      )}
    </div>
  );
}
