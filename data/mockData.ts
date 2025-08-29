import { CostCenter, DashboardStats, Vehicle } from '@/types/dashboard';

export const mockVehicles: Vehicle[] = [
  {
    id: '1',
    registration: 'BG47WZZN',
    driver: 'BG47WZZN',
    geoZone: 'NO GO OVERLAY - KZN',
    cpk: 0,
    odo: 33898,
    safetyInfo: 'Vehicle in motion',
    engineOn: false,
    speed: 19,
    status: 'active',
    costCenter: 'MACSTEEL COIL',
    startTime: 'Unknown'
  },
  {
    id: '2',
    registration: 'BG88LMGP',
    driver: 'MANDLA',
    geoZone: 'Main Depot',
    cpk: 0,
    odo: 438285,
    safetyInfo: 'GPS Jamming',
    engineOn: false,
    speed: 0,
    status: 'warning',
    costCenter: 'MACSTEEL COIL',
    startTime: 'Unknown'
  },
  {
    id: '3',
    registration: 'BS61WJGP',
    geoZone: 'Out of-VRN Stainless Car',
    cpk: 0,
    odo: 240809,
    safetyInfo: 'MACSTEEL - AFTER HOUR',
    engineOn: false,
    speed: 0,
    status: 'inactive',
    costCenter: 'MACSTEEL COIL',
    startTime: 'Unknown'
  },
  {
    id: '4',
    registration: 'BT18GRGP',
    geoZone: 'Central Yard',
    cpk: 0,
    odo: 284625,
    safetyInfo: 'MACSTEEL - AFTER HOUR',
    engineOn: false,
    speed: 0,
    status: 'active',
    costCenter: 'MACSTEEL COIL',
    startTime: 'Unknown'
  },
  {
    id: '5',
    registration: 'BG90GKZN',
    cpk: 0,
    odo: 156789,
    engineOn: false,
    speed: 0,
    status: 'inactive',
    costCenter: 'MACSTEEL COIL',
    startTime: 'Unknown'
  },
  {
    id: '6',
    registration: 'BG90JJZN',
    cpk: 0,
    odo: 298456,
    engineOn: false,
    speed: 0,
    status: 'active',
    costCenter: 'MACSTEEL COIL',
    startTime: 'Unknown'
  }
];

export const mockCostCenters: CostCenter[] = [
  {
    id: '1',
    name: 'MACSTEEL COIL',
    code: '001',
    vehicleCount: mockVehicles.length,
    vehicles: mockVehicles
  },
  {
    id: '2',
    name: 'MACSTEEL TUBE',
    code: '002',
    vehicleCount: 28,
    vehicles: mockVehicles.slice(0, 3)
  },
  {
    id: '3',
    name: 'MACSTEEL BAR',
    code: '003',
    vehicleCount: 15,
    vehicles: mockVehicles.slice(0, 2)
  }
];

export const mockDashboardStats: DashboardStats = {
  totalVehicles: 134,
  departingBefore9AM: 0,
  onTimePercentage: 0,
  notOnTimePercentage: 100
};