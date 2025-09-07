import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchAllVendors } from '@/services/vendor';
import { getVehicleTypes, type VehicleTypeDTO } from '@/services/vehicleTypes';
import { getVehicleAvailabilityMatrix, type AvailabilityRow, assignVehicleForDate } from '@/services/availability';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Utility: yyyy-mm-dd
const fmt = (d: Date) => d.toISOString().split('T')[0];

// Build an inclusive list of date strings between two yyyy-mm-dd strings
const dateRange = (start: string, end: string) => {
    const out: string[] = [];
    const s = new Date(start);
    const e = new Date(end);
    for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
        out.push(fmt(d));
    }
    return out;
};

type Vendor = { id: number; name?: string; companyReg?: string };

const VehicleAvailabilityChart: React.FC = () => {
    // filters
    const today = fmt(new Date());
    const defaultTo = fmt(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
    const [dateFrom, setDateFrom] = useState<string>(today);
    const [dateTo, setDateTo] = useState<string>(defaultTo);
    const [vendorId, setVendorId] = useState<string>(''); // required
    const [vehicleTypeId, setVehicleTypeId] = useState<string>(''); // optional
    const [location, setLocation] = useState<string>(''); // free-text (backend may map to cityId)

    // data
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [types, setTypes] = useState<VehicleTypeDTO[]>([]);
    const [rows, setRows] = useState<AvailabilityRow[]>([]);
    const [loading, setLoading] = useState(false);

    // assign modal
    const [assignOpen, setAssignOpen] = useState(false);
    const [assignContext, setAssignContext] = useState<{ vehicleId: number, date: string } | null>(null);
    const [assignBookingId, setAssignBookingId] = useState<string>('');

    const columns = useMemo(() => dateRange(dateFrom, dateTo), [dateFrom, dateTo]);

    useEffect(() => {
        (async () => {
            try {
                const vs = await fetchAllVendors();
                setVendors(vs || []);
            } catch (e) { console.error(e); }
            try {
                const ts = await getVehicleTypes();
                setTypes(ts || []);
            } catch (e) { console.error(e); }
        })();
    }, []);

    const clearFilters = () => {
        setDateFrom(today);
        setDateTo(defaultTo);
        setVendorId('');
        setVehicleTypeId('');
        setLocation('');
        setRows([]);
    };

    const handleFilter = async () => {
        if (!dateFrom || !dateTo || !vendorId) return;
        setLoading(true);
        try {
            const data = await getVehicleAvailabilityMatrix({
                dateFrom,
                dateTo,
                vendorId: Number(vendorId),
                vehicleTypeId: vehicleTypeId && vehicleTypeId !== 'all' ? Number(vehicleTypeId) : undefined,
                location: location || undefined,
            });
            setRows(data || []);
        } finally {
            setLoading(false);
        }
    };


    const onAssignClick = (row: AvailabilityRow, date: string) => {
        setAssignContext({ vehicleId: row.vehicleId, date });
        setAssignBookingId('');
        setAssignOpen(true);
    };

    const resolveVendorName = (v: Vendor) => v.companyReg || v.name || `Vendor ${v.id}`;

    return (
        <div className="space-y-4 p-4">
            <h1 className="text-2xl font-bold">Vehicle Availability Chart</h1>

            {/* Filters (Agent removed) */}
            <Card>
                <CardHeader>
                    <CardTitle>Filter</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                        <div className="space-y-1">
                            <Label htmlFor="dateFrom">Date from*</Label>
                            <Input id="dateFrom" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="dateTo">Date to*</Label>
                            <Input id="dateTo" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label>Vendor*</Label>
                            <Select value={vendorId} onValueChange={setVendorId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose Vendor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {vendors.map(v => (
                                        <SelectItem key={v.id} value={String(v.id)}>
                                            {resolveVendorName(v)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label>Vehicle Type</Label>
                            <Select value={vehicleTypeId} onValueChange={setVehicleTypeId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose Vehicle Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {/* DO NOT use value="" here */}
                                    <SelectItem value="all">All</SelectItem>
                                    {types.map((t) => (
                                        <SelectItem key={t.id} value={String(t.id)}>
                                            {t.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="location">Location</Label>
                            <Input id="location" placeholder="Type location" value={location} onChange={e => setLocation(e.target.value)} />
                        </div>
                        <div className="flex items-end gap-2">
                            <Button onClick={handleFilter} className="w-full">Filter</Button>
                            <Button variant="outline" onClick={clearFilters} className="w-full">Clear</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Calendar grid */}
            <div className="bg-white rounded-lg border overflow-auto">
                <table className="min-w-[900px] w-full border-collapse">
                    <thead className="sticky top-0 z-10 bg-gray-50">
                        <tr>
                            <th className="sticky left-0 bg-gray-50 p-2 text-left border-b w-48">Vendor</th>
                            <th className="sticky left-48 bg-gray-50 p-2 text-left border-b w-52">Vehicle / Type</th>
                            {columns.map(d => (
                                <th key={d} className="px-3 py-2 text-xs font-medium border-b whitespace-nowrap">{d}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={2 + columns.length} className="p-6 text-center text-gray-500">Loading…</td></tr>
                        ) : rows.length === 0 ? (
                            <tr><td colSpan={2 + columns.length} className="p-6 text-center text-gray-500">No data</td></tr>
                        ) : (
                            rows.map((row) => (
                                <tr key={row.vehicleId} className="even:bg-gray-50/30">
                                    <td className="sticky left-0 bg-white p-2 border-b whitespace-nowrap">{row.vendorName}</td>
                                    <td className="sticky left-48 bg-white p-2 border-b whitespace-nowrap">
                                        <div className="font-medium">{row.registrationNumber}</div>
                                        <div className="text-xs text-gray-500">{row.vehicleTypeName}</div>
                                    </td>
                                    {columns.map((d) => {
                                        const cell = row.days[d]; // {status:'available'|'assigned'|'blocked', refId?:number}
                                        if (!cell) {
                                            return <td key={d} className="border-b px-2 py-1 text-center text-xs text-gray-400">—</td>;
                                        }
                                        const base = "border-b px-2 py-1 text-center text-xs";
                                        if (cell.status === 'available') {
                                            return (
                                                <td key={d} className={base + " bg-green-50"}>
                                                    <Button size="sm" className="h-7 text-xs" onClick={() => onAssignClick(row, d)}>+ Assign</Button>
                                                </td>
                                            );
                                        }
                                        if (cell.status === 'assigned') {
                                            return (
                                                <td key={d} className={base + " bg-yellow-50"}>
                                                    <div className="font-medium">Assigned</div>
                                                    {cell.refId ? <div className="text-[10px] text-gray-600">Trip #{cell.refId}</div> : null}
                                                </td>
                                            );
                                        }
                                        if (cell.status === 'blocked') {
                                            return <td key={d} className={base + " bg-red-50 text-red-700"}>Blocked</td>;
                                        }
                                        return <td key={d} className={base}> </td>;
                                    })}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Quick assign modal (optional) */}
            <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Assign Vehicle</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div className="text-sm text-gray-600">
                            Vehicle ID: <span className="font-medium">{assignContext?.vehicleId}</span> on{' '}
                            <span className="font-medium">{assignContext?.date}</span>
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="bookingId">Booking ID</Label>
                            <Input
                                id="bookingId"
                                value={assignBookingId}
                                onChange={(e) => setAssignBookingId(e.target.value)}
                                placeholder="Enter booking ID to assign"
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={() => setAssignOpen(false)}>Cancel</Button>
                            <Button
                                onClick={async () => {
                                    if (!assignContext || !assignBookingId) return;
                                    try {
                                        await assignVehicleForDate({
                                            vehicleId: assignContext.vehicleId,
                                            date: assignContext.date,
                                            bookingId: Number(assignBookingId),
                                        });
                                        setAssignOpen(false);
                                        await handleFilter();
                                    } catch (e) {
                                        console.error(e);
                                        alert('Assignment failed. Please try again.');
                                    }
                                }}
                            >
                                Assign
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default VehicleAvailabilityChart;
