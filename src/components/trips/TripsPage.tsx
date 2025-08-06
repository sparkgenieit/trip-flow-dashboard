
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, MapPin, Clock, AlertTriangle, Phone, MapIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getTrips } from '@/services/trip';
import TripAssistanceForm, { TripAssistanceFormData } from './TripAssistanceForm';
import ReactModal from 'react-modal';
import GoogleMapReact from 'google-map-react';
import { useNavigate } from 'react-router-dom';
import { generateInvoice } from '@/services/invoice';
import FeedbackForm, { FeedbackFormData } from './FeedbackForm';
import { createFeedback } from '@/services/feedback';


interface Trip {
  id: number;
  startTime: string;
  endTime?: string;
  distance?: number;
  actual_distance?: number;         // ✅ Add this
  start_location?: string;          // ✅ Add this
  end_location?: string;            // ✅ Add this
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
  profiles?: { full_name: string };
};
  vehicle?: { registrationNumber: string };
  assistances?: {
      id: number;
      subject: string;
      description: string;
      location: string;
      createdAt: string;
      reply: string | null;
      messageStatus: 'READ' | 'UNREAD';
  }[];
}

const TripsPage = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [trackTripId, setTrackTripId] = useState<number | null>(null);
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [tripForAssistance, setTripForAssistance] = useState<Trip | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [tripInfo, setTripInfo] = useState({
  from: 'Unknown',
  to: 'Unknown',
  driverName: 'N/A',
});
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();


  useEffect(() => {
    fetchTrips();
  }, []);

  useEffect(() => {
  const token = localStorage.getItem('authToken');
  if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    setUserRole(payload?.role || null);
  }
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

  const Marker = ({ lat, lng }: { lat: number; lng: number }) => (
  <div className="text-red-600 text-xl">📍</div>
);

interface TrackTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: number;
}

const TrackTripModal: React.FC<TrackTripModalProps> = ({ isOpen, onClose, tripId }) => {
  const [lat, setLat] = useState<number>(12.9352); // Marathahalli lat
  const [lng, setLng] = useState<number>(77.6946); // Marathahalli lng

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOpen) {
      interval = setInterval(() => {
        setLat((prev) => prev + (Math.random() - 0.5) * 0.001);
        setLng((prev) => prev + (Math.random() - 0.5) * 0.001);
      }, 30000); // every 30 seconds
    }
    return () => clearInterval(interval);
  }, [isOpen]);

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Track Trip"
      className="bg-white p-4 rounded shadow-lg max-w-2xl mx-auto my-12"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
    >
      <h2 className="text-xl font-bold mb-4">Tracking Trip #{tripId}</h2>
      <div style={{ height: '400px', width: '100%' }}>
        <GoogleMapReact
          bootstrapURLKeys={{ key: 'AIzaSyCx7ABaUaR43JU2bhbyDvAEfLk9t0vvLQI' }}
          center={{ lat, lng }}
          defaultZoom={15}
        >
          <Marker lat={lat} lng={lng} />
        </GoogleMapReact>
      </div>
      <div className="flex justify-end mt-4">
        <Button onClick={onClose}>Close</Button>
      </div>
    </ReactModal>
  );
};

