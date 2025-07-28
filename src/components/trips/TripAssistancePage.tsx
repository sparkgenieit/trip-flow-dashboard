import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { jwtDecode } from 'jwt-decode';


interface Assistance {
  id: number;
  subject: string;
  description: string;
  location: string;
  createdAt: string;
  reply: string | null;
  messageStatus: 'READ' | 'UNREAD';
}

interface JwtPayload {
  id: number;
  role: 'DRIVER' | 'VENDOR' | 'ADMIN';
  email: string;
}

const TripAssistancePage: React.FC = () => {
  const [assistance, setAssistance] = useState<Assistance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<'DRIVER' | 'VENDOR' | 'ADMIN' | null>(null); // ✅ New line

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tripId = queryParams.get('tripId');

  const fetchAssistance = async () => {
    const token = localStorage.getItem('authToken');
    if (!tripId || !token) {
      setError('Invalid trip ID or not authenticated');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/trips/${tripId}/assistance`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (Array.isArray(data) && data.length > 0) {
        setAssistance(data[0]);
        setReplyText(data[0]?.reply || '');
      } else {
        setAssistance(null);
      }
    } catch {
      setError('Unable to load assistance data');
    } finally {
      setLoading(false);
    }
  };
useEffect(() => {
  fetchAssistance();

  const token = localStorage.getItem('authToken');
  if (token) {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      setUserRole(decoded.role);
    } catch (err) {
      console.error('Failed to decode token:', err);
    }
  }
}, [tripId]);

  const handleReplySubmit = async () => {
    if (!tripId || !replyText.trim() || !assistance) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/trips/${tripId}/assistance/reply`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          reply: replyText,
        }),
      });

      if (!res.ok) throw new Error('Failed to send reply');

      toast({
        title: 'Reply Sent',
        description: 'Driver has been notified and message marked as read.',
      });

      fetchAssistance(); // Refresh state
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Could not send reply.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center mt-10">Loading assistance info...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;
  if (!assistance) return <div className="text-center mt-10">No assistance data found.</div>;

  return (
    <div className="max-w-xl mx-auto mt-10 bg-gray-100 border border-gray-300 p-6 rounded-lg shadow space-y-6">
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          Driver Trip Assistance
        </h2>

        <div className="space-y-2 text-sm">
          <div>
            <strong>Subject:</strong> {assistance.subject}
          </div>
          <div>
            <strong>Description:</strong> {assistance.description}
          </div>
          <div>
            <strong>Location:</strong> {assistance.location}
          </div>
          <div className="text-xs text-gray-500">
            Reported At: {new Date(assistance.createdAt).toLocaleString()}
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-medium text-sm mb-1">Your Reply</h3>

        {userRole === 'VENDOR' || userRole === 'ADMIN' ? (
  <>
    <Textarea
      placeholder="Write your response to the driver here..."
      value={replyText}
      onChange={(e) => setReplyText(e.target.value)}
      disabled={!!assistance.reply}
    />
    {!assistance.reply && (
      <Button
        onClick={handleReplySubmit}
        className="mt-3"
        disabled={submitting}
      >
        {submitting ? 'Sending...' : 'Send Reply & Mark as Read'}
      </Button>
    )}
    {assistance.reply && (
      <p className="text-xs text-gray-500 mt-2">
        This message was already replied and marked as read.
      </p>
    )}
  </>
) : (
  <>
    <div className="p-3 bg-white border border-gray-300 rounded">
      {assistance.reply ? (
        <p className="text-sm text-gray-700">{assistance.reply}</p>
      ) : (
        <p className="text-sm text-gray-500 italic">Awaiting response from Vendor...</p>
      )}
    </div>
  </>
)}

        

      </div>
    </div>
  );
};

export default TripAssistancePage;
