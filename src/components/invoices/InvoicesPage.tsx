
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Download, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getInvoices } from '@/services/invoice';


interface Invoice {
  id: string;
  invoice_number: string;
  subtotal: number;
  vendor_commission: number;
  admin_commission: number;
  total_amount: number;
  pdf_url: string;
  created_at: string;
  profiles: {
    full_name: string;
  };
  vendors: {
    company_name: string;
  };
  trips: {
    bookings: {
      pickup_location: string;
      dropoff_location: string;
    };
  };
}

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchInvoices();
  }, []);

 const fetchInvoices = async () => {
  try {
    const data = await getInvoices();
    setInvoices(data);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    toast({
      title: 'Error',
      description: 'Failed to fetch invoices',
      variant: 'destructive',
    });
  } finally {
    setLoading(false);
  }
};


  const filteredInvoices = invoices.filter(invoice =>
    invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading invoices...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
          <p className="text-muted-foreground">Manage billing and payments</p>
        </div>
        <Button>
          <FileText className="mr-2 h-4 w-4" />
          Generate Invoice
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search invoices..."
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

      <div className="grid gap-4">
        {filteredInvoices.map((invoice) => (
          <Card key={invoice.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{invoice.invoice_number}</CardTitle>
                  <CardDescription>
                    {invoice.profiles?.full_name || 'Unknown Customer'}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">₹{invoice.total_amount}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(invoice.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Subtotal:</span>
                  <p>₹{invoice.subtotal}</p>
                </div>
                <div>
                  <span className="font-medium">Vendor Commission:</span>
                  <p>₹{invoice.vendor_commission || 0}</p>
                </div>
                <div>
                  <span className="font-medium">Admin Commission:</span>
                  <p>₹{invoice.admin_commission || 0}</p>
                </div>
                <div>
                  <span className="font-medium">Vendor:</span>
                  <p>{invoice.vendors?.company_name || 'Independent'}</p>
                </div>
              </div>
              
              {invoice.trips?.bookings && (
                <div className="mt-4 pt-4 border-t">
                  <span className="font-medium text-sm">Trip:</span>
                  <p className="text-sm text-muted-foreground">
                    {invoice.trips.bookings.pickup_location} → {invoice.trips.bookings.dropoff_location}
                  </p>
                </div>
              )}

              <div className="mt-4 flex space-x-2">
                <Button size="sm" variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                <Button size="sm" variant="outline">
                  Send Email
                </Button>
                <Button size="sm" variant="outline">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default InvoicesPage;
