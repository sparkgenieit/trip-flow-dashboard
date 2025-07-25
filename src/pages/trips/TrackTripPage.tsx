import React, { useEffect, useState } from 'react';
import GoogleMapReact from 'google-map-react';
import { useSearchParams } from 'react-router-dom';

const Marker = () => <div className="text-red-600 text-xl">📍</div>;

const TrackTripPage = () => {
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get('tripId');
  const [lat, setLat] = useState<number>(12.9352);
  const [lng, setLng] = useState<number>(77.6946);

  useEffect(() => {
    const interval = setInterval(() => {
      setLat((prev) => prev + (Math.random() - 0.5) * 0.001);
      setLng((prev) => prev + (Math.random() - 0.5) * 0.001);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <h1 className="text-2xl font-bold p-4">Tracking Trip #{tripId}</h1>
      <GoogleMapReact
        bootstrapURLKeys={{ key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY }}
        center={{ lat, lng }}
        defaultZoom={15}
      >
        <Marker lat={lat} lng={lng} />
      </GoogleMapReact>
    </div>
  );
};

export default TrackTripPage;