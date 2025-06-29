
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { CalendarDays } from 'lucide-react';

interface BookingEvent {
  id: string;
  employee: string;
  time: string;
  pickup: string;
  drop: string;
  vehicle: string;
  status: string;
}

const mockBookingEvents: { [key: string]: BookingEvent[] } = {
  '2024-01-15': [
    { id: '1', employee: 'John Smith', time: '09:00', pickup: 'Office', drop: 'Airport', vehicle: 'Sedan', status: 'Approved' },
    { id: '2', employee: 'Sarah Johnson', time: '14:00', pickup: 'Hotel', drop: 'Conference Center', vehicle: 'SUV', status: 'Approved' },
  ],
  '2024-01-16': [
    { id: '3', employee: 'Mike Chen', time: '10:30', pickup: 'Office', drop: 'Client Office', vehicle: 'EV', status: 'Approved' },
  ],
};

const CalendarView = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const selectedDateStr = selectedDate ? formatDate(selectedDate) : '';
  const dayEvents = mockBookingEvents[selectedDateStr] || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'border-l-green-500 bg-green-50';
      case 'Pending':
        return 'border-l-yellow-500 bg-yellow-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Calendar View</h1>
        <p className="text-gray-600">View upcoming approved bookings and schedule</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Select Date
            </CardTitle>
            <CardDescription>
              Choose a date to view scheduled bookings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Daily Schedule */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              Schedule for {selectedDate ? selectedDate.toLocaleDateString() : 'Select a date'}
            </CardTitle>
            <CardDescription>
              {dayEvents.length} booking{dayEvents.length !== 1 ? 's' : ''} scheduled
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dayEvents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No bookings scheduled for this date
              </div>
            ) : (
              <div className="space-y-4">
                {dayEvents
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((event) => (
                    <div
                      key={event.id}
                      className={`p-4 rounded-lg border-l-4 ${getStatusColor(event.status)}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900">
                            {event.time} - {event.employee}
                          </div>
                          <div className="text-sm text-gray-600">
                            {event.pickup} → {event.drop}
                          </div>
                          <div className="text-sm text-gray-500">
                            Vehicle: {event.vehicle}
                          </div>
                        </div>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          {event.status}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CalendarView;
