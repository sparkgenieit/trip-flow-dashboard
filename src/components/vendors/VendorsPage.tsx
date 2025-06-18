
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import VendorForm from './VendorForm';

interface Vendor {
  id: string;
  company_name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  commission_rate: number;
}

const VendorsPage = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      // Mock data to avoid Supabase errors
      const mockVendors = [
        {
          id: '1',
          company_name: 'City Taxi Corp',
          contact_person: 'John Manager',
          phone: '+1234567890',
          email: 'contact@citytaxi.com',
          address: '123 Main St, City, State',
          commission_rate: 15.00
        },
        {
          id: '2',
          company_name: 'Metro Transport',
          contact_person: 'Sarah Wilson',
          phone: '+1987654321',
          email: 'info@metrotransport.com',
          address: '456 Oak Ave, Metro City',
          commission_rate: 12.50
        },
        {
          id: '3',
          company_name: 'Quick Rides',
          contact_person: 'Mike Rodriguez',
          phone: '+1555666777',
          email: 'hello@quickrides.com',
          address: '789 Pine Rd, Downtown',
          commission_rate: 18.00
        }
      ];
      setVendors(mockVendors);
      toast({
        title: "Info",
        description: "Using demo data (Supabase connection disabled)",
      });
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast({
        title: "Error",
        description: "Failed to fetch vendors",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingVendor(null);
    fetchVendors();
  };

  const filteredVendors = vendors.filter(vendor =>
    vendor.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.contact_person?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading vendors...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Vendors</h2>
          <p className="text-muted-foreground">Manage vendor partnerships</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Vendor
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search vendors..."
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
        {filteredVendors.map((vendor) => (
          <Card key={vendor.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{vendor.company_name}</CardTitle>
                <Badge variant="outline">{vendor.commission_rate}% Commission</Badge>
              </div>
              <CardDescription>{vendor.contact_person}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Phone:</span> {vendor.phone || 'Not provided'}
                </div>
                <div>
                  <span className="font-medium">Email:</span> {vendor.email || 'Not provided'}
                </div>
                <div>
                  <span className="font-medium">Address:</span> {vendor.address || 'Not provided'}
                </div>
              </div>
              <div className="mt-4 flex space-x-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(vendor)}>
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
        <VendorForm
          vendor={editingVendor}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default VendorsPage;
