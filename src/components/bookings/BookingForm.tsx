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
    pickupTime: '',
    bookingType: 'individual',
    vehicleType: '',
    vehicleModel: '',
    estimatedCost: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const vehicleOptions = {
    hatchback: ['Swift', 'Wagon R', 'Alto', 'i10', 'Santro'],
    sedan: ['Dzire', 'Etios', 'Amaze', 'Xcent', 'City'],
    suv: ['Innova Crysta', 'Ertiga', 'Scorpio', 'XUV300', 'Brezza'],
  };

  useEffect(() => {
    if (booking) {
      setFormData({
        email: booking.email || '',
        pickupLocation: booking.pickupLocation || '',
        dropoffLocation: booking.dropoffLocation || '',
        pickupTime: booking.pickupTime?.slice(0, 16) || '',
        bookingType: booking.bookingType || 'individual',
        vehicleType: booking.vehicleType || '',
        vehicleModel: booking.vehicleModel || '',
        estimatedCost: booking.estimatedCost?.toString() || '',
        notes: booking.notes || '',
      });
    }
  }, [booking]);

  useEffect(() => {
const prefillUserDetails = async () => {
  if (formData.email && formData.email.includes('@')) {
    try {
      const res = await fetchUserByEmail(formData.email);
      const { exists, user, addresses } = res;

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

  const handleVehicleTypeChange = (value: string) => {
    setFormData({
      ...formData,
      vehicleType: value,
      vehicleModel: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        estimatedCost: parseFloat(formData.estimatedCost || '0'),
        pickupTime: new Date(formData.pickupTime),
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
            <Label htmlFor="email">User Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pickupLocation">Pickup Location</Label>
            <Input
              id="pickupLocation"
              value={formData.pickupLocation}
              onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dropoffLocation">Dropoff Location</Label>
            <Input
              id="dropoffLocation"
              value={formData.dropoffLocation}
              onChange={(e) => setFormData({ ...formData, dropoffLocation: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pickupTime">Pickup Time</Label>
            <Input
              id="pickupTime"
              type="datetime-local"
              value={formData.pickupTime}
              onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bookingType">Booking Type</Label>
            <Select
              value={formData.bookingType}
              onValueChange={(value) => setFormData({ ...formData, bookingType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select booking type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="corporate">Corporate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vehicleType">Vehicle Type</Label>
            <Select value={formData.vehicleType} onValueChange={handleVehicleTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select vehicle type" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(vehicleOptions).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.vehicleType && (
            <div className="space-y-2">
              <Label htmlFor="vehicleModel">Vehicle Model</Label>
              <Select
                value={formData.vehicleModel}
                onValueChange={(value) => setFormData({ ...formData, vehicleModel: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle model" />
                </SelectTrigger>
                <SelectContent>
                  {vehicleOptions[formData.vehicleType as keyof typeof vehicleOptions].map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="estimatedCost">Estimated Cost</Label>
            <Input
              id="estimatedCost"
              type="number"
              step="0.01"
              value={formData.estimatedCost}
              onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : booking ? 'Update Booking' : 'Create Booking'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookingForm;
