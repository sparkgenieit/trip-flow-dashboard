import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fetchBookings, deleteBooking } from '@/services/bookings';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import BookingForm from '@/components/bookings/BookingForm';
import CorporateBookingForm from '@/components/bookings/CorporateBookingForm';
import AssignVehicleModal from '@/components/bookings/AssignVehicleModal';
import VendorQuoteListModal from '@/components/bookings/VendorQuoteListModal';
import { shareBookingWithVendors, fetchQuotesForBooking } from '@/services/quotes';
import { useNavigate } from 'react-router-dom';
interface Booking {
  id: number;
  fare: number;
  pickupDateTime: string;
  status: string;
  vehicleType: { id: number; name: string };
  TripType: { label: string };
  pickupAddress: { address: string };
  dropAddress: { address: string };
  fromCity: { name: string };
  toCity: { name: string };
  customerType: 'Corporate' | 'Individual';
  customerName: string;
  numVehicles: number;
  vehiclesAssigned: number;
}

const BookingsPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showCorporateForm, setShowCorporateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [quoteBookingId, setQuoteBookingId] = useState<number | null>(null);
  const [assignTarget, setAssignTarget] = useState<{
    bookingId: number;
    vehicleTypeId: number;
    numVehicles: number;
  } | null>(null);
  const { toast } = useToast();

  const loadBookings = async () => {
    try {
      const data = await fetchBookings();
      setBookings(data);
    } catch {
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

  const handleAssign = async (booking: Booking) => {
    try {
      const quotes = await fetchQuotesForBooking(booking.id);
      const approved = quotes.find((q: any) => q.approved);
      if (!approved) {
        toast({ title: 'Cannot assign', description: 'No quote approved yet', variant: 'destructive' });
        return;
      }
      setAssignTarget({
        bookingId: booking.id,
        vehicleTypeId: booking.vehicleType?.id,
        numVehicles: booking.numVehicles,
      });
      setAssignModalOpen(true);
    } catch {
      toast({ title: 'Error', description: 'Failed to check quotes', variant: 'destructive' });
    }
  };

  const filteredBookings = bookings.filter((b) =>
    (b.pickupAddress?.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.dropAddress?.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.fromCity?.name?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter ? b.status === statusFilter : true)
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Bookings</h2>
          <p className="text-muted-foreground">Manage trip bookings and vehicle assignments</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-blue-600 text-white">
          <Plus className="h-4 w-4 mr-2" /> New Booking
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Search by customer, pickup, or destination..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md"
        />
        <select
          className="border rounded px-4 py-2"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      <div className="bg-white border rounded-md">
        <div className="p-4 border-b font-semibold grid grid-cols-7 gap-2 text-sm text-gray-700">
          <div>Customer</div>
          <div>Trip Details</div>
          <div>Pickup</div>
          <div>Date & Time</div>
          <div>Vehicles</div>
          <div>Status</div>
          <div>Actions</div>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="p-4 text-gray-500">No bookings found.</div>
        ) : (
          filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="p-4 border-t grid grid-cols-7 gap-2 items-center text-sm"
            >
              <div>
                <div className="font-medium">{booking.customerName}</div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${booking.customerType === 'Corporate'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                    }`}
                >
                  {booking.customerType}
                </span>
              </div>
              <div>
                🚗 {booking.vehicleType?.name}
                <br />
                👥 {booking.numVehicles} required
              </div>
              <div>
                <span className="text-green-700">📍 {booking.pickupAddress?.address}</span>
                <br />
                <span className="text-red-700">📍 {booking.dropAddress?.address}</span>
              </div>
              <div>
                🕒 {new Date(booking.pickupDateTime).toLocaleDateString()}
                <br />
                {new Date(booking.pickupDateTime).toLocaleTimeString()}
              </div>
              <div className="flex flex-col gap-1">
                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                  {booking.vehiclesAssigned > 0
                    ? `${booking.vehiclesAssigned} assigned`
                    : 'Not Assigned'}
                </span>
                <Button
                  variant={booking.vehiclesAssigned > 0 ? 'outline' : 'default'}
                  size="sm"
                  onClick={() => handleAssign(booking)}
                >
                  {booking.vehiclesAssigned > 0 ? 'Reassign' : 'Assign'}
                </Button>
              </div>
              <div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${booking.status === 'Confirmed'
                      ? 'bg-blue-100 text-blue-800'
                      : booking.status === 'Completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                >
                  {booking.status}
                </span>
              </div>
              <div className="space-x-2">
                <Button
                  variant="default"
                  onClick={() => navigate(`/dashboard/bookings/view/?bookingId=${booking.id}`)}
                >
                  View
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedBooking(booking);
                    setShowForm(true);
                  }}
                >
                  Edit
                </Button>
                <Button variant="secondary" onClick={async () => {
                  await shareBookingWithVendors(booking.id);
                  toast({ title: 'Shared with vendors' });
                }}>
                  📤 Share
                </Button>
                <Button variant="outline" onClick={() => {
                  setQuoteBookingId(booking.id);
                  setQuoteModalOpen(true);
                }}>
                  💬 Quotes
                </Button>
                <Button variant="destructive" onClick={() => handleDelete(booking.id)}>
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {assignTarget && (
        <AssignVehicleModal
          open={assignModalOpen}
          bookingId={assignTarget.bookingId}
          vehicleTypeId={assignTarget.vehicleTypeId}
          numVehicles={assignTarget.numVehicles}
          onClose={() => setAssignModalOpen(false)}
          onAssigned={loadBookings}
        />
      )}

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

      {quoteBookingId !== null && (
        <VendorQuoteListModal
          bookingId={quoteBookingId}
          open={quoteModalOpen}
          onClose={() => setQuoteModalOpen(false)}
          onApproved={loadBookings}
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
