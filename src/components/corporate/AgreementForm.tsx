import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const AgreementForm = () => {
  return (
    <div className="p-6 bg-white shadow rounded max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Corporate Agreement Form</h2>
      <p className="text-gray-600 mb-6">Submit a request for multiple vehicles and extended booking periods</p>

      <form className="grid grid-cols-2 gap-4">
        {/* Company Info */}
        <div>
          <Label>Company Name</Label>
          <Input required />
        </div>
        <div>
          <Label>Contact Person</Label>
          <Input required />
        </div>

        <div>
          <Label>Contact Email</Label>
          <Input type="email" required />
        </div>
        <div>
          <Label>Contact Phone</Label>
          <Input type="tel" required />
        </div>

        {/* Location */}
        <div>
          <Label>Pickup Location</Label>
          <Input required />
        </div>
        <div>
          <Label>Dropoff Location</Label>
          <Input required />
        </div>

        {/* Dates */}
        <div>
          <Label>Start Date</Label>
          <Input type="date" required />
        </div>
        <div>
          <Label>End Date</Label>
          <Input type="date" required />
        </div>

        {/* Booking Type */}
        <div>
          <Label>Booking Type</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="event">Event Based</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Vehicles/Passengers */}
        <div>
          <Label>Number of Vehicles</Label>
          <Input type="number" min="1" defaultValue="1" required />
        </div>
        <div>
          <Label>Total Passengers</Label>
          <Input type="number" min="1" defaultValue="1" required />
        </div>

        {/* Preferences */}
        <div>
          <Label>Preferred Vehicle Type</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select vehicle type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sedan">Sedan</SelectItem>
              <SelectItem value="suv">SUV</SelectItem>
              <SelectItem value="van">Van</SelectItem>
              <SelectItem value="luxury">Luxury</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Budget Range</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select budget range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10k-20k">10k - 20k</SelectItem>
              <SelectItem value="20k-30k">20k - 30k</SelectItem>
              <SelectItem value="30k+">30k+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notes */}
        <div className="col-span-2">
          <Label>Notes</Label>
          <Textarea rows={3} placeholder="Special requirements or notes" />
        </div>

        <div className="col-span-2 flex justify-end mt-4">
          <Button type="submit">Submit Agreement</Button>
        </div>
      </form>
    </div>
  );
};

export default AgreementForm;
