'use client';
import { useParams } from 'react-router-dom';
import VendorVehicleTabsRoot from '../VendorVehicleTabsRoot';
export default function EditVendorTabsPage(){
  const {vendorId}=useParams<{vendorId:string}>();
  if(!vendorId) return <div>No vendorId</div>;
  return <VendorVehicleTabsRoot mode="edit" vendorId={vendorId}/>;
}
