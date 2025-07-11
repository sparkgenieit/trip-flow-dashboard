import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { createBooking, updateBooking, fetchUserByEmail } from '@/services/bookings';
import CityCombobox from '@/components/common/CityCombobox';
import { v4 as uuidv4 } from 'uuid';

interface BookingFormProps {
  booking?: any;
  onClose: () => void;
  onSuccess: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ booking, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',               // ✅ NEW
    phone: '',              // ✅ NEW
    pickupLocation: '',
    dropoffLocation: '',
    pickupDateTime: '',
    bookingType: 'individual',
    vehicleType: '',
    estimatedCost: '',
    notes: '',
    fromCity: '',
    dropCity: '',
    tripType: '',
    stopCities: [] as string[],
  });

  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState<any[]>([]);
  const [tripTypes, setTripTypes] = useState<any[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);
  const [distanceInfo, setDistanceInfo] = useState<{
    originalDistanceKm: number;
    optimizedDistanceKm: number;
  } | null>(null);
const [optimizedRoute, setOptimizedRoute] = useState<number[]>([]);
const [pickupSuggestions, setPickupSuggestions] = useState<{ description: string; place_id: string }[]>([]);
const pickupController = useRef<AbortController | null>(null);
const pickupSession = useRef(uuidv4());
const [dropSuggestions, setDropSuggestions] = useState<{ description: string; place_id: string }[]>([]);
const dropController = useRef<AbortController | null>(null);
const dropSession = useRef(uuidv4());

const fetchPickupSuggestions = async (
  input: string,
  fromCityName: string,
  onSuccess: (suggestions: { description: string; place_id: string }[]) => void,
  onError: () => void
) => {
  pickupController.current?.abort();
  pickupController.current = new AbortController();
  try {
     const token = localStorage.getItem('authToken');

 
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/places/autocomplete?input=${fromCityName} ${encodeURIComponent(input)}&sessiontoken=${pickupSession.current}`,
      { signal: pickupController.current.signal,
        headers: { Authorization: token ? `Bearer ${token}` : '' }
       }
    );
    if (!res.ok) throw new Error('Failed to fetch');
    const data = await res.json();
    onSuccess(data);
  } catch (err: any) {
    if (err.name !== 'AbortError') console.error(err);
    onError();
  }
};

const fetchDropSuggestions = async (
  input: string,
  toCityName: string,
  onSuccess: (suggestions: { description: string; place_id: string }[]) => void,
  onError: () => void
) => {
  dropController.current?.abort();
  dropController.current = new AbortController();
  try {
    const token = localStorage.getItem('authToken');
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/places/autocomplete?input=${toCityName} ${encodeURIComponent(input)}&sessiontoken=${dropSession.current}`,
      {
        signal: dropController.current.signal,
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      }
    );
    if (!res.ok) throw new Error('Failed to fetch');
    const data = await res.json();
    onSuccess(data);
  } catch (err: any) {
    if (err.name !== 'AbortError') console.error(err);
    onError();
  }
};

