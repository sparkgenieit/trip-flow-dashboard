import React, { useEffect, useState } from 'react';
import GoogleMapReact from 'google-map-react';
import { useSearchParams } from 'react-router-dom';
import { driverUpdates } from './driverUpdates'; // ✅ adjust path if needed

const Marker = ({ lat, lng }: { lat: number; lng: number }) => (
  <div className="text-red-600 text-xl">📍</div>
);

const TrackTripPage = () => {
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get('tripId');

  const [index, setIndex] = useState(0);
  const [location, setLocation] = useState(driverUpdates[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => {
        const nextIndex = prev + 1;
        if (nextIndex < driverUpdates.length) {
          setLocation(driverUpdates[nextIndex]);
          return nextIndex;
        }
        return prev;
      });
    }, 3600000); // every 1 hour (in ms)

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <h1 className="text-2xl font-bold p-4">Tracking Trip #{tripId}</h1>
      <GoogleMapReact
        bootstrapURLKeys={{ key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY }}
        center={{ lat: location.lat, lng: location.lng }}
        defaultZoom={12}
      >
        <Marker lat={location.lat} lng={location.lng} />
      </GoogleMapReact>

      <div className="p-4">
        <h2 className="text-lg font-semibold">Driver Status:</h2>
        <p className="text-gray-700">{location.status}</p>
      </div>
    </div>
  );
};

export default TrackTripPage;
