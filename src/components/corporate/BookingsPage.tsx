import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import BookingForm from '@/components/bookings/BookingForm';
import { fetchBookings, deleteBooking } from '@/services/bookings';
import { useToast } from '@/hooks/use-toast';

interface Booking {
  id: number;
  fare: number;
  pickupDateTime: string;
  status: string;
  vehicleType: {
    name: string;
  };
  TripType: {
    label: string;
  };
  pickupAddress: {
    address: string;
  };
  dropAddress: {
    address: string;
  };
  fromCity: {
    name: string;
  };
  toCity: {
    name: string;
  };
}

const BookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const loadBookings = async () => {
    try {
      const data = await fetchBookings();
      setBookings(data);
    } catch (err) {
      console.error('Error loading bookings:', err);
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
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to delete booking',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Bookings</h2>
        <Button onClick={() => { setSelectedBooking(null); setShowForm(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          New Booking
        </Button>
      </div>

      {bookings.length === 0 ? (
        <p className="text-gray-500">No bookings available.</p>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => (
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

      {showForm && (
        <BookingForm
          booking={selectedBooking ?? undefined}
          onClose={() => {
            setShowForm(false);
            setSelectedBooking(null);
            loadBookings();
          }
        }
          onSuccess={() => {
          setShowForm(false);
          setSelectedBooking(null);
          loadBookings();
        }}
        />
      )}
    </div>
  );
};

export default BookingsPage;