const handleTrackTrip = (tripId: number) => {
  setTrackTripId(tripId);
  setTrackModalOpen(true);
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

const handleTripAssistance = (trip: Trip) => {
  if (userRole === 'DRIVER') {
    setTripForAssistance(trip);
  } else if (userRole === 'VENDOR') {
    window.open(`/dashboard/trip-assistance?tripId=${trip.id}`, '_blank');
  } else {
    toast({
      title: 'Access Denied',
      description: 'Only drivers or vendors can access trip assistance.',
      variant: 'destructive',
    });
  }
};

const handleGenerateInvoice = async (tripId: number) => {
  try {
    const response = await generateInvoice(tripId); // calls POST /invoices/generate/:tripId
    toast({
      title: 'Invoice generated',
      description: `Invoice ${response.invoiceNumber} created successfully`,
    });
    navigate('/dashboard/invoices'); // or trigger state update
  } catch (error) {
    console.error('Error generating invoice:', error);
    toast({
      title: 'Error',
      description: 'Failed to generate invoice',
      variant: 'destructive',
    });
  }
};

const handleFeedback = (trip: any) => {
  setSelectedTrip(trip);
  setTripInfo({
    from: trip.booking?.pickupAddress?.address || 'Unknown',
    to: trip.booking?.dropAddress?.address || 'Unknown',
    driverName: trip.driver?.fullName || 'N/A',
  });
  setFeedbackOpen(true);
};


const submitFeedback = async (data: FeedbackFormData) => {
  try {
    await createFeedback({
      tripId: selectedTrip.id,
      riderId: selectedTrip.rider?.id,
      driverId: selectedTrip.driver?.id,
      ...data,
    });
    toast({ title: 'Feedback submitted successfully' });
    setFeedbackOpen(false);
  } catch (err) {
    toast({ title: 'Failed to submit feedback', variant: 'destructive' });
  }
};


  const handleContactDriver = (tripId: number) => {
    toast({
      title: "Contacting Driver",
      description: "Connecting you with the driver...",
    });
  };

  const filteredTrips = trips.filter(trip =>
    trip.start_location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.end_location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
                  <Badge variant={getStatusColor(trip.status)}>
                    {trip.status}
                  </Badge>
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
                    <p className="truncate">{trip.start_location || trip.booking?.pickupAddress?.address || 'Unknown Pickup'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-red-500" />
                  <div>
                    <span className="font-medium">End:</span>
                    <p className="truncate">{trip.start_location || trip.booking?.dropAddress?.address || 'Unknown drop'}</p>
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
                  <p>{trip.actual_distance ? `${trip.actual_distance} km` : 'In progress'}</p>
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

              {trip.assistances && trip.assistances.length > 0 && (
  <div className="bg-red-50 border border-red-300 rounded p-3 my-4">
    <p className="font-semibold text-red-600">🆘 Assistance Requested</p>
    <p><strong>Subject:</strong> {trip.assistances[0].subject}</p>
    <p><strong>Description:</strong> {trip.assistances[0].description}</p>
    <p><strong>Location:</strong> {trip.assistances[0].location}</p>
    <p><strong>Status:</strong> {trip.assistances[0].messageStatus}</p>
    {trip.assistances[0].reply && (
      <div className="mt-2 bg-green-50 border border-green-300 p-2 rounded">
        <p className="text-green-700"><strong>Vendor Reply:</strong> {trip.assistances[0].reply}</p>
      </div>
    )}
  </div>
)}

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(`/trips/track?tripId=${trip.id}`, '_blank')}
                >
                  <MapIcon className="mr-1 h-3 w-3" />
                  Track Trip
                </Button>


                <Button size="sm" variant="outline" onClick={() => handleContactDriver(trip.id)}>
                  <Phone className="mr-1 h-3 w-3" />
                  Contact Driver
                </Button>
                {userRole === 'DRIVER' || (userRole === 'VENDOR' && trip.assistances?.length > 0) ? (
                <Button
                  size="sm"
                  variant={trip.assistances?.[0]?.messageStatus === 'UNREAD' ? 'destructive' : 'outline'}
                  onClick={() => handleTripAssistance(trip)}
                >
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  Trip Assistance
                </Button>
              ) : null}
                <Button size="sm" variant="outline" onClick={() => handleGenerateInvoice(trip.id)}>
                  Generate Invoice
                </Button>
                <Button size="sm" variant="outline">
                  View Details
                </Button>

                {(userRole === 'DRIVER' || userRole === 'RIDER') && trip.status === 'completed' && (
                  <Button size="sm" variant="outline" onClick={() => handleFeedback(trip)}>
                    Feedback
                  </Button>
                )}

            </CardContent>
          </Card>
        ))}
      </div>

                {selectedTrip && (
  <FeedbackForm
    open={feedbackOpen}
    onClose={() => setFeedbackOpen(false)}
    onSubmit={submitFeedback}
    tripInfo={{
      from: selectedTrip.start_location || 'Unknown',
      to: selectedTrip.end_location || 'Unknown',
      driverName: selectedTrip.driver?.user?.name || 'N/A',
    }}
  />
)}

                {/* ✅ Feedback modal here */}
                <FeedbackForm
                  open={feedbackOpen}
                  onClose={() => setFeedbackOpen(false)}
                  onSubmit={submitFeedback}
                  tripInfo={tripInfo}
                />

                {trackTripId !== null && (
                <TrackTripModal
                  isOpen={trackModalOpen}
                  onClose={() => setTrackModalOpen(false)}
                  tripId={trackTripId}
                />
              )}
              {tripForAssistance && userRole === 'DRIVER' && (
                <TripAssistanceForm
                  open={!!tripForAssistance}
                  onClose={() => setTripForAssistance(null)}
                  onSubmit={async (data: TripAssistanceFormData) => {
                    try {
                      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/trips/assistance`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                        },
                        body: JSON.stringify({
                          tripId: tripForAssistance.id,
                          location: data.location,
                          subject: data.subject,
                          description: data.description,
                          driverId: tripForAssistance.driver?.id,
                        }),
                      });

                      if (!res.ok) throw new Error('Failed to submit assistance');

                      toast({
                        title: 'Trip Assistance Sent',
                        description: 'Help is on the way!',
                      });

                      navigate(`/dashboard/trip-assistance?tripId=${tripForAssistance.id}`);
                    } catch (error) {
                      console.error(error);
                      toast({
                        title: 'Error',
                        description: 'Could not submit trip assistance',
                        variant: 'destructive',
                      });
                    } finally {
                      setTripForAssistance(null);
                    }
                  }}
                />
              )}
            </div>
         );
        };

export default TripsPage;