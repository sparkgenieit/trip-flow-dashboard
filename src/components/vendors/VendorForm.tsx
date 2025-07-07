
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { createVendor, updateVendor } from '@/services/vendor';

interface VendorFormProps {
  vendor?: any;
  onSuccess: () => void;
  onClose: () => void;
}

const VendorForm: React.FC<VendorFormProps> = ({ vendor, onClose, onSuccess }) => {
const [formData, setFormData] = useState({
  name: '',
  companyReg: '',
  vendorId: ''
  });

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

useEffect(() => {
  if (vendor) {
    setFormData({
      name: vendor.name || '',
      companyReg: vendor.companyReg || '',
      vendorId: vendor.vendorId?.toString() || ''
    });
  }
}, [vendor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
  const payload = {
  name: formData.name,
  companyReg: formData.companyReg,
  vendorId: Number(formData.vendorId)
  };


  if (vendor?.id) {
    await updateVendor(vendor.id, payload);
    toast({ title: "Vendor updated successfully" });
  } else {
    await createVendor(payload);
    toast({ title: "Vendor created successfully" });
  }
  onSuccess();
  onClose();
       }
catch (error: any) {
  console.error('Error saving vendor:', error);
  toast({
    title: "Error",
    description: error?.response?.data?.message || "Failed to save vendor",
    variant: "destructive",
  });
}
 finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{vendor ? 'Edit Vendor' : 'Add New Vendor'}</DialogTitle>
          <DialogDescription>
            {vendor ? 'Update vendor information' : 'Enter details for the new vendor'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyReg">Company Name</Label>
            <Input
              id="companyReg"
              value={formData.companyReg}
              onChange={(e) => setFormData({ ...formData, companyReg: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendorId">Vendor User ID</Label>
            <Input
              id="vendorId"
              type="number"
              value={formData.vendorId}
              onChange={(e) => setFormData({ ...formData, vendorId: e.target.value.replace(/\D/, '') })}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : vendor ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default VendorForm;
