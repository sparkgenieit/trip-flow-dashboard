import React, { useState, useEffect } from 'react';
import {
  Tabs, TabsList, TabsTrigger, TabsContent,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Building, Users } from 'lucide-react';
import BookingForm from '@/components/bookings/BookingForm';
import CorporateBookingForm from '@/components/bookings/CorporateBookingForm';
import { fetchBookings, deleteBooking } from '@/services/bookings';
import { useToast } from '@/hooks/use-toast';

interface Booking {
  id: number;
  fare: number;
  pickupDateTime: string;
  status: string;
  vehicleType: { name: string };
  TripType: { label: string };
  pickupAddress: { address: string };
  dropAddress: { address: string };
  fromCity: { name: string };
  toCity: { name: string };
}

const BookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showCorporateForm, setShowCorporateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const loadBookings = async () => {
    try {
      const data = await fetchBookings();
      setBookings(data);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to load bookings',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await deleteBooking(id);
      toast({ title: 'Booking deleted' });
      loadBookings();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete booking',
        variant: 'destructive',
      });
    }
  };

  const filteredBookings = bookings.filter((b) =>
    b.pickupAddress?.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.dropAddress?.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.fromCity?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Bookings</h2>
          <p className="text-muted-foreground">Manage individual and corporate bookings</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowForm(true)} variant="outline">
            <Plus className="mr-2 h-4 w-4" /> New Booking
          </Button>
          <Button onClick={() => setShowCorporateForm(true)}>
            <Building className="mr-2 h-4 w-4" /> Corporate Request
          </Button>
        </div>
      </div>

      <Tabs defaultValue="individual" className="space-y-4">
        <TabsList>
          <TabsTrigger value="individual" className="flex items-center gap-2">
            <Users className="h-4 w-4" /> Individual Bookings
          </TabsTrigger>
          <TabsTrigger value="corporate" className="flex items-center gap-2">
            <Building className="h-4 w-4" /> Corporate Requests
          </TabsTrigger>
        </TabsList>

        {/* INDIVIDUAL TAB */}
        <TabsContent value="individual" className="space-y-4">
          <Input
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {filteredBookings.length === 0 ? (
            <p className="text-gray-500">No bookings available.</p>
          ) : (
            <div className="grid gap-4">
              {filteredBookings.map((booking) => (
                <div key={booking.id} className="bg-white p-4 shadow rounded flex justify-between items-center">
                  <div>
                    <p className="font-medium">
                      {booking.pickupAddress?.address} → {booking.dropAddress?.address}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(booking.pickupDateTime).toLocaleString()} | {booking.vehicleType?.name} | {booking.TripType?.label}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {booking.fromCity?.name} → {booking.toCity?.name}
                    </p>
                    <p className="text-sm text-green-700 font-semibold">Fare: ₹{booking.fare}</p>
                    <p className="text-sm text-yellow-600 font-medium">Status: {booking.status}</p>
                  </div>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowForm(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button variant="destructive" onClick={() => handleDelete(booking.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* CORPORATE TAB */}
        <TabsContent value="corporate">
          <div className="text-center py-8">
            <Building className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Corporate Booking Requests</h3>
            <p className="mt-1 text-sm text-gray-500">
              Corporate booking requests will appear here for vendor review
            </p>
            <div className="mt-6">
              <Button onClick={() => setShowCorporateForm(true)}>
                <Plus className="mr-2 h-4 w-4" /> New Corporate Request
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {showForm && (
        <BookingForm
          booking={selectedBooking ?? undefined}
          onClose={() => {
            setShowForm(false);
            setSelectedBooking(null);
            loadBookings();
          }}
          onSuccess={() => {
            setShowForm(false);
            setSelectedBooking(null);
            loadBookings();
          }}
        />
      )}

      {showCorporateForm && (
        <CorporateBookingForm
          onClose={() => {
            setShowCorporateForm(false);
          }}
        />
      )}
    </div>
  );
};

export default BookingsPage;
