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
    <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
      <h1 className="text-2xl font-bold p-4">Tracking Trip #{tripId}</h1>

      <GoogleMapReact
        bootstrapURLKeys={{ key: 'AIzaSyCx7ABaUaR43JU2bhbyDvAEfLk9t0vvLQI' }}
        center={{ lat: current.latitude, lng: current.longitude }}
        defaultZoom={12}
      >
        <Marker lat={current.latitude} lng={current.longitude} />
      </GoogleMapReact>

      {/* ✅ Floating Driver Update Info Card */}
      <div
        style={{
          position: 'absolute',
          bottom: '30px',
          right: '30px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
          padding: '16px',
          width: '260px',
          zIndex: 10,
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}
        >
          {current.statusMessage}
        </div>
        <div
          style={{ fontSize: '13px', color: '#4B5563', marginBottom: '4px' }}
        >
          <strong>Time:</strong>{' '}
          {new Date(current.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </div>
        <div style={{ fontSize: '13px', color: '#4B5563' }}>
          <strong>Latitude:</strong> {current.latitude.toFixed(5)}
        </div>
        <div style={{ fontSize: '13px', color: '#4B5563' }}>
          <strong>Longitude:</strong> {current.longitude.toFixed(5)}
        </div>
        <div style={{ fontSize: '13px', color: '#4B5563' }}>
          <strong>Trip ID:</strong> {current.tripId}
        </div>
        <div style={{ fontSize: '13px', color: '#4B5563' }}>
          <strong>Driver ID:</strong> {current.driverId}
        </div>
      </div>
    </div>
  );
};

export default TrackTripPage;
