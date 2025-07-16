import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { submitQuote, fetchSharedBookings } from '@/services/quotes';

interface Booking {
  id: number;
  customerName: string;
  pickupAddress: { address: string };
  dropAddress: { address: string };
  pickupDateTime: string;
  vehicleType: { name: string };
  numVehicles: number;
}

const VendorBiddingPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [quotes, setQuotes] = useState<Record<number, string>>({});
  const { toast } = useToast();

  const loadBookings = async () => {
    try {
      const data = await fetchSharedBookings();
      setBookings(data);
    } catch {
      toast({ title: 'Error loading bookings', variant: 'destructive' });
    }
  };

  const handleQuoteSubmit = async (bookingId: number) => {
    try {
      const amount = parseFloat(quotes[bookingId]);
      if (isNaN(amount)) throw new Error();
      await submitQuote(bookingId, amount);
      toast({ title: 'Quote submitted!' });
    } catch {
      toast({ title: 'Invalid quote', variant: 'destructive' });
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Available Bookings</h2>
      {bookings.length === 0 ? (
        <p>No bookings shared with you.</p>
      ) : (
        bookings.map((booking) => (
          <div key={booking.id} className="border p-4 rounded shadow-sm">
            <div className="font-semibold">{booking.customerName}</div>
            <div>{booking.vehicleType.name} - {booking.numVehicles} required</div>
            <div>📍 {booking.pickupAddress.address} ➡️ {booking.dropAddress.address}</div>
            <div>🕒 {new Date(booking.pickupDateTime).toLocaleString()}</div>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Enter quote"
                value={quotes[booking.id] || ''}
                onChange={(e) =>
                  setQuotes((prev) => ({ ...prev, [booking.id]: e.target.value }))
                }
              />
              <Button onClick={() => handleQuoteSubmit(booking.id)}>Assign to Me</Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default VendorBiddingPage;
