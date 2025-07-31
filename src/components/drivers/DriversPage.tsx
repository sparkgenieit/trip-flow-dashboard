import { getDrivers, deleteDriver } from '@/services/drivers';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DriverForm from './DriverForm';
import axios from 'axios';
import type { DriverFormInput } from './DriverForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  } 
from '@/components/ui/dialog';
  interface Driver {
  id: number;
  fullName: string;
  phone: string;
  email: string;
  licenseNumber: string;
  licenseExpiry: string;
  isPartTime: boolean;
  isAvailable: boolean;
  vendorId: number;
  assignedVehicleId: number;
  userId: number;
  licenseImage?: string; // ✅ newly added
  rcImage?: string;      // ✅ newly added

  vendor?: {
    id: number;
    name: string;
    companyReg: string;
    createdAt: string;
    userId: number;
  };

  assignedVehicle?: {
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
  };

  user?: {
    id: number;
    name: string;
    email: string;
    password: string;
    phone: string;
    role: string;
    createdAt: string;
    updatedAt: string;
    vendorId: number | null;
  };
}


const DriversPage = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingDriver, setEditingDriver] = useState<DriverFormInput | null>(null);
  const { toast } = useToast();
  const [viewingDriver, setViewingDriver] = useState<Driver | null>(null);

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

const handleEdit = async (driver: Driver) => {
  try {
    const token = localStorage.getItem('authToken');
    const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/drivers/${driver.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const fullDriver = res.data;

    const driverInput: DriverFormInput = {
      id: fullDriver.id,
      fullName: fullDriver.fullName,
      phone: fullDriver.phone,
      email: fullDriver.email,
      licenseNumber: fullDriver.licenseNumber,
      licenseExpiry: fullDriver.licenseExpiry
        ? new Date(fullDriver.licenseExpiry).toISOString().substring(0, 10)
        : '',
      isPartTime: fullDriver.isPartTime,
      isAvailable: fullDriver.isAvailable,
      vendorId: fullDriver.vendorId || undefined,
      assignedVehicleId: fullDriver.assignedVehicleId || undefined,
      userId: fullDriver.userId,
      licenseImage: fullDriver.licenseImage,  // ✅ added
      rcImage: fullDriver.rcImage,            // ✅ added
    };

    setEditingDriver(driverInput);
    setShowForm(true);
  } catch (err) {
    console.error('Failed to load full driver:', err);
  }
};

  const handleDelete = async (id: string) => {
  const confirmed = window.confirm("Are you sure you want to delete this driver?");
  if (!confirmed) return;

  try {
    await deleteDriver(id);
    toast({ title: "Deleted", description: "Driver removed successfully." });
    fetchDrivers(); // Refresh list
  } catch (error) {
    console.error('Delete error:', error);
    toast({
      title: "Error",
      description: "Failed to delete driver.",
      variant: "destructive"
    });
  }
};


  const handleCloseForm = () => {
    setShowForm(false);
    setEditingDriver(null);
    fetchDrivers();
  };

const filteredDrivers = drivers.filter((driver) => {
  const name = driver?.fullName || '';
  const license = driver?.licenseNumber || '';
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
                <CardTitle className="text-lg">{driver.fullName}</CardTitle>
                <div className="flex space-x-2">
                  <Badge variant={driver.isAvailable ? "default" : "secondary"}>
                    {driver.isAvailable ? "Available" : "Unavailable"}
                  </Badge>
                  {driver.isPartTime && (
                    <Badge variant="outline">Part Time</Badge>
                  )}
                </div>
              </div>
              <CardDescription>License: {driver.licenseNumber}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Phone:</span> {driver.phone}
                </div>
                <div>
                  <span className="font-medium">Vendor:</span> {driver.vendor?.name || 'Independent'}
                </div>
                <div>
                  <span className="font-medium">Vehicle:</span> {driver.assignedVehicle?.registrationNumber || 'Not assigned'}
                </div>
                <div>
                  <span className="font-medium">License Expiry:</span> {
                    driver.licenseExpiry ? new Date(driver.licenseExpiry).toLocaleDateString() : 'Not set'
                  }
                </div>
              </div>
              <div className="mt-4 flex space-x-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(driver)}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setViewingDriver(driver)}>
                  View Details
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(driver.id.toString())}>
                  Delete
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
      {viewingDriver && (
        <Dialog open={true} onOpenChange={() => setViewingDriver(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Driver Details</DialogTitle>
              <DialogDescription>Full driver profile</DialogDescription>
            </DialogHeader>

            <div className="space-y-2 text-sm">
            <div><strong>Name:</strong> {viewingDriver.fullName}</div>
            <div><strong>Phone:</strong> {viewingDriver.phone}</div>
            <div><strong>License Number:</strong> {viewingDriver.licenseNumber}</div>
            <div><strong>License Expiry:</strong> {
              viewingDriver.licenseExpiry ? new Date(viewingDriver.licenseExpiry).toLocaleDateString() : 'Not set'
            }</div>
            <div><strong>Status:</strong> {viewingDriver.isAvailable ? 'Available' : 'Unavailable'}</div>
            <div><strong>Type:</strong> {viewingDriver.isPartTime ? 'Part Time' : 'Full Time'}</div>
            <div><strong>Vendor:</strong> {viewingDriver.vendor?.name || 'Independent'}</div>
            <div><strong>Vehicle Assigned:</strong> {viewingDriver.assignedVehicle?.registrationNumber || 'Not assigned'}</div>
          

            {/* ✅ Show Uploaded Image Previews */}
  {viewingDriver.licenseImage && (
    <div>
      <strong>License Image:</strong>
      <img
        src={`${import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')}/${viewingDriver.licenseImage.replace(/^\/+/, '')}`}
        alt="License"
        className="mt-1 w-32 h-24 rounded border object-cover"
      />
    </div>
  )}
  {viewingDriver.rcImage && (
    <div>
      <strong>RC Image:</strong>
      <img
        src={`${import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')}/${viewingDriver.rcImage.replace(/^\/+/, '')}`}
        alt="RC"
        className="mt-1 w-32 h-24 rounded border object-cover"
      />
    </div>
  )}
</div>

            <DialogFooter>
              <Button onClick={() => setViewingDriver(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default DriversPage;
