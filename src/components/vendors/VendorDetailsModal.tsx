// components/admin/vendors/VendorDetailsModal.tsx
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const VendorDetailsModal = ({ vendor, onClose }: { vendor: any, onClose: () => void }) => {
  return (
    <Dialog open={!!vendor} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Vendor Details</DialogTitle>
          <DialogDescription>Details of the selected vendor</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 text-sm">
          <div><span className="font-medium">Name:</span> {vendor.name}</div>
          <div><span className="font-medium">Company Reg:</span> {vendor.companyReg}</div>
          <div><span className="font-medium">Email:</span> {vendor.vendor?.email}</div>
          <div><span className="font-medium">Phone:</span> {vendor.vendor?.phone}</div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VendorDetailsModal;
