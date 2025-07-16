import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL + '/feedback';


// ✅ Feedback interface (optional here if already in types/feedback.ts)
export interface Feedback {
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
      pickupAddress: { address: string };
      dropAddress: { address: string };
    };
  };
}

// ✅ Fetch all feedback
export const getFeedback = async (): Promise<Feedback[]> => {
  const token = localStorage.getItem('authToken');
  const res = await axios.get(API_BASE, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  });
  return res.data;
};

