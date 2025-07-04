import { getDrivers } from '@/services/drivers';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DriverForm from './DriverForm';

interface Driver {
  id: string;
  license_number: string;
  license_expiry: string;
  is_part_time: boolean;
  is_available: boolean;
  vendor_id: string;
  assigned_vehicle_id: string;
  profiles: {
    full_name: string;
    phone: string;
  };
  vendors: {
    company_name: string;
  };
  vehicles: {
    vehicle_number: string;
    type: string;
  };
}

const DriversPage = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
  try {
    const response = await getDrivers(); // ✅ real API call
    setDrivers(response || []);
  } catch (error) {
    console.error('Error fetching drivers:', error);
    toast({
      title: "Error",
      description: "Failed to load drivers from server.",
      variant: "destructive"
    });
  } finally {
    setLoading(false);
  }
};

  const handleEdit = (driver: Driver) => {
    setEditingDriver(driver);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingDriver(null);
    fetchDrivers();
  };

const filteredDrivers = drivers.filter((driver) => {
  const name = driver?.profiles?.full_name || '';
  const license = driver?.license_number || '';
  return (
    name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    license.toLowerCase().includes(searchTerm.toLowerCase())
  );
});

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading drivers...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Drivers</h2>
          <p className="text-muted-foreground">Manage your driver fleet</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Driver
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search drivers..."
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
        {filteredDrivers.map((driver) => (
          <Card key={driver.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{driver.profiles?.full_name}</CardTitle>
                <div className="flex space-x-2">
                  <Badge variant={driver.is_available ? "default" : "secondary"}>
                    {driver.is_available ? "Available" : "Unavailable"}
                  </Badge>
                  {driver.is_part_time && (
                    <Badge variant="outline">Part Time</Badge>
                  )}
                </div>
              </div>
              <CardDescription>License: {driver.license_number}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Phone:</span> {driver.profiles?.phone}
                </div>
                <div>
                  <span className="font-medium">Vendor:</span> {driver.vendors?.company_name || 'Independent'}
                </div>
                <div>
                  <span className="font-medium">Vehicle:</span> {driver.vehicles?.vehicle_number || 'Not assigned'}
                </div>
                <div>
                  <span className="font-medium">License Expiry:</span> {
                    driver.license_expiry ? new Date(driver.license_expiry).toLocaleDateString() : 'Not set'
                  }
                </div>
              </div>
              <div className="mt-4 flex space-x-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(driver)}>
                  Edit
                </Button>
                <Button size="sm" variant="outline">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showForm && (
        <DriverForm
          driver={editingDriver}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default DriversPage;
