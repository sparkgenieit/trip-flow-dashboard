'use client';
import VendorVehicleTabsRoot from '@/components/vendor-tabs/VendorVehicleTabsRoot';
export default function AddVendorTabsPage(){
  

  return (
      <div className="p-4 md:p-6">
        {/* EDIT MODE: unlocks all tabs, button shows “Update & Continue” */}
        <VendorVehicleTabsRoot mode="add"/>
      </div>
    );
}
