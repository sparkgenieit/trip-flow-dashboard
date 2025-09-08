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
  isAdmin: boolean;
}

const VendorQuoteListModal: React.FC<Props> = ({ bookingId, open, onClose, onApproved, isAdmin }) => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const hasApproved = quotes.some(q => q.approved);   
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
  // block further approvals if one is already approved
  if (quotes.some(q => q.approved)) {
    toast({
      title: 'A quote is already approved',
      description: 'Only one quote can be approved per booking.',
    });
    return;
  }

  try {
    await approveQuote(quoteId);
    toast({ title: 'Quote approved' });

    // reflect in local UI immediately
    setQuotes(prev =>
      prev.map(q => (q.id === quoteId ? { ...q, approved: true } : q))
    );

    onApproved();
    onClose(); // remove this line if you prefer to keep the dialog open
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
              {quotes.map((q) => (
                <div
                  key={q.id}
                  className={`flex justify-between items-center border p-3 rounded gap-4 ${
                    q.approved ? 'bg-green-100 border-green-500' : ''
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

                  {/* RIGHT: Approve button or Approved badge */}
                  {q.approved ? (
                    <span className="text-green-700 font-medium text-sm px-3 py-1 rounded bg-green-200">
                      ✔ Approved
                    </span>
                  ) : (
                    isAdmin && (
                      <Button
                        onClick={() => handleApprove(q.id)}
                        disabled={hasApproved}                // ⟵ disable if any is approved
                        className={hasApproved ? 'opacity-50 cursor-not-allowed' : ''}
                      >
                        Approve
                      </Button>
                    )
                  )}
                </div>
              ))}
            </>
          )}
        </div>


      </DialogContent>
    </Dialog>
  );
};

export default VendorQuoteListModal;
