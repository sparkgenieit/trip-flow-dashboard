// src/components/vehicles/VehiclesPage.tsx  (#realcode)
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import VehicleForm from './VehicleForm';
import VehicleDetailsModal from './VehicleDetailsModal';
import { getVehicles, deleteVehicle } from '@/services/vehicles';

// ---- helpers ---------------------------------------------------------------
const toDate = (d?: string | null) => {
  if (!d) return null;
  const s = /^\d{4}-\d{2}-\d{2}$/.test(d) ? `${d}T00:00:00Z` : d;
  const dt = new Date(s);
  return isNaN(+dt) ? null : dt;
};

const daysUntil = (d?: string | null) => {
  const dt = toDate(d);
  if (!dt) return null;
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diff = dt.getTime() - startOfToday.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// ---- types ----------------------------------------------------------------
interface Vehicle {
  id: number;
  name: string;
  model: string;
  image: string | string[]; // backend may return either
  capacity: number;
  registrationNumber: string;
  price: number;
  originalPrice: number;
  status: string;
  comfortLevel: number;
  lastServicedDate: string | null;
  vehicleTypeId: number;
  vendorId: number | null;
  vendor?: {
    id: number;
    name?: string;
    companyReg?: string;
    userId: number;
  };

  // Insurance & FC (optional)
  insurancePolicyNumber?: string | null;
  insuranceStartDate?: string | null;
  insuranceEndDate?: string | null;
  insuranceContactNumber?: string | null;
  rtoCode?: string | null;
}

const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [viewingVehicle, setViewingVehicle] = useState<Vehicle | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchVehicles = async () => {
    try {
      const data = await getVehicles();
      setVehicles(data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch vehicles',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingVehicle(null);
    fetchVehicles();
  };

  const handleViewDetails = (vehicle: Vehicle) => {
    setViewingVehicle(vehicle);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteVehicle(id);
      toast({ title: 'Deleted successfully' });
      fetchVehicles();
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Delete failed',
        variant: 'destructive',
      });
    }
  };

  const q = searchTerm.trim().toLowerCase();
  const filteredVehicles = vehicles.filter((v) =>
    [
      v.registrationNumber,
      v.model,
      v.insurancePolicyNumber ?? '',
      v.rtoCode ?? '',
    ]
      .join(' ')
      .toLowerCase()
      .includes(q)
  );

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading vehicles...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Vehicles</h2>
          <p className="text-muted-foreground">Manage your vehicle fleet</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Vehicle
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search vehicles… (reg no, model, policy #, RTO)"
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
        {filteredVehicles.map((vehicle) => {
          const d = daysUntil(vehicle.insuranceEndDate ?? null);
          const isExpired = d !== null && d < 0;
          const dueSoon = d !== null && d >= 0 && d <= 15;

          return (
            <Card key={vehicle.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-lg">{vehicle.registrationNumber}</CardTitle>
                  <div className="flex items-center gap-2">
                    {isExpired && <Badge variant="destructive">Insurance expired</Badge>}
                    {!isExpired && dueSoon && <Badge variant="secondary">Due in {d}d</Badge>}
                    <Badge variant={vehicle.status === 'available' ? 'default' : 'secondary'}>
                      {vehicle.status}
                    </Badge>
                  </div>
                </div>
                <CardDescription>{vehicle.model}</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Rate per KM:</span> ₹{vehicle.price}
                  </div>
                  <div>
                    <span className="font-medium">Comfort Level:</span> {vehicle.comfortLevel}/5
                  </div>
                  <div>
                    <span className="font-medium">Capacity:</span> {vehicle.capacity} seater
                  </div>
                  <div>
                    <span className="font-medium">Last Serviced:</span>{' '}
                    {vehicle.lastServicedDate
                      ? new Date(
                          /^\d{4}-\d{2}-\d{2}$/.test(vehicle.lastServicedDate)
                            ? `${vehicle.lastServicedDate}T00:00:00Z`
                            : vehicle.lastServicedDate
                        ).toLocaleDateString()
                      : 'Not recorded'}
                  </div>

                  {/* Insurance & FC quick facts */}
                  <div className="pt-1 border-t mt-2">
                    <div>
                      <span className="font-medium">Policy number:</span>{' '}
                      {vehicle.insurancePolicyNumber || '—'}
                    </div>
                    <div>
                      <span className="font-medium">Valid till:</span>{' '}
                      {toDate(vehicle.insuranceEndDate)?.toLocaleDateString() || '—'}
                    </div>
                    {vehicle.rtoCode && (
                      <div>
                        <span className="font-medium">RTO Code:</span> {vehicle.rtoCode}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex space-x-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(vehicle)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleViewDetails(vehicle)}>
                    View Details
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(vehicle.id)}>
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {showForm && <VehicleForm vehicle={editingVehicle!} onClose={handleCloseForm} />}

      {viewingVehicle && (
        <VehicleDetailsModal vehicle={viewingVehicle} onClose={() => setViewingVehicle(null)} />
      )}
    </div>
  );
};

export default VehiclesPage;
