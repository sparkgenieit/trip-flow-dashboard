import React, { useEffect, useState } from 'react';
import GoogleMapReact from 'google-map-react';
import { useSearchParams } from 'react-router-dom';
import {
  getDriverUpdatesByTrip,
  seedMockDriverUpdates,
  DriverUpdate,
} from '@/services/driverUpdates';

const Marker = ({ lat, lng }: { lat: number; lng: number }) => (
  <div
    style={{
      transform: 'translate(-50%, -100%)',
      fontSize: '24px',
      color: '#EF4444', // Tailwind red-500
    }}
  >
    📍
  </div>
);

const TrackTripPage = () => {
  const [searchParams] = useSearchParams();
  const tripId = Number(searchParams.get('tripId') || '0');
  const driverId = 5; // Simulated driver

  const [updates, setUpdates] = useState<DriverUpdate[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const current = updates[currentIndex];

// 🔁 Replace this function in TrackTripPage.tsx
const loadUpdates = async () => {
  try {
    console.log('⚠️ Forcing reseed with updated mockRoute data...');
    await seedMockDriverUpdates(tripId, driverId); // ⛳ Force reseed every time
    const data = await getDriverUpdatesByTrip(tripId);
    console.log('🚗 Loaded updates:', data);
    setUpdates(data);
  } catch (err) {
    console.error('❌ Failed to load updates:', err);
  }
};


  useEffect(() => {
    if (tripId) loadUpdates();
  }, [tripId]);

  useEffect(() => {
    if (updates.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) =>
        prev + 1 < updates.length ? prev + 1 : prev
      );
    }, 10000); // Simulates 1 hour every 5 seconds

    return () => clearInterval(interval);
  }, [updates]);

  if (!current) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold">Tracking Trip #{tripId}</h1>
        <p>Loading map and driver updates...</p>
      </div>
    );
  }

return (
  <div className="flex h-screen">
    {/* Left: Vertical Timeline */}
    <div className="w-1/3 bg-gray-100 p-4 overflow-y-auto flex flex-col-reverse gap-6">
      {updates
  .slice(0, currentIndex + 1)
  .map((update, idx, visibleUpdates) => {
    const isActive = idx === visibleUpdates.length - 1;
    return (
      <div key={idx} className="flex gap-4 items-start mb-4">
        {/* Active vertical bar */}
        <div className="w-2 flex flex-col items-center">
          <div
            className={`w-2 rounded-full h-full transition-all duration-300 ${
              isActive ? 'bg-red-500 animate-pulse' : 'bg-gray-300'
            }`}
          />
        </div>

        {/* Timeline card */}
        <div
          className={`rounded-xl shadow-lg p-4 text-sm transition-all duration-300 bg-white w-full ${
            isActive
              ? 'border-2 border-red-500 ring-2 ring-red-300 scale-[1.01]'
              : 'border border-gray-200'
          }`}
        >
          <div className="text-base font-semibold text-gray-800 mb-1">
            {update.statusMessage}
          </div>
          <div className="text-xs text-gray-500 mb-2">
            {new Date(update.createdAt).toLocaleTimeString()}
          </div>
          <div className="text-sm text-gray-700">
            <strong>Latitude:</strong> {update.latitude.toFixed(5)} <br />
            <strong>Longitude:</strong> {update.longitude.toFixed(5)} <br />
            <strong>Trip ID:</strong> {update.tripId} <br />
            <strong>Driver ID:</strong> {update.driverId}
          </div>
        </div>
      </div>
    );
  })}


    </div>

    {/* Right: Google Map */}
    <div className="w-2/3 relative">
      <GoogleMapReact
        bootstrapURLKeys={{ key: 'AIzaSyAOFJg21NyAREYruHAtIAIzNehg7TNbxc8' }}
        center={{ lat: current.latitude, lng: current.longitude }}
        defaultZoom={12}
      >
        <Marker lat={current.latitude} lng={current.longitude} />
      </GoogleMapReact>
    </div>
  </div>
);

};

export default TrackTripPage;
