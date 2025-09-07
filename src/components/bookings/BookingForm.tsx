import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  createBooking,
  updateBooking,
  fetchUserByPhone,
} from "@/services/bookings";
import CityCombobox from "@/components/common/CityCombobox";
import { v4 as uuidv4 } from "uuid";

interface BookingFormProps {
  booking?: any;
  onClose: () => void;
  onSuccess: () => void;
}


const BookingForm: React.FC<BookingFormProps> = ({
  booking,
  onClose,
  onSuccess,
}) => {
  console.log(booking);
const [formData, setFormData] = useState({
  name: booking?.user?.name || "",
  phone: booking?.user?.phone || "",
  pickupLocation: booking?.pickupAddress?.address || "",
  dropoffLocation: booking?.dropAddress?.address || "",
  pickupDateTime: booking?.pickupDateTime?.slice(0, 16) || "",
  // NEW: return date (date only). Try booking.returnDate first, else from returnDateTime
  returnDate: booking?.returnDate || booking?.returnDateTime?.slice(0, 10) || "",
  bookingType: booking?.bookingType || "individual",
  vehicleType: String(booking?.vehicleTypeId || ""),
  estimatedCost: booking?.fare?.toFixed(2) || "",
  notes: booking?.notes || "",
  fromCity: String(booking?.fromCity?.id || ""),
  dropCity: String(booking?.toCity?.id || ""),
  tripType: String(booking?.tripTypeId || booking?.TripType?.id || ""),
  stopCities: booking?.stopCities || [],
  numPersons: booking?.numPersons || 1,
  numVehicles: booking?.numVehicles || 1,
});
  const isEditMode = !!booking;
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState<any[]>([]);
  const [tripTypes, setTripTypes] = useState<any[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);
  const [distanceInfo, setDistanceInfo] = useState<{
    originalDistanceKm: number;
    optimizedDistanceKm: number;
  } | null>(null);
  const [optimizedRoute, setOptimizedRoute] = useState<number[]>([]);
  const [pickupSuggestions, setPickupSuggestions] = useState<
    { description: string; place_id: string }[]
  >([]);
  const pickupController = useRef<AbortController | null>(null);
  const pickupSession = useRef(uuidv4());
  const [dropSuggestions, setDropSuggestions] = useState<
    { description: string; place_id: string }[]
  >([]);
  const dropController = useRef<AbortController | null>(null);
  const dropSession = useRef(uuidv4());

  const fetchPickupSuggestions = async (
    input: string,
    fromCityName: string,
    onSuccess: (
      suggestions: { description: string; place_id: string }[]
    ) => void,
    onError: () => void
  ) => {
    pickupController.current?.abort();
    pickupController.current = new AbortController();
    try {
      const token = localStorage.getItem("authToken");

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL
        }/places/autocomplete?input=${fromCityName} ${encodeURIComponent(
          input
        )}&sessiontoken=${pickupSession.current}`,
        {
          signal: pickupController.current.signal,
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      onSuccess(data);
    } catch (err: any) {
      if (err.name !== "AbortError") console.error(err);
      onError();
    }
  };

  const fetchDropSuggestions = async (
    input: string,
    toCityName: string,
    onSuccess: (
      suggestions: { description: string; place_id: string }[]
    ) => void,
    onError: () => void
  ) => {
    dropController.current?.abort();
    dropController.current = new AbortController();
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL
        }/places/autocomplete?input=${toCityName} ${encodeURIComponent(
          input
        )}&sessiontoken=${dropSession.current}`,
        {
          signal: dropController.current.signal,
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      onSuccess(data);
    } catch (err: any) {
      if (err.name !== "AbortError") console.error(err);
      onError();
    }
  };

  const handlePhoneBlur = async () => {
    const phone = formData.phone.trim();
    if (!phone || phone.length < 6) return;

    try {
      const res = await fetchUserByPhone(phone); // make sure this API exists
      const { exists, user, addresses } = res;

      if (exists && user) {
        const pickup = addresses?.find((addr) => addr.type === "PICKUP");
        const drop = addresses?.find((addr) => addr.type === "DROP");

        setFormData((prev) => ({
          ...prev,
          name: user.name || "",
          pickupLocation: pickup?.address || prev.pickupLocation,
          dropoffLocation: drop?.address || prev.dropoffLocation,
        }));
      }
    } catch (err) {
      console.error("Phone lookup failed:", err);
    }
  };

  const { toast } = useToast();

  // --- Multi-step (3-tab) state & validation ---
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const validateStep = (s: 1 | 2 | 3) => {
    if (s === 1) {
      if (!formData.tripType) {
        toast({ title: "Select trip type", variant: "destructive" });
        return false;
      }
      if (!formData.fromCity) {
        toast({ title: "Select From City", variant: "destructive" });
        return false;
      }
      if (!formData.pickupLocation.trim()) {
        toast({ title: "Enter Pickup Location", variant: "destructive" });
        return false;
      }
      if (!formData.pickupDateTime) {
        toast({ title: "Pick a Pickup Date & Time", variant: "destructive" });
        return false;
      }
      if (["one-way","outstation","round-trip","airport-transfer"].includes(tripSlug) && !formData.dropCity) {
        toast({ title: "Select Drop/Return City", variant: "destructive" });
        return false;
      }
      if (["one-way","outstation"].includes(tripSlug) && !formData.dropoffLocation.trim()) {
        toast({ title: "Enter Dropoff Location", variant: "destructive" });
        return false;
      }
      if (tripSlug === "round-trip" && !formData.returnDate) {
        toast({ title: "Select Return Date", variant: "destructive" });
        return false;
      }
      return true;
    }

    if (s === 2) {
      if (!formData.numPersons || Number(formData.numPersons) < 1) {
        toast({ title: "Enter number of persons", variant: "destructive" });
        return false;
      }
      if (!formData.vehicleType) {
        toast({ title: "Select a vehicle type", variant: "destructive" });
        return false;
      }
      return true;
    }

    return true; // step 3 validated on final submit
  };

  const goNext = () => {
    if (validateStep(step)) setStep((s) => (s < 3 ? ((s + 1) as 1 | 2 | 3) : s));
  };
  const goPrev = () => setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3) : s));


  useEffect(() => {
    const token = localStorage.getItem("authToken");

    fetch(`${import.meta.env.VITE_API_BASE_URL}/cities`, {
      headers: { Authorization: token ? `Bearer ${token}` : "" },
    })
      .then((res) => res.json())
      .then(setCities)
      .catch((err) => console.error("Failed to fetch cities", err));

    fetch(`${import.meta.env.VITE_API_BASE_URL}/trip-types`, {
      headers: { Authorization: token ? `Bearer ${token}` : "" },
    })
      .then((res) => res.json())
      .then(setTripTypes)
      .catch((err) => console.error("Failed to fetch trip types", err));

    fetch(`${import.meta.env.VITE_API_BASE_URL}/vehicle-types`, {
      headers: { Authorization: token ? `Bearer ${token}` : "" },
    })
      .then((res) => res.json())
      .then(setVehicleTypes)
      .catch((err) => console.error("Failed to fetch vehicle types", err));
  }, []);

  const selectedTrip = tripTypes.find(
    (t) => String(t.id) === formData.tripType
  );
  const tripSlug = selectedTrip?.slug ?? "";

  const showDropCity = [
    "one-way",
    "round-trip",
    "outstation",
    "airport-transfer",
  ].includes(tripSlug);
  const showDropoffLocation = ["one-way", "outstation"].includes(tripSlug);

  const fromCityLabel = ["airport-transfer", "local-city"].includes(tripSlug)
    ? "Current City"
    : "From City";

  const dropCityLabel =
    tripSlug === "outstation" ? "Return To City" : "Drop City";

  // 👇 Distance calculator effect
  useEffect(() => {
    const shouldCalculate =
      formData.fromCity &&
      formData.dropCity &&
      ["one-way", "outstation", "round-trip"].includes(tripSlug);

    if (!shouldCalculate) {
      setDistanceInfo(null);
      setOptimizedRoute([]);
      return;
    }

    const cityIds = [
      formData.fromCity,
      ...formData.stopCities.filter(Boolean),
      formData.dropCity,
    ].map(Number);

    fetch(`${import.meta.env.VITE_API_BASE_URL}/cities/calculate-distance`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
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
        console.error("Failed to calculate distance:", err);
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

    const fromCityName =
      cities.find((c) => String(c.id) === formData.fromCity)?.name || "";
    if (!fromCityName) return;

    const timeout = setTimeout(() => {
      fetchPickupSuggestions(val, fromCityName, setPickupSuggestions, () =>
        setPickupSuggestions([])
      );
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

    const toCityName =
      cities.find((c) => String(c.id) === formData.dropCity)?.name || "";
    if (!toCityName) return;

    const timeout = setTimeout(() => {
      fetchDropSuggestions(val, toCityName, setDropSuggestions, () =>
        setDropSuggestions([])
      );
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
      // normalize numbers first
const persons = Math.max(1, Number(formData.numPersons || 1));
const vehicles = Math.max(1, Number(formData.numVehicles || 1));
const fare = Number.parseFloat(formData.estimatedCost || "0") || 0;

const payload = {
  name: formData.name,
  phone: formData.phone,
  pickupLocation: formData.pickupLocation,
  dropoffLocation: formData.dropoffLocation,
  pickupDateTime: new Date(formData.pickupDateTime).toISOString(),
  bookingType: formData.bookingType,
  vehicleTypeId: Number(formData.vehicleType),
  estimatedCost: fare,
  notes: formData.notes,
  fromCityId: Number(formData.fromCity),
  toCityId: Number(formData.dropCity),
  tripTypeId: Number(formData.tripType),
  stopCities: formData.stopCities.filter(Boolean),

  // --- persons/vehicles (force numeric) ---
  numPersons: persons,
  numVehicles: vehicles,

  // harmless aliases (if backend used a different key earlier)
  noOfPersons: persons,
  personsCount: persons,

  fare,
  ...(tripSlug === 'round-trip' && formData.returnDate
    ? { returnDate: formData.returnDate }
    : {}),
  
};



      if (booking?.id) {
        await updateBooking(booking.id, payload);
        toast({ title: "Booking updated successfully" });
      } else {
        await createBooking(payload);
        toast({ title: "Booking created successfully" });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving booking:", error);
      toast({
        title: "Error",
        description: "Failed to save booking",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {booking ? "Edit Booking" : "Create New Booking"}
          </DialogTitle>
          <DialogDescription>
            {booking
              ? "Update booking details"
              : "Enter details for the new booking"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3">
          {[1,2,3].map((n) => (
            <div key={n} className="flex items-center gap-2">
              <div
                className={[
                  "h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold",
                  step === n ? "bg-primary text-white" : "bg-muted text-foreground",
                ].join(" ")}
              >
                {n}
              </div>
              <span className={`text-sm ${step === n ? "font-semibold" : "text-muted-foreground"}`}>
                {n === 1 ? "Trip & Route" : n === 2 ? "Vehicle & Fare" : "Customer & Notes"}
              </span>
              {n !== 3 && <div className="w-8 h-[2px] bg-muted mx-2" />}
            </div>
          ))}
        </div>

        {/* -------- STEP 1: Trip & Route -------- */}
        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Trip Type</Label>
              <Select
                value={formData.tripType}
                onValueChange={(value) => setFormData({ ...formData, tripType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select trip type" />
                </SelectTrigger>
                <SelectContent>
                  {tripTypes.map((type) => (
                    <SelectItem key={type.id} value={String(type.id)}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
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
                onClick={() =>
                  setFormData({ ...formData, stopCities: [...formData.stopCities, ""] })
                }
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
                    onChange={(e) =>
                      setFormData({ ...formData, dropoffLocation: e.target.value })
                    }
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
                onChange={(e) =>
                  setFormData({ ...formData, pickupDateTime: e.target.value })
                }
                required
              />
            </div>

            {tripSlug === "round-trip" && (
              <div className="space-y-2">
                <Label>Return Date</Label>
                <Input
                  type="date"
                  value={formData.returnDate}
                  min={
                    formData.pickupDateTime
                      ? formData.pickupDateTime.slice(0, 10)
                      : undefined
                  }
                  onChange={(e) =>
                    setFormData({ ...formData, returnDate: e.target.value })
                  }
                  required
                />
              </div>
            )}
          </div>
        )}

        {/* -------- STEP 2: Vehicle & Fare -------- */}
        {step === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tripSlug !== "round-trip" && (
              <div className="space-y-2">
                <Label>No. of Persons</Label>
                <Input
                  type="number"
                  min={1}
                  value={formData.numPersons}
                  onChange={(e) => {
                  const persons = Math.max(1, Number(e.target.value) || 1); // force number
                  const selectedVehicle = vehicleTypes.find(
                    (v) => String(v.id) === formData.vehicleType
                  );
                  const seating = selectedVehicle?.seatingCapacity || 4;
                  const vehicles = Math.ceil(persons / seating);
                  setFormData((prev) => ({
                    ...prev,
                    numPersons: persons,
                    numVehicles: vehicles,
                  }));
                }}
                  required
                />
              </div>
            )}

            {tripSlug === "round-trip" && (
              <div className="space-y-2">
                <Label>No. of Persons</Label>
                <Input
                  type="number"
                  min={1}
                  value={formData.numPersons}
                  onChange={(e) => {
                    const persons = parseInt(e.target.value) || 1;
                    const selectedVehicle = vehicleTypes.find(
                      (v) => String(v.id) === formData.vehicleType
                    );
                    const seating = selectedVehicle?.seatingCapacity || 4;
                    const vehicles = Math.ceil(persons / seating);
                    setFormData((prev) => ({
                      ...prev,
                      numPersons: persons,
                      numVehicles: vehicles,
                    }));
                  }}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Suggested No. of Vehicles</Label>
              <Input
                type="number"
                readOnly
                value={formData.numVehicles}
                className="bg-gray-100 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <Label>Vehicle Type</Label>
              <Select
                value={formData.vehicleType}
                onValueChange={(value) => {
                  const selectedVehicle = vehicleTypes.find(
                    (v) => String(v.id) === value
                  );
                  if (!selectedVehicle) return;

                  const seating = selectedVehicle.seatingCapacity || 4;
                  const persons = formData.numPersons || 1;
                  const vehicles = Math.ceil(persons / seating);

                  let cost = "";
                  if (distanceInfo?.optimizedDistanceKm) {
                    const rate = selectedVehicle.estimatedRatePerKm;
                    const base = selectedVehicle.baseFare;
                    const dist = distanceInfo?.optimizedDistanceKm ?? 0;
                    const total = vehicles * (rate * dist + base);
                    cost = total.toFixed(2);
                  }

                  setFormData((prev) => ({
                    ...prev,
                    vehicleType: value,
                    numVehicles: vehicles,
                    estimatedCost: cost,
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  {vehicleTypes.map((v) => (
                    <SelectItem key={v.id} value={String(v.id)}>
                      {v.name}
                    </SelectItem>
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
                onChange={(e) =>
                  setFormData({ ...formData, estimatedCost: e.target.value })
                }
              />
            </div>

            {distanceInfo && (
              <div className="md:col-span-2 text-sm border p-3 rounded bg-muted">
                <p>
                  <strong>Original Distance:</strong>{" "}
                  {distanceInfo?.originalDistanceKm?.toFixed?.(2) ?? "N/A"} km
                </p>

                {formData.vehicleType && (() => {
                  const selectedVehicle = vehicleTypes.find(
                    (v) => String(v.id) === formData.vehicleType
                  );
                  if (!selectedVehicle || !distanceInfo) return null;
                  const rate = selectedVehicle.estimatedRatePerKm;
                  const base = selectedVehicle.baseFare;
                  const dist = distanceInfo.optimizedDistanceKm;
                  const persons = formData.numPersons || 1;
                  const seating = selectedVehicle.seatingCapacity || 4;
                  const vehicles = Math.ceil(persons / seating);
                  const costPerVehicle = rate * dist + base;
                  const totalCost = vehicles * costPerVehicle;
                  return (
                    <div className="md:col-span-2 text-sm border p-3 rounded bg-muted mt-2">
                      <p>Estimated Fare = {vehicles} × (₹{rate} × {dist.toFixed(2)} km + ₹{base})</p>
                      <p className="font-bold">= ₹{totalCost.toFixed(2)}</p>
                    </div>
                  );
                })()}

                <p className="mt-2">
                  <strong>Optimized Distance:</strong>{" "}
                  {distanceInfo?.optimizedDistanceKm?.toFixed?.(2) ?? "N/A"} km
                </p>
                {optimizedRoute.length > 0 && (
                  <p className="pt-1">
                    <strong>Optimized Route:</strong>{" "}
                    {optimizedRoute
                      .map(
                        (id) =>
                          cities.find((c) => String(c.id) === String(id))?.name ||
                          `City#${id}`
                      )
                      .join(" → ")}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* -------- STEP 3: Customer & Notes -------- */}
        {step === 3 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                onBlur={handlePhoneBlur}
                disabled={isEditMode}
                className={isEditMode ? "bg-gray-100 cursor-not-allowed" : ""}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isEditMode}
                className={isEditMode ? "bg-gray-100 cursor-not-allowed" : ""}
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Notes</Label>
              <Textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* Footer buttons */}
        <DialogFooter className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {step > 1 && (
            <Button type="button" variant="secondary" onClick={goPrev}>
              Back
            </Button>
          )}
          {step < 3 ? (
            <Button type="button" onClick={goNext}>
              Save & Continue
            </Button>
          ) : (
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : booking ? "Update Booking" : "Create Booking"}
            </Button>
          )}
        </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookingForm;
