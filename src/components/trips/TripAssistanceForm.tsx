import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export interface TripAssistanceFormData {
  subject: string;
  description: string;
  location: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: TripAssistanceFormData) => void;
  viewOnly?: boolean;
  data?: TripAssistanceFormData | null;
}

const TripAssistanceForm: React.FC<Props> = ({
  open,
  onClose,
  onSubmit,
  viewOnly = false,
  data = null,
}) => {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Fetching...');

  useEffect(() => {
    if (!open) return;

    if (viewOnly && data) {
      setSubject(data.subject);
      setDescription(data.description);
      setLocation(data.location);
    } else {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = `Lat: ${pos.coords.latitude}, Long: ${pos.coords.longitude}`;
          setLocation(coords);
        },
        () => setLocation('Location permission denied'),
      );
    }
  }, [open, viewOnly, data]);

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit({
        subject,
        description,
        location,
      });
    }
  };


  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Trip Assistance Request</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label>Location</Label>
            <p className="text-sm text-gray-700">{location}</p>
          </div>
          <div>
            <Label>Subject</Label>
            <Input
              placeholder="Enter subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={viewOnly}
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              placeholder="Describe the issue"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={viewOnly}
            />
          </div>
        </div>
         
         {!viewOnly && (
        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Submit</Button>
        </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TripAssistanceForm;
