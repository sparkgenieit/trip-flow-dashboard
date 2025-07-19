import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, MapPin, Clock, AlertTriangle, Phone, MapIcon } from 'lucide-react';
import { generateInvoice } from '@/services/invoice'; // ✅ Add this
import { useToast } from '@/hooks/use-toast';
import { getTrips } from '@/services/trip';
import FeedbackForm, { FeedbackFormData } from './FeedbackForm';


interface Trip {
  id: number;
  riderId:number;
  startTime: string;
  endTime?: string;
  distance?: number;
  status: string;
  breakdownReported: boolean;
  breakdownNotes?: string;
  booking?: {
    pickupAddress?: { address: string };
    dropAddress?: { address: string };
    user?: { name: string };
  };
  driver?: {
  id: number;
  fullName: string;
};
  vehicle?: { registrationNumber: string };
}

const TripsPage = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
const [feedbackTrip, setFeedbackTrip] = useState<Trip | null>(null);

const handleFeedbackSubmit = async (feedback: FeedbackFormData) => {
  console.log(feedbackTrip);
  if (!feedbackTrip) return;
  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify({
        tripId: feedbackTrip.id,
        driverId: feedbackTrip.driver?.id,
        riderId: feedbackTrip.riderId, // Replace with actual user ID if needed
        ...feedback,
      }),
    });

    if (!res.ok) throw new Error('Failed to submit feedback');

    toast({
      title: 'Feedback submitted',
      description: 'Thanks for your response!',
    });
  } catch (error) {
    console.error('Feedback error:', error);
    toast({
      title: 'Error',
      description: 'Could not submit feedback',
      variant: 'destructive',
    });
  } finally {
    setFeedbackTrip(null);
  }
};

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const data = await getTrips();
      setTrips(data);
    } catch (error) {
      console.error('Error fetching trips:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch trips',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'secondary';
      case 'started':
        return 'default';
      case 'completed':
        return 'outline';
      case 'cancelled':
      case 'breakdown':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const handleTripAssistance = (tripId: number) => {
    toast({
      title: 'Trip Assistance',
      description: 'Emergency assistance has been notified for this trip',
    });
  };

  const handleContactDriver = (tripId: number) => {
    toast({
      title: 'Contacting Driver',
      description: 'Connecting you with the driver...',
    });
  };

  const handleGenerateInvoiceForTrip = async (tripId?: number) => {
  try {
    const enteredTripId = tripId ?? Number(prompt('Enter Trip ID to generate invoice for:'));
    if (!enteredTripId) return;

    const invoice = await generateInvoice(enteredTripId);
    toast({
      title: 'Success',
      description: `Invoice ${invoice.invoiceNumber} generated.`,
    });

    // Optional: refetch trips to reflect updated invoice data
    fetchTrips();
  } catch (error) {
    console.error('Error generating invoice:', error);
    toast({
      title: 'Error',
      description: 'Failed to generate invoice',
      variant: 'destructive',
    });
  }
};



  const filteredTrips = trips.filter((trip) =>
    trip.booking?.pickupAddress?.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.booking?.dropAddress?.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.booking?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading trips...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Trips</h2>
          <p className="text-muted-foreground">Monitor ongoing and completed trips with assistance</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search trips..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      <div className="grid gap-4">
        {filteredTrips.map((trip) => (
          <Card key={trip.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {trip.booking?.user?.name || 'Unknown Customer'}
                </CardTitle>
                <div className="flex space-x-2">
                  <Badge variant={getStatusColor(trip.status)}>{trip.status}</Badge>
                  {trip.breakdownReported && (
                    <Badge variant="destructive" className="flex items-center space-x-1">
                      <AlertTriangle className="h-3 w-3" />
                      <span>Breakdown</span>
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-green-500" />
                  <div>
                    <span className="font-medium">Start:</span>
                    <p className="truncate">{trip.booking?.pickupAddress?.address || 'Unknown'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-red-500" />
                  <div>
                    <span className="font-medium">End:</span>
                    <p className="truncate">{trip.booking?.dropAddress?.address || 'Unknown'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <div>
                    <span className="font-medium">Started:</span>
                    <p>{trip.startTime ? new Date(trip.startTime).toLocaleString() : 'Not started'}</p>
                  </div>
                </div>
                <div>
                  <span className="font-medium">Distance:</span>
                  <p>{trip.distance ? `${trip.distance} km` : 'In progress'}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {trip.driver && (
                  <div>
                    <span className="font-medium">Driver:</span>
                    <p>{trip.driver.fullName}</p>
                  </div>
                )}
                {trip.vehicle && (
                  <div>
                    <span className="font-medium">Vehicle:</span>
                    <p>{trip.vehicle.registrationNumber}</p>
                  </div>
                )}
              </div>

              {trip.breakdownReported && trip.breakdownNotes && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-center space-x-2 text-red-700">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">Breakdown Report:</span>
                  </div>
                  <p className="text-red-600 text-sm mt-1">{trip.breakdownNotes}</p>
                </div>
              )}

              <div className="mt-4 flex space-x-2">
                <Button size="sm" variant="outline">
                  <MapIcon className="mr-1 h-3 w-3" />
                  Track Trip
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleContactDriver(trip.id)}>
                  <Phone className="mr-1 h-3 w-3" />
                  Contact Driver
                </Button>
                <Button
                  size="sm"
                  variant={trip.breakdownReported ? 'destructive' : 'outline'}
                  onClick={() => handleTripAssistance(trip.id)}
                >
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  Trip Assistance
                </Button>
                <Button size="sm" variant="outline">
                  View Details
                </Button>
                <Button
                 size="sm"
                  variant="outline"
                  onClick={() => setFeedbackTrip(trip)}
                >
                   Feedback
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleGenerateInvoiceForTrip(trip.id)}
                  >
                    Generate Invoice
                  </Button>

              </div>
            </CardContent>
          </Card>
        ))}
      </div>
     {feedbackTrip && (
        <FeedbackForm
          open={!!feedbackTrip}
          onClose={() => setFeedbackTrip(null)}
          onSubmit={handleFeedbackSubmit}
          tripInfo={{
            from: feedbackTrip.booking?.pickupAddress?.address || 'Unknown',
            to: feedbackTrip.booking?.dropAddress?.address || 'Unknown',
            driverName: feedbackTrip.driver?.fullName || 'Unknown',
          }}
        />
      )}
    </div> // ✅ Final closing div of return
  );
};

export default TripsPage;
