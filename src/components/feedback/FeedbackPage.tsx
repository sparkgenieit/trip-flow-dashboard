
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getFeedback } from '../../services/feedback'; // ✅ NEW


interface Feedback {
  id: number;
  tripId: number;
  riderId: number;
  driverId: number;
  driverRating: number;
  vehicleRating: number;
  serviceRating: number;
  comment: string;
  feedbackTime: string;

  rider: {
    name: string;
    email: string;
  };

  driver: {
    fullName: string;
  };

  trip: {
    booking: {
      pickupAddress: {
        address: string;
      };
      dropAddress: {
        address: string;
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
    const data = await getFeedback(); // ✅ fetch from real API
    setFeedback(data);
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
    const ratings = [feedback.driverRating, feedback.vehicleRating, feedback.serviceRating].filter(Boolean);
    return ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : 'N/A';
  };

  const filteredFeedback = feedback.filter(item =>
    item.rider?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
                    {item.rider?.name || 'Anonymous Customer'}
                  </CardTitle>
                  <CardDescription>
                    {new Date(item.feedbackTime).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Badge variant="outline">
                  Avg: {getAverageRating(item)}★
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
       {item.trip?.booking && (
  <div className="mb-4 p-3 bg-gray-50 rounded-md">
    <div className="text-sm">
      <span className="font-medium">Trip:</span>{" "}
      {item.trip.booking.pickupAddress?.address} → {item.trip.booking.dropAddress?.address}
    </div>
    {item.driver?.fullName && (
      <div className="text-sm">
        <span className="font-medium">Driver:</span> {item.driver.fullName}
      </div>
    )}
  </div>
)}


              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {item.driverRating && (
                  <div>
                    <span className="font-medium text-sm">Driver Rating:</span>
                    {renderStars(item.driverRating)}
                  </div>
                )}
                {item.vehicleRating && (
                  <div>
                    <span className="font-medium text-sm">Vehicle Rating:</span>
                    {renderStars(item.vehicleRating)}
                  </div>
                )}
                {item.serviceRating && (
                  <div>
                    <span className="font-medium text-sm">Service Rating:</span>
                    {renderStars(item.serviceRating)}
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
