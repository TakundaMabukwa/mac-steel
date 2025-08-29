export interface Vehicle {
  id: string;
  registration: string;
  driver?: string;
  geoZone?: string;
  cpk: number;
  odo: number;
  safetyInfo?: string;
  engineOn: boolean;
  speed: number;
  status: 'active' | 'warning' | 'inactive';
  costCenter: string;
  startTime?: string;
}

export interface CostCenter {
  id: string;
  name: string;
  code: string;
  vehicleCount: number;
  vehicles: Vehicle[];
}

export interface DashboardStats {
  totalVehicles: number;
  departingBefore9AM: number;
  onTimePercentage: number;
  notOnTimePercentage: number;
}