const handleEmailBlur = async () => {
  const email = formData.email.trim();
  if (!email || !email.includes('@')) return;

  try {
    const res = await fetchUserByEmail(email);
    const { exists, user, addresses } = res;

    if (exists && user) {
      const pickup = addresses?.find((addr) => addr.type === 'PICKUP');
      const drop = addresses?.find((addr) => addr.type === 'DROP');

      setFormData((prev) => ({
        ...prev,
        name: user.name || '',
        phone: user.phone || '', // fallback if `phone` exists
        pickupLocation: pickup?.address || prev.pickupLocation,
        dropoffLocation: drop?.address || prev.dropoffLocation,
      }));
    }
  } catch (err) {
    console.error('Email lookup failed:', err);
  }
};


  const { toast } = useToast();

  useEffect(() => {
    if (booking) {
      setFormData((prev) => ({
        ...prev,
        email: booking.email || '',
        pickupLocation: booking.pickupLocation || '',
        dropoffLocation: booking.dropoffLocation || '',
        pickupDateTime: booking.pickupDateTime?.slice(0, 16) || '',
        bookingType: booking.bookingType || 'individual',
        vehicleType: String(booking.vehicleTypeId || ''),
        estimatedCost: booking.estimatedCost?.toString() || '',
        notes: booking.notes || '',
        fromCity: String(booking.fromCityId || ''),
        dropCity: String(booking.toCityId || ''),
        tripType: String(booking.tripTypeId || ''),
        stopCities: booking.stopCities || [],
      }));
    }
  }, [booking]);

 
  useEffect(() => {
    const token = localStorage.getItem('authToken');

    fetch(`${import.meta.env.VITE_API_BASE_URL}/cities`, {
      headers: { Authorization: token ? `Bearer ${token}` : '' },
    })
      .then((res) => res.json())
      .then(setCities)
      .catch((err) => console.error('Failed to fetch cities', err));

    fetch(`${import.meta.env.VITE_API_BASE_URL}/trip-types`, {
      headers: { Authorization: token ? `Bearer ${token}` : '' },
    })
      .then((res) => res.json())
      .then(setTripTypes)
      .catch((err) => console.error('Failed to fetch trip types', err));

    fetch(`${import.meta.env.VITE_API_BASE_URL}/vehicle-types`, {
      headers: { Authorization: token ? `Bearer ${token}` : '' },
    })
      .then((res) => res.json())
      .then(setVehicleTypes)
      .catch((err) => console.error('Failed to fetch vehicle types', err));
  }, []);

  const selectedTrip = tripTypes.find(t => String(t.id) === formData.tripType);
  const tripSlug = selectedTrip?.slug ?? '';

  const showDropCity = ['one-way', 'round-trip', 'outstation', 'airport-transfer'].includes(tripSlug);
  const showDropoffLocation = ['one-way', 'outstation'].includes(tripSlug);

  const fromCityLabel = ['airport-transfer', 'local-city'].includes(tripSlug)
    ? 'Current City'
    : 'From City';

  const dropCityLabel = tripSlug === 'outstation'
    ? 'Return To City'
    : 'Drop City';

  // 👇 Distance calculator effect
 useEffect(() => {
  const shouldCalculate =
    formData.fromCity &&
    formData.dropCity &&
    ['one-way', 'outstation', 'round-trip'].includes(tripSlug);

  if (!shouldCalculate) {
    setDistanceInfo(null);
    setOptimizedRoute([]);
    return;
  }

  const cityIds = [formData.fromCity, ...formData.stopCities.filter(Boolean), formData.dropCity].map(Number);

  fetch(`${import.meta.env.VITE_API_BASE_URL}/cities/calculate-distance`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
    },
    body: JSON.stringify({ cityIds }),
  })
    .then((res) => res.json())
    .then((data) => {
      setDistanceInfo({
        originalDistanceKm: data.originalDistanceKm,
        optimizedDistanceKm: data.optimizedDistanceKm,
      });
      setOptimizedRoute(data.optimizedPath || []);
    })
    .catch((err) => {
      console.error('Failed to calculate distance:', err);
      setDistanceInfo(null);
      setOptimizedRoute([]);
    });
}, [formData.fromCity, formData.dropCity, formData.stopCities, tripSlug]);


useEffect(() => {
  const controller = pickupController.current;
  const val = formData.pickupLocation;

  if (val.trim().length < 2 || !formData.fromCity) {
    setPickupSuggestions([]);
    return;
  }

  const fromCityName = cities.find(c => String(c.id) === formData.fromCity)?.name || '';
  if (!fromCityName) return;

  const timeout = setTimeout(() => {
    fetchPickupSuggestions(val, fromCityName, setPickupSuggestions, () => setPickupSuggestions([]));
  }, 300); // 300ms debounce

  return () => {
    clearTimeout(timeout);
    controller?.abort();
  };
}, [formData.pickupLocation, formData.fromCity, cities]);

