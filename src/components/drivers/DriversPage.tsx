import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDrivers, deleteDriver as deleteDriverApi } from '@/services/drivers';
import DriverDetailsModal from './DriverDetailsModal'; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// If you have a local form component, keep these imports.
// Adjust the path if your project structure differs.
// Remove this import if you don't use the inline form open/close flow here.
import DriverForm, { type DriverFormInput } from './DriverForm';

// ----- Helpers: browser-safe API base + URL joiner -----
// IMPORTANT: If your Nest app uses a global prefix, make sure VITE_API_BASE_URL already includes it, e.g. http://localhost:4001/api
const API_BASE_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) ||
  (typeof window !== 'undefined' && (window as any).__API_BASE_URL__) ||
  '';

const joinUrl = (base: string, path?: string | null) => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  const b = base.replace(/\/+$/, '');
  const p = String(path).replace(/^\/+/, '');
  return `${b}/${p}`;
};

// ----- Types (extended with new fields) -----
interface Driver {
  id: number;
  fullName: string;
  phone: string;
  email: string;
  licenseNumber: string;
  licenseExpiry: string;
  isPartTime: boolean;
  isAvailable: boolean;

  vendorId: number | null;
  assignedVehicleId: number | null;
  userId: number | null;

  // Images
  licenseImage?: string;
  rcImage?: string;
  profileImage?: string;

  // NEW FIELDS
  whatsappPhone?: string | null;
  altPhone?: string | null;
  licenseIssueDate?: string | null; // Date string
  dob?: string | null; // Date string
  gender?: string | null;
  bloodGroup?: string | null;
  aadhaarNumber?: string | null;
  panNumber?: string | null;
  voterId?: string | null;
  address?: string | null;

  vendor?: {
    id: number;
    name?: string;
    companyReg?: string;
    createdAt?: string;
    userId?: number;
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
    password?: string;
    phone: string;
    role: string;
    createdAt: string;
    updatedAt: string;
    vendorId: number | null;
  };
}

const DriversPage: React.FC = () => {
  const { toast } = useToast();

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingDriver, setEditingDriver] = useState<DriverFormInput | null>(null);
  const [viewingDriver, setViewingDriver] = useState<DriverFormInput | null>(null);
  const [viewingLoadingId, setViewingLoadingId] = useState<number | null>(null);


  useEffect(() => {
    fetchDrivers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDrivers = async () => {
    try {
      // our service returns { data, total, page, pageSize }
      const { data } = await getDrivers({ page: 1, pageSize: 100 });
      setDrivers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load drivers from server.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

    const handleViewDetails = async (id: number) => {
    try {
      setViewingLoadingId(id);
      // getDrivers(id) -> services/drivers.ts calls GET /drivers/:id/full
      const full = await getDrivers(id);
      setViewingDriver(full);
    } catch (err) {
      console.error('Failed to load driver details:', err);
      toast({
        title: 'Failed to load driver',
        description: 'Could not fetch full driver details.',
        variant: 'destructive',
      });
    } finally {
      setViewingLoadingId(null);
    }
  };

  const handleEdit = async (driver: Driver) => {
    try {
      // Use the service: getDrivers(id) -> internally calls GET /drivers/:id/full
      const d: any = await getDrivers(driver.id);

      const driverInput: DriverFormInput = {
        id: d.id,
        fullName: d.fullName,
        phone: d.phone,
        email: d.email,
        licenseNumber: d.licenseNumber,
        licenseExpiry: d.licenseExpiry ? String(d.licenseExpiry).split('T')[0] : '',
        isPartTime: !!d.isPartTime,
        isAvailable: !!d.isAvailable,
        vendorId: d.vendorId ?? undefined,
        assignedVehicleId: d.assignedVehicleId ?? undefined,
        userId: d.userId ?? undefined,

        // NEW FIELDS
        whatsappPhone: d.whatsappPhone || '',
        altPhone: d.altPhone || '',
        licenseIssueDate: d.licenseIssueDate ? String(d.licenseIssueDate).split('T')[0] : '',
        dob: d.dob ? String(d.dob).split('T')[0] : '',
        gender: d.gender || '',
        bloodGroup: d.bloodGroup || '',
        aadhaarNumber: d.aadhaarNumber || '',
        panNumber: d.panNumber || '',
        voterId: d.voterId || '',
        address: d.address || '',

        // Images for preview
        licenseImage: d.licenseImage,
        rcImage: d.rcImage,
        profileImage: d.profileImage,
      };

      setEditingDriver(driverInput);
      setShowForm(true);
    } catch (err) {
      console.error('Failed to load full driver:', err);
      toast({
        title: 'Error',
        description: 'Failed to load driver details for editing.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
  const confirmed = window.confirm('Are you sure you want to delete this driver?');
  if (!confirmed) return;

  try {
    await deleteDriverApi(id); // uses services/drivers.ts (auto prefix + auth)
    toast({ title: 'Deleted', description: 'Driver removed successfully.' });
    fetchDrivers(); // refresh list
  } catch (error) {
    console.error('Delete error:', error);
    toast({
      title: 'Error',
      description: 'Failed to delete driver.',
      variant: 'destructive',
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
        <Button asChild>
          <Link to="/dashboard/drivers/add">
            <Plus className="mr-2 h-4 w-4" />
            Add Driver
          </Link>
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
                  <Badge variant={driver.isAvailable ? 'default' : 'secondary'}>
                    {driver.isAvailable ? 'Available' : 'Unavailable'}
                  </Badge>
                  {driver.isPartTime && <Badge variant="outline">Part Time</Badge>}
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
                  <span className="font-medium">Vendor:</span>{' '}
                  {driver.vendor?.companyReg || driver.vendor?.name || 'Independent'}
                </div>
                <div>
                    <span className="font-medium">Vehicle:</span>{' '}
                    {driver.assignedVehicle?.registrationNumber || 'Not assigned'}
                </div>
                <div>
                  <span className="font-medium">License Expiry:</span>{' '}
                  {driver.licenseExpiry ? new Date(driver.licenseExpiry).toLocaleDateString() : 'Not set'}
                </div>
              </div>
              <div className="mt-4 flex space-x-2">
                <Button size="sm" variant="outline" asChild>
                  <Link to={`/dashboard/drivers/edit/${driver.id}`}>Edit</Link>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewDetails(driver.id)}
                  disabled={viewingLoadingId === driver.id}
                >
                  {viewingLoadingId === driver.id ? 'Loading…' : 'View Details'}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(driver.id.toString())}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showForm && <DriverForm driver={editingDriver!} onClose={handleCloseForm} />}

      {/* Details Modal */}
      {viewingDriver && (
        <DriverDetailsModal
          driver={viewingDriver}
          onClose={() => setViewingDriver(null)}
        />
      )}
    </div>
  );
};

export default DriversPage;