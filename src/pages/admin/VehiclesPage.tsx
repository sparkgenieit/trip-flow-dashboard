
import VehicleForm from "@/components/features/vehicles/VehicleForm";

const AdminVehiclesPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin - Vehicles</h1>
      <VehicleForm mode="admin" />
    </div>
  );
};

export default AdminVehiclesPage;
