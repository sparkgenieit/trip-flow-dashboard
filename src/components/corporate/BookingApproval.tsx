
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CheckSquare, x, edit } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Booking {
  id: string;
  employee: string;
  date: string;
  time: string;
  pickup: string;
  drop: string;
  purpose: string;
  vehicle: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Change Requested';
}

const mockBookings: Booking[] = [
  { id: '1', employee: 'John Smith', date: '2024-01-15', time: '09:00', pickup: 'Office', drop: 'Airport', purpose: 'Client Meeting', vehicle: 'Sedan', status: 'Pending' },
  { id: '2', employee: 'Sarah Johnson', date: '2024-01-16', time: '14:00', pickup: 'Hotel', drop: 'Conference Center', purpose: 'Conference', vehicle: 'SUV', status: 'Approved' },
  { id: '3', employee: 'Mike Chen', date: '2024-01-17', time: '10:30', pickup: 'Office', drop: 'Client Office', purpose: 'Sales Meeting', vehicle: 'EV', status: 'Pending' },
];

const BookingApproval = () => {
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [activeTab, setActiveTab] = useState<string>('All');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rejectComment, setRejectComment] = useState('');
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const { toast } = useToast();

  const tabs = ['All', 'Pending', 'Approved', 'Rejected', 'Change Requested'];

  const filteredBookings = activeTab === 'All' 
    ? bookings 
    : bookings.filter(booking => booking.status === activeTab);

  const handleApprove = (bookingId: string) => {
    setBookings(prev => prev.map(booking => 
      booking.id === bookingId ? { ...booking, status: 'Approved' as const } : booking
    ));
    toast({
      title: "Success",
      description: "Booking approved successfully",
    });
  };

  const handleReject = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setDialogOpen(true);
  };

  const confirmReject = () => {
    setBookings(prev => prev.map(booking => 
      booking.id === selectedBookingId ? { ...booking, status: 'Rejected' as const } : booking
    ));
    setDialogOpen(false);
    setRejectComment('');
    toast({
      title: "Success",
      description: "Booking rejected",
    });
  };

  const handleRequestChange = (bookingId: string) => {
    setBookings(prev => prev.map(booking => 
      booking.id === bookingId ? { ...booking, status: 'Change Requested' as const } : booking
    ));
    toast({
      title: "Success",
      description: "Change requested for booking",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-700';
      case 'Rejected':
        return 'bg-red-100 text-red-700';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'Change Requested':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Booking Approval</h1>
        <p className="text-gray-600">Review and manage booking requests</p>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'py-2 px-1 border-b-2 font-medium text-sm',
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-medium">{booking.employee}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{booking.date}</div>
                    <div className="text-gray-500">{booking.time}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>From: {booking.pickup}</div>
                    <div>To: {booking.drop}</div>
                  </div>
                </TableCell>
                <TableCell>{booking.purpose}</TableCell>
                <TableCell>{booking.vehicle}</TableCell>
                <TableCell>
                  <span className={cn(
                    "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                    getStatusColor(booking.status)
                  )}>
                    {booking.status}
                  </span>
                </TableCell>
                <TableCell>
                  {booking.status === 'Pending' && (
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleApprove(booking.id)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <CheckSquare className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleReject(booking.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <x className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRequestChange(booking.id)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <edit className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Reject Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Booking</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this booking request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="comment">Rejection Reason</Label>
              <Input
                id="comment"
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                placeholder="Enter reason for rejection..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmReject} variant="destructive">
              Reject Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingApproval;
