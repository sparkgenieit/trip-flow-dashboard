
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, MapPin, Clock, AlertTriangle, Phone, MapIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Trip {
  id: string;
  start_time: string;
  end_time: string;
  start_location: string;
  end_location: string;
  actual_distance: number;
  status: string;
  breakdown_reported: boolean;
  breakdown_notes: string;
  bookings: {
    pickup_location: string;
    dropoff_location: string;
    profiles: {
      full_name: string;
    };
  };
  drivers: {
    profiles: {
      full_name: string;
    };
  };
  vehicles: {
    vehicle_number: string;
  };
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
      // Mock data to avoid Supabase errors
      const mockTrips = [
        {
          id: '1',
          start_time: '2024-06-19T08:30:00',
          end_time: '2024-06-19T10:45:00',
          start_location: 'Airport Terminal 1',
          end_location: 'Downtown Hotel',
          actual_distance: 25.5,
          status: 'completed',
          breakdown_reported: false,
          breakdown_notes: '',
          bookings: {
            pickup_location: 'Airport Terminal 1',
            dropoff_location: 'Downtown Hotel',
            profiles: {
              full_name: 'John Doe'
            }
          },
          drivers: {
            profiles: {
              full_name: 'Mike Wilson'
            }
          },
          vehicles: {
            vehicle_number: 'CAR-001'
          }
        },
        {
          id: '2',
          start_time: '2024-06-19T14:15:00',
          end_time: null,
          start_location: 'Business District',
          end_location: 'Tech Park',
          actual_distance: 0,
          status: 'started',
          breakdown_reported: false,
          breakdown_notes: '',
          bookings: {
            pickup_location: 'Business District',
            dropoff_location: 'Tech Park',
            profiles: {
              full_name: 'Sarah Johnson'
            }
          },
          drivers: {
            profiles: {
              full_name: 'David Lee'
            }
          },
          vehicles: {
            vehicle_number: 'CAR-002'
          }
        },
        {
          id: '3',
          start_time: '2024-06-19T16:00:00',
          end_time: null,
          start_location: 'Shopping Mall',
          end_location: 'Residential Area',
          actual_distance: 0,
          status: 'breakdown',
          breakdown_reported: true,
          breakdown_notes: 'Engine overheating issue reported by driver',
          bookings: {
            pickup_location: 'Shopping Mall',
            dropoff_location: 'Residential Area',
            profiles: {
              full_name: 'Alex Brown'
            }
          },
          drivers: {
            profiles: {
              full_name: 'Emily Davis'
            }
          },
          vehicles: {
            vehicle_number: 'CAR-003'
          }
        }
      ];
      setTrips(mockTrips);
      toast({
        title: "Info",
        description: "Using demo data (Supabase connection disabled)",
      });
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
