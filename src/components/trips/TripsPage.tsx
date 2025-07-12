
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, MapPin, Clock, AlertTriangle, Phone, MapIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getTrips } from '@/services/trip';

interface Trip {
  id: number;
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
  driver?: { fullName: string };
  vehicle?: { registrationNumber: string };
}

const TripsPage = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

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
        title: "Error",
        description: "Failed to fetch trips",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'secondary';
      case 'started': return 'default';
      case 'completed': return 'outline';
      case 'cancelled': return 'destructive';
      case 'breakdown': return 'destructive';
      default: return 'secondary';
    }
  };

  const handleTripAssistance = (tripId: string) => {
    toast({
      title: "Trip Assistance",
      description: "Emergency assistance has been notified for this trip",
    });
  };

  const handleContactDriver = (tripId: string) => {
    toast({
      title: "Contacting Driver",
      description: "Connecting you with the driver...",
    });
  };

  const filteredTrips = trips.filter(trip =>
    trip.start_location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.end_location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.bookings?.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
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
                  {trip.bookings?.profiles?.full_name || 'Unknown Customer'}
                </CardTitle>
                <div className="flex space-x-2">
                  <Badge variant={getStatusColor(trip.status)}>
                    {trip.status}
                  </Badge>
                  {trip.breakdown_reported && (
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
                    <p className="truncate">{trip.start_location || trip.bookings?.pickup_location}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-red-500" />
                  <div>
                    <span className="font-medium">End:</span>
                    <p className="truncate">{trip.end_location || trip.bookings?.dropoff_location}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <div>
                    <span className="font-medium">Started:</span>
                    <p>{trip.start_time ? new Date(trip.start_time).toLocaleString() : 'Not started'}</p>
                  </div>
                </div>
                <div>
                  <span className="font-medium">Distance:</span>
                  <p>{trip.actual_distance ? `${trip.actual_distance} km` : 'In progress'}</p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {trip.drivers && (
                  <div>
                    <span className="font-medium">Driver:</span>
                    <p>{trip.drivers.profiles?.full_name}</p>
                  </div>
                )}
                {trip.vehicles && (
                  <div>
                    <span className="font-medium">Vehicle:</span>
                    <p>{trip.vehicles.vehicle_number}</p>
                  </div>
                )}
              </div>

              {trip.breakdown_reported && trip.breakdown_notes && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-center space-x-2 text-red-700">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">Breakdown Report:</span>
                  </div>
                  <p className="text-red-600 text-sm mt-1">{trip.breakdown_notes}</p>
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
                  variant={trip.breakdown_reported ? "destructive" : "outline"}
                  onClick={() => handleTripAssistance(trip.id)}
                >
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  Trip Assistance
                </Button>
                <Button size="sm" variant="outline">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TripsPage;
