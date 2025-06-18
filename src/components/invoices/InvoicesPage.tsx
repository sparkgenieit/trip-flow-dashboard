
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Download, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
      // Mock data to avoid Supabase errors
      const mockInvoices = [
        {
          id: '1',
          invoice_number: 'INV-2024-001',
          subtotal: 250.00,
          vendor_commission: 25.00,
          admin_commission: 12.50,
          total_amount: 287.50,
          pdf_url: '',
          created_at: '2024-01-15T10:30:00Z',
          profiles: {
            full_name: 'Alice Johnson'
          },
          vendors: {
            company_name: 'City Taxi Corp'
          },
          trips: {
            bookings: {
              pickup_location: 'Airport Terminal 1',
              dropoff_location: 'Downtown Hotel'
            }
          }
        },
        {
          id: '2',
          invoice_number: 'INV-2024-002',
          subtotal: 180.00,
          vendor_commission: 18.00,
          admin_commission: 9.00,
          total_amount: 207.00,
          pdf_url: '',
          created_at: '2024-01-14T14:15:00Z',
          profiles: {
            full_name: 'Bob Wilson'
          },
          vendors: {
            company_name: 'Metro Transport'
          },
          trips: {
            bookings: {
              pickup_location: 'City Mall',
              dropoff_location: 'Residential Area'
            }
          }
        },
        {
          id: '3',
          invoice_number: 'INV-2024-003',
          subtotal: 320.00,
          vendor_commission: 32.00,
          admin_commission: 16.00,
          total_amount: 368.00,
          pdf_url: '',
          created_at: '2024-01-13T09:45:00Z',
          profiles: {
            full_name: 'Carol Davis'
          },
          vendors: {
            company_name: 'Quick Rides'
          },
          trips: {
            bookings: {
              pickup_location: 'Business District',
              dropoff_location: 'Conference Center'
            }
          }
        }
      ];
      setInvoices(mockInvoices);
      toast({
        title: "Info",
        description: "Using demo data (Supabase connection disabled)",
      });
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast({
        title: "Error",
        description: "Failed to fetch invoices",
        variant: "destructive",
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
