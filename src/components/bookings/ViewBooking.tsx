import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { fetchBookings } from '@/services/bookings';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import VendorQuoteFormModal from '@/components/bookings/VendorQuoteFormModal'; // ✅ Ensure this exists

const ViewBooking: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [booking, setBooking] = useState<any>(null);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);

  const bookingId = Number(searchParams.get('bookingId'));

  useEffect(() => {
    if (!bookingId || isNaN(bookingId)) {
      toast({ title: 'Invalid Booking ID', variant: 'destructive' });
      return;
    }

    const loadBooking = async () => {
      try {
        const all = await fetchBookings();
        const found = all.find((b: any) => b.id === bookingId);
        if (!found) {
          toast({ title: 'Not Found', description: 'Booking not found', variant: 'destructive' });
        } else {
          setBooking(found);
        }
      } catch {
        toast({ title: 'Error', description: 'Could not fetch booking', variant: 'destructive' });
      }
    };

    loadBooking();
  }, [bookingId]);

  if (!booking) return <div className="p-6 text-gray-600">Loading booking details...</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Booking #{booking.id}</h2>
        {!booking.vendorId && (
          <Button variant="secondary" onClick={() => setQuoteModalOpen(true)}>
            💬 Quote
          </Button>
        )}
      </div>

      <div className="border rounded p-6 bg-white grid grid-cols-2 gap-4">
        <div><strong>Customer:</strong> {booking.user?.name || 'N/A'} ({booking.user?.email})</div>
        <div><strong>Phone:</strong> {booking.user?.phone || 'N/A'}</div>

        <div><strong>Vehicle Type:</strong> {booking.vehicleType?.name}</div>
        <div><strong>Trip Type:</strong> {booking.TripType?.label}</div>

        <div><strong>Booking Type:</strong> {booking.bookingType}</div>
        <div><strong>Status:</strong> {booking.status}</div>

        <div><strong>Pickup Address:</strong> {booking.pickupAddress?.address}, {booking.pickupAddress?.city} - {booking.pickupAddress?.pinCode}</div>
        <div><strong>Drop Address:</strong> {booking.dropAddress?.address}, {booking.dropAddress?.city} - {booking.dropAddress?.pinCode}</div>

        <div><strong>From City:</strong> {booking.fromCity?.name}, {booking.fromCity?.state}</div>
        <div><strong>To City:</strong> {booking.toCity?.name}, {booking.toCity?.state}</div>

        <div><strong>Pickup Time:</strong> {new Date(booking.pickupDateTime).toLocaleString()}</div>
        <div><strong>Created At:</strong> {new Date(booking.createdAt).toLocaleString()}</div>

        <div><strong>Fare:</strong> ₹{booking.fare.toFixed(2)}</div>
        <div><strong>Rate/km:</strong> ₹{booking.vehicleType?.estimatedRatePerKm}</div>

        <div><strong>Passengers:</strong> {booking.numPersons}</div>
        <div><strong>Vehicles Needed:</strong> {booking.numVehicles}</div>
      </div>

      <Button variant="secondary" onClick={() => navigate(`/dashboard/bookings`)}>
        ← Back to Bookings
      </Button>

      {/* ✅ Quote Modal */}
      {quoteModalOpen && (
        <VendorQuoteFormModal
          open={quoteModalOpen}
          bookingId={booking.id}
          onClose={() => setQuoteModalOpen(false)}
          onSubmitted={() => {
            setQuoteModalOpen(false);
            toast({ title: 'Quote submitted successfully' });
          }}
        />
      )}
    </div>
  );
};

export default ViewBooking;
