
import VehicleForm from "@/components/features/vehicles/VehicleForm";

const DriverVehiclesPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Driver - Vehicles</h1>
      <VehicleForm mode="driver" />
    </div>
  );
};

export default DriverVehiclesPage;
