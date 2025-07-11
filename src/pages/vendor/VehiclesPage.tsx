
import VehicleForm from "@/components/features/vehicles/VehicleForm";

const VendorVehiclesPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Vendor - Vehicles</h1>
      <VehicleForm mode="vendor" />
    </div>
  );
};

export default VendorVehiclesPage;
