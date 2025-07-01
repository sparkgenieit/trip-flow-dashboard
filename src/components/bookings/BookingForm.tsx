import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { createBooking, updateBooking, fetchUserByEmail } from '@/services/bookings';

interface BookingFormProps {
  booking?: any;
  onClose: () => void;
  onSuccess: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ booking, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    pickupLocation: '',
    dropoffLocation: '',
    pickupDateTime: '',
    bookingType: 'individual',
    vehicleType: '',
    estimatedCost: '',
    notes: '',
    fromCity: '',
    dropCity: '',
    tripType: '',
  });

  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState<any[]>([]);
  const [tripTypes, setTripTypes] = useState<any[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (booking) {
      setFormData((prev) => ({
        ...prev,
        email: booking.email || '',
        pickupLocation: booking.pickupLocation || '',
        dropoffLocation: booking.dropoffLocation || '',
        pickupDateTime: booking.pickupDateTime?.slice(0, 16) || '',
        bookingType: booking.bookingType || 'individual',
        vehicleType: String(booking.vehicleTypeId || ''),
        estimatedCost: booking.estimatedCost?.toString() || '',
        notes: booking.notes || '',
        fromCity: String(booking.fromCityId || ''),
        dropCity: String(booking.toCityId || ''),
        tripType: String(booking.tripTypeId || ''),
      }));
    }
  }, [booking]);

  useEffect(() => {
    const prefillUserDetails = async () => {
      if (formData.email && formData.email.includes('@')) {
        try {
          const res = await fetchUserByEmail(formData.email);
          const { exists, addresses } = res;
          if (exists && addresses?.length) {
            const pickup = addresses.find((addr) => addr.type === 'PICKUP');
            const drop = addresses.find((addr) => addr.type === 'DROP');
            setFormData((prev) => ({
              ...prev,
              pickupLocation: pickup?.address || '',
              dropoffLocation: drop?.address || '',
            }));
          }
        } catch (error) {
          console.error('Email check failed:', error);
        }
      }
    };
    prefillUserDetails();
  }, [formData.email]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');

    fetch(`${import.meta.env.VITE_API_BASE_URL}/cities`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    })
      .then((res) => res.json())
      .then(setCities)
      .catch((err) => console.error('Failed to fetch cities', err));

    fetch(`${import.meta.env.VITE_API_BASE_URL}/trip-types`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    })
      .then((res) => res.json())
      .then(setTripTypes)
      .catch((err) => console.error('Failed to fetch trip types', err));

    fetch(`${import.meta.env.VITE_API_BASE_URL}/vehicle-types`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    })
      .then((res) => res.json())
      .then(setVehicleTypes)
      .catch((err) => console.error('Failed to fetch vehicle types', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        estimatedCost: parseFloat(formData.estimatedCost || '0'),
        pickupDateTime: new Date(formData.pickupDateTime).toISOString(),
        fromCityId: Number(formData.fromCity),
        toCityId: Number(formData.dropCity),
        vehicleTypeId: Number(formData.vehicleType),
        tripTypeId: Number(formData.tripType),
        fare: parseFloat(formData.estimatedCost || '0'),
      };

      if (booking?.id) {
        await updateBooking(booking.id, payload);
        toast({ title: 'Booking updated successfully' });
      } else {
        await createBooking(payload);
        toast({ title: 'Booking created successfully' });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to save booking',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{booking ? 'Edit Booking' : 'Create New Booking'}</DialogTitle>
          <DialogDescription>
            {booking ? 'Update booking details' : 'Enter details for the new booking'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>User Email</Label>
            <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
          </div>

          <div className="space-y-2">
            <Label>Pickup Location</Label>
            <Input value={formData.pickupLocation} onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })} required />
          </div>

          <div className="space-y-2">
            <Label>Dropoff Location</Label>
            <Input value={formData.dropoffLocation} onChange={(e) => setFormData({ ...formData, dropoffLocation: e.target.value })} required />
          </div>

          <div className="space-y-2">
            <Label>Pickup Time</Label>
            <Input type="datetime-local" value={formData.pickupDateTime} onChange={(e) => setFormData({ ...formData, pickupDateTime: e.target.value })} required />
          </div>

          <div className="space-y-2">
            <Label>From City</Label>
            <Select value={formData.fromCity} onValueChange={(value) => setFormData({ ...formData, fromCity: value })}>
              <SelectTrigger><SelectValue placeholder="Select from city" /></SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={String(city.id)}>{city.name}, {city.state}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Drop City</Label>
            <Select value={formData.dropCity} onValueChange={(value) => setFormData({ ...formData, dropCity: value })}>
              <SelectTrigger><SelectValue placeholder="Select drop city" /></SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={String(city.id)}>{city.name}, {city.state}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Trip Type</Label>
            <Select value={formData.tripType} onValueChange={(value) => setFormData({ ...formData, tripType: value })}>
              <SelectTrigger><SelectValue placeholder="Select trip type" /></SelectTrigger>
              <SelectContent>
                {tripTypes.map((type) => (
                  <SelectItem key={type.id} value={String(type.id)}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Vehicle Type</Label>
            <Select value={formData.vehicleType} onValueChange={(value) => setFormData({ ...formData, vehicleType: value })}>
              <SelectTrigger><SelectValue placeholder="Select vehicle type" /></SelectTrigger>
              <SelectContent>
                {vehicleTypes.map((v) => (
                  <SelectItem key={v.id} value={String(v.id)}>{v.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Estimated Cost</Label>
            <Input type="number" step="0.01" value={formData.estimatedCost} onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea rows={3} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : booking ? 'Update Booking' : 'Create Booking'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookingForm;
