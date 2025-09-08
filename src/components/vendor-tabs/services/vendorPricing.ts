// src/services/vendorPricing.ts
export type DriverCostDTO = {
  id?: number;
  vendorId: number | string;
  vehicleTypeId: number;
  vehicleTypeName?: string;
  driverBhatta?: number;
  foodCost?: number;
  accomodationCost?: number;
  extraCost?: number;
  morningChargesPerHour?: number;
  eveningChargesPerHour?: number;
};

// GET /vendors/:vendorId/driver-costs
export async function fetchDriverCostsByVendor(vendorId: number | string): Promise<DriverCostDTO[]> {
  const token = localStorage.getItem('token') || '';
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/vendors/${vendorId}/driver-costs`, {
    headers: { Authorization: token ? `Bearer ${token}` : '' },
  });
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

// POST /vendors/:vendorId/driver-costs
export async function createDriverCost(payload: DriverCostDTO): Promise<DriverCostDTO> {
  const token = localStorage.getItem('token') || '';
  const res = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/vendors/${payload.vendorId}/driver-costs`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) throw new Error('Create failed');
  return res.json();
}
