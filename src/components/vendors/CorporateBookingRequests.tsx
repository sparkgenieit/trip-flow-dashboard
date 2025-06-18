
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Users, Calendar, Car, CheckCircle, XCircle, Clock } from 'lucide-react';

interface CorporateRequest {
  id: string;
  company_name: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  pickup_location: string;
  dropoff_location: string;
  start_date: string;
  end_date: string;
  booking_type: string;
  number_of_vehicles: number;
  vehicle_type: string;
  estimated_passengers: number;
  budget_range: string;
  status: string;
  special_requirements: string;
  notes: string;
  created_at: string;
}

const CorporateBookingRequests = () => {
  const [requests, setRequests] = useState<CorporateRequest[]>([
    {
      id: '1',
      company_name: 'Tech Corp India',
      contact_person: 'Raj Sharma',
      contact_email: 'raj@techcorp.com',
      contact_phone: '+91-9876543210',
      pickup_location: 'Tech Park, Bangalore',
      dropoff_location: 'Airport',
      start_date: '2024-06-25',
      end_date: '2024-07-25',
      booking_type: 'monthly',
      number_of_vehicles: 5,
      vehicle_type: 'sedan',
      estimated_passengers: 20,
      budget_range: '100k_250k',
      status: 'pending',
      special_requirements: 'English speaking drivers, AC vehicles',
      notes: 'Daily office commute for employees',
      created_at: '2024-06-18'
    },
    {
      id: '2',
      company_name: 'Global Solutions',
      contact_person: 'Priya Patel',
      contact_email: 'priya@globalsol.com',
      contact_phone: '+91-8765432109',
      pickup_location: 'Business District',
      dropoff_location: 'Various locations',
      start_date: '2024-06-22',
      end_date: '2024-06-24',
      booking_type: 'weekend',
      number_of_vehicles: 3,
      vehicle_type: 'suv',
      estimated_passengers: 15,
      budget_range: '50k_100k',
      status: 'under_review',
      special_requirements: 'Premium vehicles for client meetings',
      notes: 'Weekend client events and meetings',
      created_at: '2024-06-17'
    }
  ]);

  const [selectedRequest, setSelectedRequest] = useState<CorporateRequest | null>(null);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [assignmentData, setAssignmentData] = useState({
    vehicles: '',
    drivers: '',
    total_cost: '',
    vendor_notes: ''
  });
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'under_review': return 'default';
      case 'approved': return 'outline';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const handleApprove = (request: CorporateRequest) => {
    setSelectedRequest(request);
    setShowAssignDialog(true);
  };

  const handleReject = (requestId: string) => {
    setRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: 'rejected' } : req
    ));
    toast({
      title: "Request Rejected",
      description: "Corporate booking request has been rejected",
      variant: "destructive",
    });
  };

  const handleAssignVehicles = () => {
    if (!selectedRequest) return;

    setRequests(prev => prev.map(req => 
      req.id === selectedRequest.id ? { ...req, status: 'approved' } : req
    ));

    toast({
      title: "Vehicles Assigned",
      description: "Corporate booking has been approved and vehicles assigned",
    });

    setShowAssignDialog(false);
    setSelectedRequest(null);
    setAssignmentData({
      vehicles: '',
      drivers: '',
      total_cost: '',
      vendor_notes: ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Corporate Booking Requests</h3>
          <p className="text-muted-foreground">Review and manage corporate booking requests</p>
        </div>
      </div>

      <div className="grid gap-4">
        {requests.map((request) => (
          <Card key={request.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>{request.company_name}</span>
                  </CardTitle>
                  <CardDescription>{request.contact_person} • {request.contact_email}</CardDescription>
                </div>
                <Badge variant={getStatusColor(request.status)}>
                  {request.status.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <div>
                    <span className="font-medium">Duration:</span>
                    <p>{request.start_date} to {request.end_date}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Car className="h-4 w-4 text-green-500" />
                  <div>
                    <span className="font-medium">Vehicles:</span>
                    <p>{request.number_of_vehicles} {request.vehicle_type}s</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-purple-500" />
                  <div>
                    <span className="font-medium">Passengers:</span>
                    <p>{request.estimated_passengers} total</p>
                  </div>
                </div>
                <div>
                  <span className="font-medium">Type:</span>
                  <p className="capitalize">{request.booking_type}</p>
                </div>
              </div>

              <div className="text-sm space-y-2">
                <div>
                  <span className="font-medium">Route:</span>
                  <p>{request.pickup_location} → {request.dropoff_location || 'Various'}</p>
                </div>
                {request.special_requirements && (
                  <div>
                    <span className="font-medium">Special Requirements:</span>
                    <p>{request.special_requirements}</p>
                  </div>
                )}
                {request.notes && (
                  <div>
                    <span className="font-medium">Notes:</span>
                    <p>{request.notes}</p>
                  </div>
                )}
              </div>

              <div className="mt-4 flex space-x-2">
                {request.status === 'pending' && (
                  <>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleApprove(request)}
                    >
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Review & Approve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleReject(request.id)}
                    >
                      <XCircle className="mr-1 h-3 w-3" />
                      Reject
                    </Button>
                  </>
                )}
                <Button size="sm" variant="outline">
                  Contact Client
                </Button>
                <Button size="sm" variant="outline">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showAssignDialog && selectedRequest && (
        <Dialog open={true} onOpenChange={() => setShowAssignDialog(false)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Assign Vehicles & Drivers</DialogTitle>
              <DialogDescription>
                Approve and assign resources for {selectedRequest.company_name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vehicles">Assign Vehicles</Label>
                <Select value={assignmentData.vehicles} onValueChange={(value) => setAssignmentData({ ...assignmentData, vehicles: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CAR-001,CAR-002,CAR-003">CAR-001, CAR-002, CAR-003</SelectItem>
                    <SelectItem value="CAR-004,CAR-005">CAR-004, CAR-005</SelectItem>
                    <SelectItem value="SUV-001,SUV-002">SUV-001, SUV-002</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="drivers">Assign Drivers</Label>
                <Select value={assignmentData.drivers} onValueChange={(value) => setAssignmentData({ ...assignmentData, drivers: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select drivers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="driver1,driver2,driver3">John Doe, Jane Smith, Mike Wilson</SelectItem>
                    <SelectItem value="driver4,driver5">David Lee, Sarah Johnson</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="total_cost">Total Cost Quote</Label>
                <Input
                  id="total_cost"
                  type="number"
                  placeholder="Enter total cost"
                  value={assignmentData.total_cost}
                  onChange={(e) => setAssignmentData({ ...assignmentData, total_cost: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vendor_notes">Vendor Notes</Label>
                <Textarea
                  id="vendor_notes"
                  placeholder="Any special instructions or notes"
                  value={assignmentData.vendor_notes}
                  onChange={(e) => setAssignmentData({ ...assignmentData, vendor_notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAssignDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAssignVehicles}>
                Approve & Assign
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CorporateBookingRequests;
