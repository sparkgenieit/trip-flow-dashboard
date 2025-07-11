
export const canEditVehicle = (role: string) => ['ADMIN', 'VENDOR'].includes(role);
export const canViewTrips = (role: string) => ['ADMIN', 'VENDOR', 'DRIVER'].includes(role);
export const canAddDriver = (role: string) => role === 'VENDOR';
