
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from 'lucide-react';

const employees = [
  { id: '1', name: 'John Smith' },
  { id: '2', name: 'Sarah Johnson' },
  { id: '3', name: 'Mike Chen' },
];

const vehicleTypes = ['Sedan', 'SUV', 'EV', 'Hatchback'];

const RequestBooking = () => {
  const [formData, setFormData] = useState({
    employee: '',
    date: '',
    time: '',
    pickupLocation: '',
    dropLocation: '',
    purpose: '',
    vehiclePreference: ''
  });
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = ['employee', 'date', 'time', 'pickupLocation', 'dropLocation', 'purpose'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Booking request submitted successfully",
    });

    // Reset form
    setFormData({
      employee: '',
      date: '',
      time: '',
      pickupLocation: '',
      dropLocation: '',
      purpose: '',
      vehiclePreference: ''
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Request Booking</h1>
        <p className="text-gray-600">Create a new booking request for an employee</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            New Booking Request
          </CardTitle>
          <CardDescription>
            Fill in the details to create a booking request
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="employee">Employee *</Label>
                <select
                  id="employee"
                  value={formData.employee}
                  onChange={(e) => handleInputChange('employee', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehiclePreference">Vehicle Preference</Label>
                <select
                  id="vehiclePreference"
                  value={formData.vehiclePreference}
                  onChange={(e) => handleInputChange('vehiclePreference', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Any Vehicle</option>
                  {vehicleTypes.map((vehicle) => (
                    <option key={vehicle} value={vehicle}>
                      {vehicle}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pickupLocation">Pickup Location *</Label>
              <Input
                id="pickupLocation"
                value={formData.pickupLocation}
                onChange={(e) => handleInputChange('pickupLocation', e.target.value)}
                placeholder="Enter pickup location"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dropLocation">Drop Location *</Label>
              <Input
                id="dropLocation"
                value={formData.dropLocation}
                onChange={(e) => handleInputChange('dropLocation', e.target.value)}
                placeholder="Enter drop location"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose *</Label>
              <Input
                id="purpose"
                value={formData.purpose}
                onChange={(e) => handleInputChange('purpose', e.target.value)}
                placeholder="Meeting, airport transfer, etc."
                required
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit">
                Submit Request
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RequestBooking;
