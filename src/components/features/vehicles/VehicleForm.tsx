
import React from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

interface VehicleFormProps {
  mode: "admin" | "vendor" | "driver";
  defaultValues?: any;
  readOnly?: boolean;
}

const VehicleForm: React.FC<VehicleFormProps> = ({ mode, defaultValues = {}, readOnly = false }) => {
  const showVendorField = mode === "admin";
  const canEditPrice = mode !== "driver";

  return (
    <form className="space-y-4">
      <Input name="name" placeholder="Vehicle Name" defaultValue={defaultValues.name} readOnly={readOnly} />
      <Input name="model" placeholder="Model" defaultValue={defaultValues.model} readOnly={readOnly} />
      <Input name="registrationNumber" placeholder="Registration Number" defaultValue={defaultValues.registrationNumber} readOnly={readOnly} />

      {canEditPrice && (
        <Input type="number" name="price" placeholder="Price" defaultValue={defaultValues.price} readOnly={readOnly} />
      )}

      {showVendorField && (
        <Select name="vendorId" defaultValue={defaultValues.vendorId}>
          <option value="">Select Vendor</option>
          {/* TODO: Replace with dynamic vendor list */}
        </Select>
      )}

      {!readOnly && <button type="submit" className="btn btn-primary">Save</button>}
    </form>
  );
};

export default VehicleForm;
