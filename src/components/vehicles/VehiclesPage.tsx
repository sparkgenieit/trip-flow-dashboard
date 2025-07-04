import React, { useState, useEffect } from 'react';
import { Card,CardContent,CardDescription,CardHeader,CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import VehicleForm from './VehicleForm';
import VehicleDetailsModal from './VehicleDetailsModal'; // ✅ added for modal view
import { getVehicles, deleteVehicle } from '@/services/vehicles'; // ✅ updated to include delete

interface Vehicle {
  id: number;
  name: string;
  model: string;
  image: string;
  capacity: number;
  registrationNumber: string;
  price: number;
  originalPrice: number;
  status: string;
  comfortLevel: number;
  lastServicedDate: string;
  vehicleTypeId: number;
  vendorId: number | null;
}

const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [viewingVehicle, setViewingVehicle] = useState<Vehicle | null>(null); // ✅ state for view modal
  const { toast } = useToast();

  useEffect(() => {
    fetchVehicles();
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
    setViewingVehicle(vehicle); // ✅ open view modal
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteVehicle(id); // ✅ API call
      toast({ title: 'Deleted successfully' });
      fetchVehicles(); // ✅ refresh
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Delete failed',
        variant: 'destructive',
      });
    }
  };

  const filteredVehicles = vehicles.filter((vehicle) =>
    vehicle.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase())
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
            placeholder="Search vehicles..."
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
        {filteredVehicles.map((vehicle) => (
          <Card key={vehicle.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{vehicle.registrationNumber}</CardTitle>
                <Badge variant={vehicle.status === 'available' ? 'default' : 'secondary'}>
                  {vehicle.status}
                </Badge>
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
                    ? new Date(vehicle.lastServicedDate).toLocaleDateString()
                    : 'Not recorded'}
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
        ))}
      </div>

      {showForm && (
        <VehicleForm vehicle={editingVehicle} onClose={handleCloseForm} />
      )}

      {viewingVehicle && (
        <VehicleDetailsModal vehicle={viewingVehicle} onClose={() => setViewingVehicle(null)} />
      )}
    </div>
  );
};

export default VehiclesPage;
