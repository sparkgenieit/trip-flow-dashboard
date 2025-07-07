import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Filter, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import VendorForm from './VendorForm';
import CorporateBookingRequests from './CorporateBookingRequests';
import { fetchAllVendors, deleteVendor } from '@/services/vendor';
import VendorDetailsModal from './VendorDetailsModal';

interface Vendor {
  id: number;
  name: string;
  companyReg: string;
  vendor?: {
    email?: string;
    phone?: string;
  };
}

const VendorsPage = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [tab, setTab] = useState('vendors');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [viewingVendor, setViewingVendor] = useState<Vendor | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
  try {
    const res = await fetchAllVendors();
    console.log(res)
    setVendors(res);
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
  setEditingVendor(vendor); // Now includes nested vendor.email/phone
  setShowForm(true);
};

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingVendor(null);
    setTab('vendors');
    fetchVendors();
  };

  const handleDelete = async (id: string) => {
  if (!confirm('Are you sure you want to delete this vendor?')) return;

  try {
    await deleteVendor(id);
    toast({ title: "Vendor deleted successfully" });
    fetchVendors();
  } catch (error) {
    console.error('Delete failed:', error);
    toast({
      title: "Error",
      description: "Failed to delete vendor",
      variant: "destructive",
    });
  }
};
  console.log(vendors)
  const filteredVendors = (vendors || []).filter(vendor =>
  vendor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  vendor.companyReg?.toLowerCase().includes(searchTerm.toLowerCase())
);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading vendors...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Vendors</h2>
          <p className="text-muted-foreground">Manage vendor partnerships and corporate requests</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Vendor
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="vendors">Vendor Management</TabsTrigger>
          <TabsTrigger value="corporate" className="flex items-center space-x-2">
            <Building className="h-4 w-4" />
            <span>Corporate Requests</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vendors" className="space-y-4">
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
            <Card key={vendor.id} className="shadow-sm border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">{vendor.name}</h3>
                  <p className="text-sm text-muted-foreground">{vendor.companyReg}</p>
                </div>
              </div>

              <div className="text-sm space-y-1">
                <p><span className="font-medium">Company Reg:</span> {vendor.companyReg}</p>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(vendor)}>
                  Edit
                </Button>
                <Button size="sm" variant="outline" onClick={() => setViewingVendor(vendor)}>
                  View Details
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(String(vendor.id))}>
                  Delete
                </Button>
              </div>
            </Card>
          ))}
          </div>
        </TabsContent>
        <TabsContent value="corporate">
          <CorporateBookingRequests />
        </TabsContent>
      </Tabs>

      {showForm && (
        <VendorForm
          vendor={editingVendor}
          onSuccess={fetchVendors} // ✅ triggers refresh after create/update
          onClose={handleCloseForm}
        />
      )}
      {viewingVendor && (
      <VendorDetailsModal vendor={viewingVendor} onClose={() => setViewingVendor(null)} />
         )}

    </div>
  );
};

export default VendorsPage;
