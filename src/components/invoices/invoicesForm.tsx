import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export interface InvoiceFormData {
  invoiceNumber: string;
  subtotal: number;
  vendorCommission: number;
  adminCommission: number;
  totalAmount: number;
  comment: string;
}

interface InvoiceFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: InvoiceFormData) => void;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ open, onClose, onSubmit }) => {
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [subtotal, setSubtotal] = useState('');
  const [vendorCommission, setVendorCommission] = useState('');
  const [adminCommission, setAdminCommission] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    const data: InvoiceFormData = {
      invoiceNumber,
      subtotal: parseFloat(subtotal),
      vendorCommission: parseFloat(vendorCommission),
      adminCommission: parseFloat(adminCommission),
      totalAmount: parseFloat(totalAmount),
      comment,
    };
    onSubmit(data);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label>Invoice Number</Label>
            <Input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Subtotal</Label>
              <Input type="number" value={subtotal} onChange={(e) => setSubtotal(e.target.value)} />
            </div>
            <div>
              <Label>Vendor Commission</Label>
              <Input type="number" value={vendorCommission} onChange={(e) => setVendorCommission(e.target.value)} />
            </div>
            <div>
              <Label>Admin Commission</Label>
              <Input type="number" value={adminCommission} onChange={(e) => setAdminCommission(e.target.value)} />
            </div>
            <div>
              <Label>Total Amount</Label>
              <Input type="number" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} />
            </div>
          </div>

          <div>
            <Label>Comment</Label>
            <Textarea value={comment} onChange={(e) => setComment(e.target.value)} />
          </div>
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceForm;
