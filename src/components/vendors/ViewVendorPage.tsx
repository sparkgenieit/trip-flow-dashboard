// ============================== REPLACE ENTIRE FILE ==============================
import * as React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import VendorVehicleTabsRoot from "@/components/vendor-tabs/VendorVehicleTabsRoot";

export default function ViewVendorPage() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Vendor Details</h1>
          <p className="text-sm text-muted-foreground">
            Read-only view. You can switch steps; fields & actions inside forms are disabled.
          </p>
        </div>

        <div className="flex gap-2">
          {vendorId && (
            <Button asChild variant="secondary">
              <Link to={`/vendors/${vendorId}/edit`}>Edit Vendor</Link>
            </Button>
          )}
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>
      </div>

      {/* NO pointer-events / NO capture guards / NO global disabling */}
      <div className="mt-4">
        {vendorId ? (
          <VendorVehicleTabsRoot mode="edit" vendorId={vendorId} readOnly />
        ) : (
          <div className="text-sm text-muted-foreground">Invalid vendor id.</div>
        )}
      </div>
    </div>
  );
}
