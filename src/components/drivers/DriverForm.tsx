
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DriverFormProps {
  driver?: any;
  onClose: () => void;
}

const DriverForm: React.FC<DriverFormProps> = ({ driver, onClose }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    license_number: '',
    license_expiry: '',
    is_part_time: false,
    is_available: true,
    vendor_id: '',
    assigned_vehicle_id: ''
  });
  const [vendors, setVendors] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchVendorsAndVehicles();
    if (driver) {
      setFormData({
        full_name: driver.profiles?.full_name || '',
        phone: driver.profiles?.phone || '',
        email: '',
        license_number: driver.license_number || '',
        license_expiry: driver.license_expiry || '',
        is_part_time: driver.is_part_time || false,
        is_available: driver.is_available || true,
        vendor_id: driver.vendor_id || '',
        assigned_vehicle_id: driver.assigned_vehicle_id || ''
      });
    }
  }, [driver]);

  const fetchVendorsAndVehicles = async () => {
    try {
      const [vendorsRes, vehiclesRes] = await Promise.all([
        supabase.from('vendors').select('id, company_name'),
        supabase.from('vehicles').select('id, vehicle_number, type').eq('status', 'available')
      ]);

      setVendors(vendorsRes.data || []);
      setVehicles(vehiclesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (driver) {
        // Update existing driver
        const { error: driverError } = await supabase
          .from('drivers')
          .update({
            license_number: formData.license_number,
            license_expiry: formData.license_expiry || null,
            is_part_time: formData.is_part_time,
            is_available: formData.is_available,
            vendor_id: formData.vendor_id || null,
            assigned_vehicle_id: formData.assigned_vehicle_id || null
          })
          .eq('id', driver.id);

        if (driverError) throw driverError;

        // Update profile
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: formData.full_name,
            phone: formData.phone
          })
          .eq('id', driver.user_id);

        if (profileError) throw profileError;

        toast({
          title: "Success",
          description: "Driver updated successfully",
        });
      } else {
        // Create new user and driver
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: 'temppassword123', // You might want to generate a random password
          options: {
            data: {
              full_name: formData.full_name,
              phone: formData.phone,
              role: 'driver'
            }
          }
        });

        if (authError) throw authError;

        if (authData.user) {
          const { error: driverError } = await supabase
            .from('drivers')
            .insert({
              user_id: authData.user.id,
              license_number: formData.license_number,
              license_expiry: formData.license_expiry || null,
              is_part_time: formData.is_part_time,
              is_available: formData.is_available,
              vendor_id: formData.vendor_id || null,
              assigned_vehicle_id: formData.assigned_vehicle_id || null
            });

          if (driverError) throw driverError;
        }

        toast({
          title: "Success",
          description: "Driver created successfully",
        });
      }

      onClose();
    } catch (error) {
      console.error('Error saving driver:', error);
      toast({
        title: "Error",
        description: "Failed to save driver",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{driver ? 'Edit Driver' : 'Add New Driver'}</DialogTitle>
          <DialogDescription>
            {driver ? 'Update driver information' : 'Enter details for the new driver'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>

          {!driver && (
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="license_number">License Number</Label>
            <Input
              id="license_number"
              value={formData.license_number}
              onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="license_expiry">License Expiry</Label>
            <Input
              id="license_expiry"
              type="date"
              value={formData.license_expiry}
              onChange={(e) => setFormData({ ...formData, license_expiry: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendor_id">Vendor</Label>
            <Select value={formData.vendor_id} onValueChange={(value) => setFormData({ ...formData, vendor_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select vendor (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Independent</SelectItem>
                {vendors.map((vendor: any) => (
                  <SelectItem key={vendor.id} value={vendor.id}>
                    {vendor.company_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assigned_vehicle_id">Assigned Vehicle</Label>
            <Select value={formData.assigned_vehicle_id} onValueChange={(value) => setFormData({ ...formData, assigned_vehicle_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select vehicle (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No vehicle assigned</SelectItem>
                {vehicles.map((vehicle: any) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.vehicle_number} - {vehicle.type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_part_time"
              checked={formData.is_part_time}
              onCheckedChange={(checked) => setFormData({ ...formData, is_part_time: checked as boolean })}
            />
            <Label htmlFor="is_part_time">Part-time driver</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_available"
              checked={formData.is_available}
              onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked as boolean })}
            />
            <Label htmlFor="is_available">Available for trips</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : driver ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DriverForm;
