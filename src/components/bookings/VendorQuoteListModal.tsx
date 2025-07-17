import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { fetchQuotesForBooking, approveQuote } from '@/services/quotes';

interface Quote {
  id: number;
  amount: number;
  approved: boolean;
  vendor: {
    name: string;
    companyReg: string;
  };
}


interface Props {
  bookingId: number;
  open: boolean;
  onClose: () => void;
  onApproved: () => void;
}

const VendorQuoteListModal: React.FC<Props> = ({ bookingId, open, onClose, onApproved }) => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const { toast } = useToast();

  const loadQuotes = async () => {
    try {
      const data = await fetchQuotesForBooking(bookingId);
      setQuotes(data);
    } catch {
      toast({ title: 'Error loading quotes', variant: 'destructive' });
    }
  };

  const handleApprove = async (quoteId: number) => {
    try {
      await approveQuote(quoteId);
      toast({ title: 'Quote approved' });
      onApproved();
      onClose();
    } catch {
      toast({ title: 'Approval failed', variant: 'destructive' });
    }
  };

  useEffect(() => {
    if (open) loadQuotes();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Vendor Quotes</DialogTitle>
        </DialogHeader>
       <div className="space-y-2">
  {quotes.length === 0 ? (
    <p>No quotes submitted yet.</p>
  ) : (
    <>
      {(() => {
        const approvedQuote = quotes.find((q) => (q as any).approved); // <- adjust type if needed
        const visibleQuotes = approvedQuote ? [approvedQuote] : quotes;

        return visibleQuotes.map((q) => (
          <div
            key={q.id}
            className={`flex justify-between items-center border p-3 rounded gap-4 ${
              (q as any).approved ? 'bg-green-100 border-green-500' : ''
            }`}
          >
            {/* LEFT: Vendor Details */}
            <div className="flex flex-col">
              <div className="font-medium text-gray-900">{q.vendor.companyReg}</div>
              <div className="text-sm text-gray-500">By {q.vendor.name}</div>
            </div>

            {/* CENTER: Quote Amount */}
            <div className="text-lg font-semibold text-gray-800 whitespace-nowrap">
              ₹ {q.amount}
            </div>

            {/* RIGHT: Approve or Badge */}
            {(q as any).approved ? (
              <span className="text-green-700 font-medium text-sm px-3 py-1 rounded bg-green-200">
                ✔ Approved
              </span>
            ) : (
              <Button onClick={() => handleApprove(q.id)}>Approve</Button>
            )}
          </div>
        ));
      })()}
    </>
  )}
</div>

      </DialogContent>
    </Dialog>
  );
};

export default VendorQuoteListModal;
