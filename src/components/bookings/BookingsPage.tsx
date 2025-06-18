
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Filter, MapPin, Clock, Users, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import BookingForm from './BookingForm';
import CorporateBookingForm from './CorporateBookingForm';

interface Booking {
  id: string;
  pickup_location: string;
  dropoff_location: string;
  pickup_time: string;
  status: string;
  estimated_cost: number;
  booking_type: string;
  profiles: {
    full_name: string;
  };
  drivers: {
    profiles: {
      full_name: string;
    };
  } | null;
  vehicles: {
    vehicle_number: string;
  } | null;
}

const BookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showCorporateForm, setShowCorporateForm] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      // Mock data to avoid Supabase errors
      const mockBookings = [
        {
          id: '1',
          pickup_location: 'Airport Terminal 1',
          dropoff_location: 'Downtown Hotel',
          pickup_time: '2024-06-19T10:30:00',
          status: 'confirmed',
          estimated_cost: 450,
          booking_type: 'individual',
          profiles: {
            full_name: 'John Doe'
          },
          drivers: {
            profiles: {
              full_name: 'Mike Wilson'
            }
          },
          vehicles: {
            vehicle_number: 'CAR-001'
          }
        },
        {
          id: '2',
          pickup_location: 'Business District',
          dropoff_location: 'Tech Park',
          pickup_time: '2024-06-19T14:15:00',
          status: 'pending',
          estimated_cost: 280,
          booking_type: 'individual',
          profiles: {
            full_name: 'Sarah Johnson'
          },
          drivers: null,
          vehicles: null
        },
        {
          id: '3',
          pickup_location: 'Shopping Mall',
          dropoff_location: 'Residential Area',
          pickup_time: '2024-06-19T18:00:00',
          status: 'in_progress',
          estimated_cost: 320,
          booking_type: 'individual',
          profiles: {
            full_name: 'Alex Brown'
          },
          drivers: {
            profiles: {
              full_name: 'Emily Davis'
            }
          },
          vehicles: {
            vehicle_number: 'CAR-003'
          }
        }
      ];
      setBookings(mockBookings);
      toast({
        title: "Info",
        description: "Using demo data (Supabase connection disabled)",
      });
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch bookings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (booking: Booking) => {
    setEditingBooking(booking);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setShowCorporateForm(false);
    setEditingBooking(null);
    fetchBookings();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'in_progress': return 'secondary';
      case 'completed': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const filteredBookings = bookings.filter(booking =>
    booking.pickup_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.dropoff_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading bookings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Bookings</h2>
          <p className="text-muted-foreground">Manage individual and corporate bookings</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setShowForm(true)} variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Individual Booking
          </Button>
          <Button onClick={() => setShowCorporateForm(true)}>
            <Building className="mr-2 h-4 w-4" />
            Corporate Request
          </Button>
        </div>
      </div>

      <Tabs defaultValue="individual" className="space-y-4">
        <TabsList>
          <TabsTrigger value="individual" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Individual Bookings</span>
          </TabsTrigger>
          <TabsTrigger value="corporate" className="flex items-center space-x-2">
            <Building className="h-4 w-4" />
            <span>Corporate Requests</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="individual" className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search bookings..."
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
            {filteredBookings.map((booking) => (
              <Card key={booking.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {booking.profiles?.full_name || 'Unknown Customer'}
                    </CardTitle>
                    <div className="flex space-x-2">
                      <Badge variant={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                      {booking.booking_type && (
                        <Badge variant="outline">{booking.booking_type}</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-green-500" />
                      <div>
                        <span className="font-medium">From:</span>
                        <p className="truncate">{booking.pickup_location}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-red-500" />
                      <div>
                        <span className="font-medium">To:</span>
                        <p className="truncate">{booking.dropoff_location}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <div>
                        <span className="font-medium">Pickup:</span>
                        <p>{new Date(booking.pickup_time).toLocaleString()}</p>
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Cost:</span>
                      <p>₹{booking.estimated_cost || 'TBD'}</p>
                    </div>
                  </div>
                  
                  {(booking.drivers || booking.vehicles) && (
                    <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {booking.drivers && (
                        <div>
                          <span className="font-medium">Driver:</span>
                          <p>{booking.drivers.profiles?.full_name}</p>
                        </div>
                      )}
                      {booking.vehicles && (
                        <div>
                          <span className="font-medium">Vehicle:</span>
                          <p>{booking.vehicles.vehicle_number}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-4 flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(booking)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      Assign Driver
                    </Button>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="corporate">
          <div className="text-center py-8">
            <Building className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Corporate Booking Requests</h3>
            <p className="mt-1 text-sm text-gray-500">
              Corporate booking requests will appear here for vendor review
            </p>
            <div className="mt-6">
              <Button onClick={() => setShowCorporateForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Corporate Request
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {showForm && (
        <BookingForm 
          booking={editingBooking}
          onClose={handleCloseForm} 
        />
      )}

      {showCorporateForm && (
        <CorporateBookingForm onClose={handleCloseForm} />
      )}
    </div>
  );
};

export default BookingsPage;
