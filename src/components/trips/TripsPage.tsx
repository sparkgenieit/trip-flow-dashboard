import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Filter,
  MapPin,
  Clock,
  AlertTriangle,
  Phone,
  MapIcon,
} from 'lucide-react';
import { generateInvoice } from '@/services/invoice';
import { useToast } from '@/hooks/use-toast';
import { getTrips } from '@/services/trip';
import FeedbackForm, { FeedbackFormData } from './FeedbackForm';
import TripAssistanceForm, { TripAssistanceFormData } from './TripAssistanceForm';
import { useNavigate } from 'react-router-dom';
import ReactModal from 'react-modal';
import GoogleMapReact from 'google-map-react';

interface Trip {
  id: number;
  riderId: number;
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
  driver?: { id: number; fullName: string };
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

const Marker = ({ lat, lng }: { lat: number; lng: number }) => (
  <div className="text-red-600 text-xl">📍</div>
);

const TrackTripModal = ({
  isOpen,
  onClose,
  tripId,
}: {
  isOpen: boolean;
  onClose: () => void;
  tripId: number;
}) => {
  const [lat, setLat] = useState<number>(12.9352);
  const [lng, setLng] = useState<number>(77.6946);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOpen) {
      interval = setInterval(() => {
        setLat((prev) => prev + (Math.random() - 0.5) * 0.001);
        setLng((prev) => prev + (Math.random() - 0.5) * 0.001);
      }, 30000);
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
          bootstrapURLKeys={{
            key: 'AIzaSyCx7ABaUaR43JU2bhbyDvAEfLk9t0vvLQI',
          }}
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

const TripsPage = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [feedbackTrip, setFeedbackTrip] = useState<Trip | null>(null);
  const [tripForAssistance, setTripForAssistance] = useState<Trip | null>(null);
  const [trackTripId, setTrackTripId] = useState<number | null>(null);
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserRole(payload?.role || null);
    }
  }, []);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const data = await getTrips();
      setTrips(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch trips',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContactDriver = (tripId: number) => {
    toast({
      title: 'Contacting Driver',
      description: 'Connecting you with the driver...',
    });
  };

  const handleGenerateInvoiceForTrip = async (tripId: number) => {
    try {
      await generateInvoice(tripId);
      toast({
        title: 'Invoice Generated',
        description: 'Invoice has been created successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate invoice',
        variant: 'destructive',
      });
    }
  };

  const handleFeedbackSubmit = async (data: FeedbackFormData) => {
    toast({
      title: 'Feedback Submitted',
      description: 'Thanks for your feedback!',
    });
    setFeedbackTrip(null);
  };

  const statusVariant = (status: string) => {
    switch (status) {
      case 'ONGOING':
        return 'warning';
      case 'COMPLETED':
        return 'success';
      case 'PENDING':
      default:
        return 'secondary';
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Trips</h1>
      <div className="grid grid-cols-1 gap-4">
        {trips.map((trip) => (
          <Card key={trip.id}>
            <CardHeader>
              <CardTitle>Trip #{trip.id}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <p><strong>Pickup:</strong> {trip.booking?.pickupAddress?.address || 'Unknown'}</p>
                  <p><strong>Drop:</strong> {trip.booking?.dropAddress?.address || 'Unknown'}</p>
                  <p><strong>Driver:</strong> {trip.driver?.fullName || 'Unassigned'}</p>
                  <p><strong>Status:</strong> </p>
                  <p><strong>Vehicle:</strong> {trip.vehicle?.registrationNumber || 'N/A'}</p>
                </div>
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

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setTrackTripId(trip.id);
                    setTrackModalOpen(true);
                  }}
                >
                  <MapIcon className="mr-1 h-3 w-3" />
                  Track Trip
                </Button>

                <Button size="sm" variant="outline" onClick={() => handleContactDriver(trip.id)}>
                  <Phone className="mr-1 h-3 w-3" />
                  Contact Driver
                </Button>

                {userRole === 'DRIVER' ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setTripForAssistance(trip)}
                  >
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    Trip Assistance
                  </Button>
                ) : userRole === 'VENDOR' && trip.assistances?.length > 0 ? (
                  <Button
                    size="sm"
                    variant={trip.assistances[0].messageStatus === 'UNREAD' ? 'destructive' : 'outline'}
                    onClick={() => navigate(`/trip-assistance?tripId=${trip.id}`)}
                  >
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    Trip Assistance
                  </Button>
                ) : null}

                <Button size="sm" variant="outline">
                  View Details
                </Button>

                <Button size="sm" variant="outline" onClick={() => setFeedbackTrip(trip)}>
                  Feedback
                </Button>

                <Button size="sm" variant="outline" onClick={() => handleGenerateInvoiceForTrip(trip.id)}>
                  Generate Invoice
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {trackTripId !== null && (
        <TrackTripModal
          isOpen={trackModalOpen}
          onClose={() => setTrackModalOpen(false)}
          tripId={trackTripId}
        />
      )}

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

              navigate(`/trip-assistance?tripId=${tripForAssistance.id}`);
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
