
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface BookingFormProps {
  booking?: any;
  onClose: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ booking, onClose }) => {
  const [formData, setFormData] = useState({
    pickup_location: '',
    dropoff_location: '',
    pickup_time: '',
    booking_type: 'individual',
    vehicle_type: '',
    vehicle_model: '',
    estimated_cost: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const vehicleOptions = {
    hatchback: ['Swift', 'Wagon R', 'Alto', 'i10', 'Santro'],
    sedan: ['Dzire', 'Etios', 'Amaze', 'Xcent', 'City'],
    suv: ['Innova Crysta', 'Ertiga', 'Scorpio', 'XUV300', 'Brezza']
  };

  useEffect(() => {
    if (booking) {
      setFormData({
        pickup_location: booking.pickup_location || '',
        dropoff_location: booking.dropoff_location || '',
        pickup_time: booking.pickup_time ? booking.pickup_time.slice(0, 16) : '',
        booking_type: booking.booking_type || 'individual',
        vehicle_type: booking.vehicle_type || '',
        vehicle_model: booking.vehicle_model || '',
        estimated_cost: booking.estimated_cost?.toString() || '',
        notes: booking.notes || ''
      });
    }
  }, [booking]);

  const handleVehicleTypeChange = (value: string) => {
    setFormData({ 
      ...formData, 
      vehicle_type: value,
      vehicle_model: '' // Reset model when type changes
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Mock success for demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: booking ? "Booking updated successfully (demo mode)" : "Booking created successfully (demo mode)",
      });

      onClose();
    } catch (error) {
      console.error('Error saving booking:', error);
      toast({
        title: "Error",
        description: "Failed to save booking",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{booking ? 'Edit Booking' : 'Create New Booking'}</DialogTitle>
          <DialogDescription>
            {booking ? 'Update booking details' : 'Enter details for the new booking'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pickup_location">Pickup Location</Label>
            <Input
              id="pickup_location"
              value={formData.pickup_location}
              onChange={(e) => setFormData({ ...formData, pickup_location: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dropoff_location">Dropoff Location</Label>
            <Input
              id="dropoff_location"
              value={formData.dropoff_location}
              onChange={(e) => setFormData({ ...formData, dropoff_location: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pickup_time">Pickup Time</Label>
            <Input
              id="pickup_time"
              type="datetime-local"
              value={formData.pickup_time}
              onChange={(e) => setFormData({ ...formData, pickup_time: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="booking_type">Booking Type</Label>
            <Select value={formData.booking_type} onValueChange={(value) => setFormData({ ...formData, booking_type: value })}>
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
            <Label htmlFor="vehicle_type">Vehicle Type</Label>
            <Select value={formData.vehicle_type} onValueChange={handleVehicleTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select vehicle type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hatchback">Hatchback</SelectItem>
                <SelectItem value="sedan">Sedan</SelectItem>
                <SelectItem value="suv">SUV</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.vehicle_type && (
            <div className="space-y-2">
              <Label htmlFor="vehicle_model">Vehicle Model</Label>
              <Select value={formData.vehicle_model} onValueChange={(value) => setFormData({ ...formData, vehicle_model: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle model" />
                </SelectTrigger>
                <SelectContent>
                  {vehicleOptions[formData.vehicle_type as keyof typeof vehicleOptions]?.map((model) => (
                    <SelectItem key={model} value={model.toLowerCase().replace(' ', '_')}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="estimated_cost">Estimated Cost</Label>
            <Input
              id="estimated_cost"
              type="number"
              step="0.01"
              value={formData.estimated_cost}
              onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
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
