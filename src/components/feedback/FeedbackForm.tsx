import React, { useState } from 'react';
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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

interface FeedbackFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FeedbackFormData) => void;
  tripInfo: {
    from: string;
    to: string;
    driverName: string;
  };
}

export interface FeedbackFormData {
  driverRating: number;
  vehicleRating: number;
  serviceRating: number;
  comment: string;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ open, onClose, onSubmit, tripInfo }) => {
  const [driverRating, setDriverRating] = useState<string>('5');
  const [vehicleRating, setVehicleRating] = useState<string>('4');
  const [serviceRating, setServiceRating] = useState<string>('5');
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    const payload: FeedbackFormData = {
      driverRating: Number(driverRating),
      vehicleRating: Number(vehicleRating),
      serviceRating: Number(serviceRating),
      comment,
    };
    onSubmit(payload);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Leave Feedback</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label>Trip:</Label>
            <p className="text-sm text-gray-600">{tripInfo.from} → {tripInfo.to}</p>
            <Label>Driver:</Label>
            <p className="text-sm text-gray-600">{tripInfo.driverName}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Driver Rating</Label>
              <Select value={driverRating} onValueChange={setDriverRating}>
                <SelectTrigger><SelectValue placeholder="Select rating" /></SelectTrigger>
                <SelectContent>
                  {[5, 4, 3, 2, 1].map((v) => (
                    <SelectItem key={v} value={v.toString()}>{v} ⭐</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Vehicle Rating</Label>
              <Select value={vehicleRating} onValueChange={setVehicleRating}>
                <SelectTrigger><SelectValue placeholder="Select rating" /></SelectTrigger>
                <SelectContent>
                  {[5, 4, 3, 2, 1].map((v) => (
                    <SelectItem key={v} value={v.toString()}>{v} ⭐</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Service Rating</Label>
              <Select value={serviceRating} onValueChange={setServiceRating}>
                <SelectTrigger><SelectValue placeholder="Select rating" /></SelectTrigger>
                <SelectContent>
                  {[5, 4, 3, 2, 1].map((v) => (
                    <SelectItem key={v} value={v.toString()}>{v} ⭐</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Comment</Label>
            <Textarea
              placeholder="Write your feedback..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackForm;
