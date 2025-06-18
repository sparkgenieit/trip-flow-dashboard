
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Users, Clock } from 'lucide-react';

interface CorporateBookingFormProps {
  onClose: () => void;
}

const CorporateBookingForm: React.FC<CorporateBookingFormProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    company_name: '',
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    pickup_location: '',
    dropoff_location: '',
    start_date: '',
    end_date: '',
    booking_type: 'daily',
    number_of_vehicles: '1',
    vehicle_type: 'sedan',
    estimated_passengers: '1',
    special_requirements: '',
    budget_range: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Mock success for demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Corporate Booking Request Submitted",
        description: "Vendors will review your request and respond within 24 hours",
      });

      onClose();
    } catch (error) {
      console.error('Error saving corporate booking:', error);
      toast({
        title: "Error",
        description: "Failed to submit corporate booking request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Corporate Booking Request</span>
          </DialogTitle>
          <DialogDescription>
            Submit a request for multiple vehicles and extended booking periods
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_person">Contact Person</Label>
              <Input
                id="contact_person"
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input
                id="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_phone">Contact Phone</Label>
              <Input
                id="contact_phone"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="booking_type">Booking Type</Label>
              <Select value={formData.booking_type} onValueChange={(value) => setFormData({ ...formData, booking_type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="weekend">Weekend Only</SelectItem>
                  <SelectItem value="custom">Custom Schedule</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="number_of_vehicles">Number of Vehicles</Label>
              <Input
                id="number_of_vehicles"
                type="number"
                min="1"
                max="50"
                value={formData.number_of_vehicles}
                onChange={(e) => setFormData({ ...formData, number_of_vehicles: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated_passengers">Total Passengers</Label>
              <Input
                id="estimated_passengers"
                type="number"
                min="1"
                value={formData.estimated_passengers}
                onChange={(e) => setFormData({ ...formData, estimated_passengers: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vehicle_type">Preferred Vehicle Type</Label>
              <Select value={formData.vehicle_type} onValueChange={(value) => setFormData({ ...formData, vehicle_type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedan">Sedan</SelectItem>
                  <SelectItem value="suv">SUV</SelectItem>
                  <SelectItem value="van">Van</SelectItem>
                  <SelectItem value="bus">Bus</SelectItem>
                  <SelectItem value="mixed">Mixed Fleet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget_range">Budget Range</Label>
              <Select value={formData.budget_range} onValueChange={(value) => setFormData({ ...formData, budget_range: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select budget range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="under_50k">Under ₹50,000</SelectItem>
                  <SelectItem value="50k_100k">₹50,000 - ₹1,00,000</SelectItem>
                  <SelectItem value="100k_250k">₹1,00,000 - ₹2,50,000</SelectItem>
                  <SelectItem value="250k_500k">₹2,50,000 - ₹5,00,000</SelectItem>
                  <SelectItem value="above_500k">Above ₹5,00,000</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="special_requirements">Special Requirements</Label>
            <Textarea
              id="special_requirements"
              value={formData.special_requirements}
              onChange={(e) => setFormData({ ...formData, special_requirements: e.target.value })}
              placeholder="Driver language preferences, vehicle amenities, accessibility needs, etc."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional information for vendors"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CorporateBookingForm;
