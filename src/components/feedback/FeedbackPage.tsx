
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Feedback {
  id: string;
  driver_rating: number;
  vehicle_rating: number;
  service_rating: number;
  comment: string;
  feedback_time: string;
  profiles: {
    full_name: string;
  };
  trips: {
    bookings: {
      pickup_location: string;
      dropoff_location: string;
    };
    drivers: {
      profiles: {
        full_name: string;
      };
    };
  };
}

const FeedbackPage = () => {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      // Mock data to avoid Supabase errors
      const mockFeedback = [
        {
          id: '1',
          driver_rating: 5,
          vehicle_rating: 4,
          service_rating: 5,
          comment: 'Excellent service! Driver was very professional and the vehicle was clean.',
          feedback_time: '2024-01-15T10:30:00Z',
          profiles: {
            full_name: 'Alice Johnson'
          },
          trips: {
            bookings: {
              pickup_location: 'Airport Terminal 1',
              dropoff_location: 'Downtown Hotel'
            },
            drivers: {
              profiles: {
                full_name: 'John Smith'
              }
            }
          }
        },
        {
          id: '2',
          driver_rating: 4,
          vehicle_rating: 3,
          service_rating: 4,
          comment: 'Good trip overall, vehicle could have been cleaner.',
          feedback_time: '2024-01-14T14:15:00Z',
          profiles: {
            full_name: 'Bob Wilson'
          },
          trips: {
            bookings: {
              pickup_location: 'City Mall',
              dropoff_location: 'Residential Area'
            },
            drivers: {
              profiles: {
                full_name: 'Sarah Johnson'
              }
            }
          }
        },
        {
          id: '3',
          driver_rating: 5,
          vehicle_rating: 5,
          service_rating: 5,
          comment: 'Perfect ride! Highly recommend this service.',
          feedback_time: '2024-01-13T09:45:00Z',
          profiles: {
            full_name: 'Carol Davis'
          },
          trips: {
            bookings: {
              pickup_location: 'Business District',
              dropoff_location: 'Conference Center'
            },
            drivers: {
              profiles: {
                full_name: 'Mike Rodriguez'
              }
            }
          }
        }
      ];
      setFeedback(mockFeedback);
      toast({
        title: "Info",
        description: "Using demo data (Supabase connection disabled)",
      });
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast({
        title: "Error",
        description: "Failed to fetch feedback",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-muted-foreground ml-1">({rating}/5)</span>
      </div>
    );
  };

  const getAverageRating = (feedback: Feedback) => {
    const ratings = [feedback.driver_rating, feedback.vehicle_rating, feedback.service_rating].filter(Boolean);
    return ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : 'N/A';
  };

  const filteredFeedback = feedback.filter(item =>
    item.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.comment?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading feedback...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Feedback</h2>
          <p className="text-muted-foreground">Customer reviews and ratings</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search feedback..."
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
        {filteredFeedback.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {item.profiles?.full_name || 'Anonymous Customer'}
                  </CardTitle>
                  <CardDescription>
                    {new Date(item.feedback_time).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Badge variant="outline">
                  Avg: {getAverageRating(item)}★
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {item.trips?.bookings && (
                <div className="mb-4 p-3 bg-gray-50 rounded-md">
                  <div className="text-sm">
                    <span className="font-medium">Trip:</span> {item.trips.bookings.pickup_location} → {item.trips.bookings.dropoff_location}
                  </div>
                  {item.trips.drivers?.profiles && (
                    <div className="text-sm">
                      <span className="font-medium">Driver:</span> {item.trips.drivers.profiles.full_name}
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {item.driver_rating && (
                  <div>
                    <span className="font-medium text-sm">Driver Rating:</span>
                    {renderStars(item.driver_rating)}
                  </div>
                )}
                {item.vehicle_rating && (
                  <div>
                    <span className="font-medium text-sm">Vehicle Rating:</span>
                    {renderStars(item.vehicle_rating)}
                  </div>
                )}
                {item.service_rating && (
                  <div>
                    <span className="font-medium text-sm">Service Rating:</span>
                    {renderStars(item.service_rating)}
                  </div>
                )}
              </div>

              {item.comment && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <span className="font-medium text-sm text-blue-800">Comment:</span>
                  <p className="text-blue-700 mt-1">{item.comment}</p>
                </div>
              )}

              <div className="mt-4 flex space-x-2">
                <Button size="sm" variant="outline">
                  Respond
                </Button>
                <Button size="sm" variant="outline">
                  Flag
                </Button>
                <Button size="sm" variant="outline">
                  View Trip
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FeedbackPage;
