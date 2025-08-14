'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import VehicleTypeForm from './VehicleTypeForm';
import VehicleTypeDetailsModal from './VehicleTypeDetailsModal';
import { deleteVehicleType, getVehicleType, getVehicleTypes, type VehicleTypeDTO } from '@/services/vehicleTypes';

export default function VehicleTypesPage() {
  const [items, setItems] = useState<VehicleTypeDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<VehicleTypeDTO | null>(null);
  const [viewing, setViewing] = useState<VehicleTypeDTO | null>(null);
  const { toast } = useToast();

  async function load() {
    setLoading(true);
    try {
      const res = await getVehicleTypes();
      setItems(res || []);
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to load vehicle types.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return items;
    return items.filter((x) => x.name.toLowerCase().includes(q));
  }, [items, searchTerm]);

  async function handleEditBrief(item: VehicleTypeDTO) {
    try {
      const full = await getVehicleType(Number(item.id));
      setEditing(full);
      setShowForm(true);
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to load vehicle type.', variant: 'destructive' });
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this vehicle type?')) return;
    try {
      await deleteVehicleType(id);
      toast({ title: 'Deleted', description: 'Vehicle type removed successfully.' });
      load();
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to delete vehicle type.', variant: 'destructive' });
    }
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Vehicle Types</h2>
          <p className="text-muted-foreground">Manage your vehicle types</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Vehicle Type
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search vehicle types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full flex justify-center items-center h-64">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full text-sm text-muted-foreground">No results</div>
        ) : (
          filtered.map((it) => {
            const imgs = Array.isArray(it.image) ? it.image : it.image ? [it.image] : [];
            const cover = imgs[0]?.url ?? imgs[0]?.dataUrl; // supports base64 dataUrl too


            return (
              <Card key={it.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{it.name}</CardTitle>
                    <div className="flex space-x-2">
                      <Badge variant="outline">{it.seatingCapacity} Seats</Badge>
                    </div>
                  </div>
                  <CardDescription>Rate: {it.estimatedRatePerKm} / km • Base: {it.baseFare}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="h-24">
                      {cover ? (
                        <img src={cover} alt={imgs[0]?.alt || it.name} className="h-24 w-full rounded border object-cover" />
                      ) : (
                        <div className="h-24 w-full rounded border flex items-center justify-center text-xs text-gray-500">
                          No image
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleEditBrief(it)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setViewing(it)}>
                      View Details
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(Number(it.id))}>
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {showForm && <VehicleTypeForm vehicleType={editing} onClose={closeForm} />}
      {viewing && <VehicleTypeDetailsModal vehicleType={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}
