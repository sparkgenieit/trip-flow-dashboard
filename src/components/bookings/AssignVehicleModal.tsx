import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getAvailableVehicles, assignVehicleToBooking } from '@/services/vehicles';
import { getAvailableDrivers, assignDriverToVehicle } from '@/services/drivers';

import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

interface Driver {
  id: number;
  fullName: string;
  phone: string;
}

interface Vehicle {
  id: number;
  name: string;
  model: string;
  registrationNumber: string;
  driver: Driver[];
}

interface Props {
  bookingId: number;
  vehicleTypeId: number;
  numVehicles: number;
  open: boolean;
  onClose: () => void;
  onAssigned: () => void;
}

const AssignVehicleModal: React.FC<Props> = ({
  bookingId,
  vehicleTypeId,
  numVehicles,
  open,
  onClose,
  onAssigned,
}) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicles, setSelectedVehicles] = useState<{ [tripIndex: number]: number | null }>({});
  const [searchTerms, setSearchTerms] = useState<{ [tripIndex: number]: string }>({});
  const [assigningDriverVehicleId, setAssigningDriverVehicleId] = useState<number | null>(null);
  const [availableDrivers, setAvailableDrivers] = useState<{ [vehicleId: number]: Driver[] }>({});
  const [vehicleSelectionLocked, setVehicleSelectionLocked] = useState<{ [tripIndex: number]: boolean }>({});
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      getAvailableVehicles(vehicleTypeId).then(setVehicles);
      const initialSelected: { [tripIndex: number]: number | null } = {};
      const initialSearch: { [tripIndex: number]: string } = {};
      const initialLocked: { [tripIndex: number]: boolean } = {};
      for (let i = 0; i < numVehicles; i++) {
        initialSelected[i] = null;
        initialSearch[i] = '';
        initialLocked[i] = false;
      }
      setSelectedVehicles(initialSelected);
      setSearchTerms(initialSearch);
      setAssigningDriverVehicleId(null);
      setAvailableDrivers({});
      setVehicleSelectionLocked(initialLocked);
    }
  }, [open, vehicleTypeId, numVehicles]);

  const handleAssignDriverClick = async (vehicleId: number) => {
    setAssigningDriverVehicleId(vehicleId);
    if (!availableDrivers[vehicleId]) {
      const drivers = await getAvailableDrivers(vehicleId);
      setAvailableDrivers((prev) => ({ ...prev, [vehicleId]: drivers }));
    }
  };

  const handleDriverSelect = async (vehicleId: number, driverId: string) => {
    try {
      await assignDriverToVehicle(vehicleId, Number(driverId));
      toast({ title: 'Driver assigned successfully' });
      const refreshed = await getAvailableVehicles(vehicleTypeId);
      setVehicles(refreshed);
      setAssigningDriverVehicleId(null);
    } catch {
      toast({ title: 'Failed to assign driver', variant: 'destructive' });
    }
  };

  const handleAssign = async () => {
    const selected = Object.values(selectedVehicles).filter((v) => v !== null) as number[];
    if (selected.length !== numVehicles) {
      toast({
        title: `Please select ${numVehicles} vehicle(s).`,
        variant: 'destructive',
      });
      return;
    }
    try {
      await assignVehicleToBooking(bookingId, selected);
      toast({ title: 'Vehicle(s) assigned successfully!' });
      onAssigned();
      onClose();
    } catch {
      toast({ title: 'Failed to assign vehicles', variant: 'destructive' });
    }
  };

  const getAvailableForTrip = (tripIndex: number) => {
    const alreadySelected = Object.entries(selectedVehicles)
      .filter(([key, val]) => parseInt(key) !== tripIndex && val !== null)
      .map(([_, val]) => val) as number[];
    const term = searchTerms[tripIndex]?.toLowerCase() || '';
    return vehicles.filter(
      (v) =>
        !alreadySelected.includes(v.id) &&
        `${v.registrationNumber} ${v.name} ${v.model}`.toLowerCase().includes(term)
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Vehicles</DialogTitle>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-4">
          {Array.from({ length: numVehicles }).map((_, index) => {
            const selectedVehicleId = selectedVehicles[index];
            const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);
            const available = getAvailableForTrip(index);

            return (
              <div key={index} className="space-y-2 border rounded p-3">
                <div className="font-semibold">Trip {index + 1}</div>

                {selectedVehicleId && vehicleSelectionLocked[index] ? (
                  <div className="border p-2 rounded bg-green-50">
                    <div className="font-medium">
                      🚗 {selectedVehicle?.registrationNumber} – {selectedVehicle?.name} – {selectedVehicle?.model}
                    </div>

                    {selectedVehicle?.driver && selectedVehicle.driver.length > 0 ? (
                      <div className="text-xs text-green-700 mt-1">
                        👤 Driver: {selectedVehicle.driver[0].fullName} ({selectedVehicle.driver[0].phone})
                        <Button
                          size="sm"
                          variant="ghost"
                          className="ml-2 text-blue-600"
                          onClick={() => {
                            setAssigningDriverVehicleId(selectedVehicleId);
                            if (!availableDrivers[selectedVehicleId]) {
                              getAvailableDrivers(selectedVehicleId).then(drivers =>
                                setAvailableDrivers(prev => ({ ...prev, [selectedVehicleId]: drivers }))
                              );
                            }
                          }}
                        >
                          Reassign Driver
                        </Button>

                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2"
                        onClick={() => handleAssignDriverClick(selectedVehicleId)}
                      >
                        Assign Driver
                      </Button>
                    )}

                    {assigningDriverVehicleId === selectedVehicleId && availableDrivers[selectedVehicleId] && (
                      <div className="mt-2">
                        <Select onValueChange={(val) => handleDriverSelect(selectedVehicleId, val)}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a driver" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableDrivers[selectedVehicleId].map((d) => (
                              <SelectItem key={d.id} value={d.id.toString()}>
                                {d.fullName} ({d.phone})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      className="mt-2 text-red-500"
                      onClick={() => {
                        setVehicleSelectionLocked((prev) => ({ ...prev, [index]: false }));
                        setSelectedVehicles((prev) => ({ ...prev, [index]: null }));
                      }}
                    >
                      Reassign Vehicle
                    </Button>
                  </div>
                ) : (
                  <>
                    <Input
                      placeholder="Search vehicle by number, name, or model"
                      value={searchTerms[index] || ''}
                      onChange={(e) => setSearchTerms((prev) => ({ ...prev, [index]: e.target.value }))}
                    />

                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {available.length === 0 ? (
                        <p className="text-sm text-gray-500">No vehicles available</p>
                      ) : (
                        available.map((v) => (
                          <div
                            key={`${index}-${v.id}`}
                            className={`flex flex-col gap-1 p-2 rounded border ${selectedVehicleId === v.id
                                ? 'border-primary bg-primary/10'
                                : 'hover:bg-gray-100 cursor-pointer'
                              }`}
                            onClick={() => {
                              setSelectedVehicles((prev) => ({ ...prev, [index]: v.id }));
                              setVehicleSelectionLocked((prev) => ({ ...prev, [index]: true }));
                            }}
                          >
                            <div className="flex justify-between items-start">
                              <div className="text-sm">
                                <div className="font-medium">
                                  🚗 {v.registrationNumber} – {v.name} – {v.model}
                                </div>
                                {v.driver && v.driver.length > 0 ? (
                                  <div className="text-xs text-green-700">
                                    👤 {v.driver[0].fullName} ({v.driver[0].phone})
                                  </div>
                                ) : (
                                  <div className="text-xs text-yellow-700 italic">
                                    No driver assigned
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleAssign}>
              Assign
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignVehicleModal;