useEffect(() => {
  const controller = dropController.current;
  const val = formData.dropoffLocation;

  if (val.trim().length < 2 || !formData.dropCity) {
    setDropSuggestions([]);
    return;
  }

  const toCityName = cities.find(c => String(c.id) === formData.dropCity)?.name || '';
  if (!toCityName) return;

  const timeout = setTimeout(() => {
    fetchDropSuggestions(val, toCityName, setDropSuggestions, () => setDropSuggestions([]));
  }, 300); // Debounce

  return () => {
    clearTimeout(timeout);
    controller?.abort();
  };
}, [formData.dropoffLocation, formData.dropCity, cities]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        estimatedCost: parseFloat(formData.estimatedCost || '0'),
        pickupDateTime: new Date(formData.pickupDateTime).toISOString(),
        fromCityId: Number(formData.fromCity),
        toCityId: Number(formData.dropCity),
        vehicleTypeId: Number(formData.vehicleType),
        tripTypeId: Number(formData.tripType),
        fare: parseFloat(formData.estimatedCost || '0'),
      };

      if (booking?.id) {
        await updateBooking(booking.id, payload);
        toast({ title: 'Booking updated successfully' });
      } else {
        await createBooking(payload);
        toast({ title: 'Booking created successfully' });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to save booking',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{booking ? 'Edit Booking' : 'Create New Booking'}</DialogTitle>
          <DialogDescription>
            {booking ? 'Update booking details' : 'Enter details for the new booking'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label>User Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              onBlur={handleEmailBlur}
              required
            />
          </div>
          <div className="space-y-2 md:col-span-1">
            <Label>User Name</Label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2 md:col-span-1">
            <Label>Phone Number</Label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Trip Type</Label>
            <Select value={formData.tripType} onValueChange={(value) => setFormData({ ...formData, tripType: value })}>
              <SelectTrigger><SelectValue placeholder="Select trip type" /></SelectTrigger>
              <SelectContent>
                {tripTypes.map((type) => (
                  <SelectItem key={type.id} value={String(type.id)}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>{fromCityLabel}</Label>
            <CityCombobox
              cities={cities}
              value={formData.fromCity}
              onChange={(id) => setFormData({ ...formData, fromCity: id })}
              placeholder={fromCityLabel}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Stopover Cities (optional)</Label>
            {formData.stopCities.map((cityId, index) => (
              <div key={index} className="flex gap-2 items-center">
                <CityCombobox
                  cities={cities}
                  value={cityId}
                  onChange={(id) => {
                    const updated = [...formData.stopCities];
                    updated[index] = id;
                    setFormData({ ...formData, stopCities: updated });
                  }}
                  placeholder={`Select stopover city #${index + 1}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    const updated = [...formData.stopCities];
                    updated.splice(index, 1);
                    setFormData({ ...formData, stopCities: updated });
                  }}
                >
                  ✕
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => setFormData({ ...formData, stopCities: [...formData.stopCities, ''] })}
            >
              + Add Stopover City
            </Button>
          </div>

          {showDropCity && (
            <div className="space-y-2">
              <Label>{dropCityLabel}</Label>
              <CityCombobox
                cities={cities}
                value={formData.dropCity}
                onChange={(id) => setFormData({ ...formData, dropCity: id })}
                placeholder={dropCityLabel}
              />
            </div>
          )}

          <div className="space-y-4 md:col-span-2">
            <Label>Pickup Location</Label>
<div className="relative">
  <Input
    value={formData.pickupLocation}
    onChange={(e) => {
      const val = e.target.value;
      setFormData({ ...formData, pickupLocation: val });
      console.log(formData);
   
    }}
    required
    autoComplete="off"
  />
  {pickupSuggestions.length > 0 && (
    <ul className="absolute z-30 bg-white border border-gray-300 rounded-md mt-1 w-full max-h-60 overflow-auto text-sm">
      {pickupSuggestions.map((s) => (
        <li
          key={s.place_id}
          onClick={() => {
            setFormData({ ...formData, pickupLocation: s.description });
            setPickupSuggestions([]);
          }}
          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
        >
          {s.description}
        </li>
      ))}
    </ul>
  )}
</div>

          </div>

          {showDropoffLocation && (
  <div className="space-y-4 md:col-span-2">
    <Label>Dropoff Location</Label>
    <div className="relative">
      <Input
        value={formData.dropoffLocation}
        onChange={(e) => setFormData({ ...formData, dropoffLocation: e.target.value })}
        required
        autoComplete="off"
      />
      {dropSuggestions.length > 0 && (
        <ul className="absolute z-30 bg-white border border-gray-300 rounded-md mt-1 w-full max-h-60 overflow-auto text-sm">
          {dropSuggestions.map((s) => (
            <li
              key={s.place_id}
              onClick={() => {
                setFormData({ ...formData, dropoffLocation: s.description });
                setDropSuggestions([]);
              }}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
            >
              {s.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
)}


          <div className="space-y-2">
            <Label>Pickup Time</Label>
            <Input
              type="datetime-local"
              value={formData.pickupDateTime}
              onChange={(e) => setFormData({ ...formData, pickupDateTime: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Vehicle Type</Label>
           <Select
  value={formData.vehicleType}
  onValueChange={(value) => {
    const selectedVehicle = vehicleTypes.find((v) => String(v.id) === value);

    // Calculate estimated cost if distance is already calculated
    let estimatedCost = formData.estimatedCost;
    if (selectedVehicle && distanceInfo?.optimizedDistanceKm) {
      estimatedCost = (
        selectedVehicle.estimatedRatePerKm * distanceInfo.optimizedDistanceKm +
        selectedVehicle.baseFare
      ).toFixed(2);
    }

    setFormData((prev) => ({
      ...prev,
      vehicleType: value,
      estimatedCost: estimatedCost,
    }));
  }}
>
   <SelectTrigger><SelectValue placeholder="Select vehicle type" /></SelectTrigger>
              <SelectContent>
                {vehicleTypes.map((v) => (
                  <SelectItem key={v.id} value={String(v.id)}>{v.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Estimated Cost</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.estimatedCost}
              onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
            />
            

          {distanceInfo && (
            <div className="md:col-span-2 text-sm border p-3 rounded bg-muted">
              <p><strong>Original Distance:</strong> {distanceInfo.originalDistanceKm.toFixed(2)} km</p>
              { formData.vehicleType && (
  <div className="md:col-span-2 text-sm border p-3 rounded bg-muted">
  
    {(() => {
      const selectedVehicle = vehicleTypes.find(
        (v) => String(v.id) === formData.vehicleType
      );

      if (!selectedVehicle) return null;

      const rate = selectedVehicle.estimatedRatePerKm;
      const base = selectedVehicle.baseFare;
      const dist = distanceInfo.optimizedDistanceKm;
      const cost = (rate * dist + base).toFixed(2);

      return (
        <>
          <p>
            Estimated Fare = ₹{rate} × {dist.toFixed(2)} km + ₹{base}
          </p>
          <p className="font-bold">
            = ₹{cost}
          </p>
        </>
      );
    })()}
  </div>
)}
              
              <p><strong>Optimized Distance:</strong> {distanceInfo.optimizedDistanceKm.toFixed(2)} km</p>
              {optimizedRoute.length > 0 && (
                <p className="pt-1">
                  <strong>Optimized Route:</strong>{' '}
                  {optimizedRoute
                    .map((id) => cities.find((c) => String(c.id) === String(id))?.name || `City#${id}`)
                    .join(' → ')}
                </p>
              )}
            </div>
          )}

          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Notes</Label>
            <Textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <DialogFooter className="md:col-span-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : booking ? 'Update Booking' : 'Create Booking'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookingForm;
