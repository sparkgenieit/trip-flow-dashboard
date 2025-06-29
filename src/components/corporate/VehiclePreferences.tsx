
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

const employees = [
  { id: '1', name: 'John Smith' },
  { id: '2', name: 'Sarah Johnson' },
  { id: '3', name: 'Mike Chen' },
];

const vehicleTypes = ['Sedan', 'SUV', 'EV', 'Hatchback', 'AC', 'Non-AC'];

const VehiclePreferences = () => {
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);
  const { toast } = useToast();

  const handleVehicleToggle = (vehicle: string) => {
    setSelectedVehicles(prev => 
      prev.includes(vehicle) 
        ? prev.filter(v => v !== vehicle)
        : [...prev, vehicle]
    );
  };

  const handleSave = () => {
    if (!selectedEmployee) {
      toast({
        title: "Error",
        description: "Please select an employee",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Vehicle preferences saved successfully",
    });
    
    // Reset form
    setSelectedEmployee('');
    setSelectedVehicles([]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Vehicle Preferences</h1>
        <p className="text-gray-600">Set vehicle preferences for employees</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Employee Vehicle Preferences</CardTitle>
          <CardDescription>
            Select an employee and configure their preferred vehicle types
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="employee-select">Select Employee</Label>
            <select
              id="employee-select"
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Choose an employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <Label>Vehicle Preferences</Label>
            <div className="grid grid-cols-2 gap-4">
              {vehicleTypes.map((vehicle) => (
                <div key={vehicle} className="flex items-center space-x-2">
                  <Checkbox
                    id={vehicle}
                    checked={selectedVehicles.includes(vehicle)}
                    onCheckedChange={() => handleVehicleToggle(vehicle)}
                  />
                  <Label
                    htmlFor={vehicle}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {vehicle}
                    </span>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave}>
              Save Preferences
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VehiclePreferences;
