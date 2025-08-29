'use client';

import { useState, useEffect, useRef } from 'react';
import { Clock, Car, TrendingUp, TrendingDown, MoreHorizontal, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCostCenters } from '@/lib/context/CostCenterContext';
import { Vehicle, updateVehicleReason } from '@/lib/actions/vehicles';
import { MacSteelCostCenter } from '@/lib/actions/costCenters';

interface VehicleDetailsTableProps {
  costCenter: MacSteelCostCenter;
  onBack: () => void;
}

const REASON_OPTIONS = [
  'Workshop',
  'Quality',
  'Warehouse',
  'Sales',
  'No loads',
  'No Driver',
  'Long Distance',
  'Shunter',
  'In yard repair',
  'Tyres',
  'Toolbox Talk',
  'In Que',
  'Security Check',
  'Tarpaulin/Strapping',
  'Other'
];

export function VehicleDetailsTable({ costCenter, onBack }: VehicleDetailsTableProps) {
  const { getVehiclesForCostCenter, isVehicleLoading } = useCostCenters();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const hasInitialized = useRef(false);
  const [isReasonDialogOpen, setIsReasonDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [isUpdatingReason, setIsUpdatingReason] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Fetch data on initial page load - only run once when component mounts
  useEffect(() => {
    if (hasInitialized.current) return;
    
    hasInitialized.current = true;
    
    const initialFetch = async () => {
      if (!costCenter.new_account_number) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const vehicleData = await getVehiclesForCostCenter(costCenter.new_account_number);
        setVehicles(vehicleData);
        setLastUpdate(new Date());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch vehicles');
      } finally {
        setIsLoading(false);
      }
    };

    initialFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - will only run once

  const fetchVehicles = async () => {
    if (!costCenter.new_account_number) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const vehicleData = await getVehiclesForCostCenter(costCenter.new_account_number);
      setVehicles(vehicleData);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch vehicles');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateReason = async () => {
    if (!selectedVehicle || !selectedReason) return;

    setIsUpdatingReason(true);
    setUpdateError(null);

    try {
      console.log('Updating reason for vehicle:', selectedVehicle.plate, 'to:', selectedReason);
      
      // Update the database first
      await updateVehicleReason(selectedVehicle.plate!, selectedReason);
      
      // If database update succeeds, update local state
      setVehicles(prevVehicles => {
        const updatedVehicles = prevVehicles.map(vehicle => 
          vehicle.plate === selectedVehicle.plate 
            ? { ...vehicle, reason: selectedReason }
            : vehicle
        );
        console.log('Updated vehicles:', updatedVehicles);
        return updatedVehicles;
      });

      // Close dialog and reset state
      setIsReasonDialogOpen(false);
      setSelectedVehicle(null);
      setSelectedReason('');
    } catch (err) {
      console.error('Error updating vehicle reason:', err);
      setUpdateError(err instanceof Error ? err.message : 'Failed to update vehicle reason');
    } finally {
      setIsUpdatingReason(false);
    }
  };

  const openReasonDialog = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setSelectedReason(vehicle.reason || '');
    setUpdateError(null);
    setIsReasonDialogOpen(true);
  };

  // Calculate stats from vehicle data
  const totalVehicles = vehicles.length;
  const departingBeforeExitTime = vehicles.filter(vehicle => {
    if (!vehicle.start_time) return false;
    const startTime = new Date(vehicle.start_time);
    const exitTime = costCenter.exit_time ? new Date(`2000-01-01T${costCenter.exit_time}`) : new Date('2000-01-01T09:00:00');
    return startTime < exitTime;
  }).length;
  
  const onTimePercentage = totalVehicles > 0 ? Math.round(((totalVehicles - departingBeforeExitTime) / totalVehicles) * 100) : 0;
  const notOnTimePercentage = 100 - onTimePercentage;

  // Helper function to determine if vehicle is late
  const isVehicleLate = (vehicle: Vehicle): boolean => {
    if (!vehicle.start_time) return false;
    const startTime = new Date(vehicle.start_time);
    const exitTime = costCenter.exit_time ? new Date(`2000-01-01T${costCenter.exit_time}`) : new Date('2000-01-01T09:00:00');
    return startTime >= exitTime;
  };

  // Show loading state
  if (isLoading || isVehicleLoading[costCenter.new_account_number || '']) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-semibold text-gray-900 text-xl">
              {costCenter.company || 'Unknown Company'}
            </h2>
            <p className="text-gray-600 text-sm">
              Geozone: {costCenter.geozone}
            </p>
          </div>
          <Button onClick={onBack} variant="outline">
            Back to Cost Centers
          </Button>
        </div>
        
        {/* Stats Cards Skeleton */}
        <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="bg-white border border-gray-200">
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                  <Skeleton className="w-4 h-4" />
                  <Skeleton className="w-32 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="w-16 h-8" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Table Skeleton */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 p-4 border-gray-200 border-b">
            <Skeleton className="w-32 h-6" />
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <Skeleton className="w-16 h-4" />
                  <Skeleton className="w-24 h-4" />
                  <Skeleton className="w-24 h-4" />
                  <Skeleton className="w-24 h-4" />
                  <Skeleton className="w-24 h-4" />
                  <Skeleton className="w-20 h-8" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-gray-900 text-xl">Vehicle Details</h2>
          <Button onClick={onBack} variant="outline">
            Back to Cost Centers
          </Button>
        </div>
        <div className="bg-red-50 p-6 border border-red-200 rounded-lg text-center">
          <p className="text-red-600">Error loading vehicles: {error}</p>
          <Button 
            onClick={fetchVehicles} 
            className="mt-4"
            variant="outline"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-semibold text-gray-900 text-xl">
            {costCenter.company || 'Unknown Company'}
          </h2>
          <p className="text-gray-600 text-sm">
            Geozone: {costCenter.geozone}
          </p>
          {lastUpdate && (
            <p className="mt-1 text-gray-500 text-xs">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            onClick={fetchVehicles} 
            size="sm" 
            variant="outline"
            className="flex items-center space-x-2"
          >
            <RefreshCw className="mr-2 w-4 h-4" />
            Refresh
          </Button>
          <Button onClick={onBack} variant="outline">
            Back to Cost Centers
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white border border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center font-medium text-gray-600 text-sm">
              <Car className="mr-2 w-4 h-4" />
              Number of Vehicles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-gray-900 text-2xl">{totalVehicles}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center font-medium text-gray-600 text-sm">
              <Clock className="mr-2 w-4 h-4" />
              Departing Before {costCenter.exit_time || '9:00 AM'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-gray-900 text-2xl">{departingBeforeExitTime}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center font-medium text-gray-600 text-sm">
              <TrendingUp className="mr-2 w-4 h-4 text-green-600" />
              On Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="font-bold text-green-600 text-2xl">{onTimePercentage}%</div>
              <div className="relative border-4 border-gray-200 rounded-full w-12 h-12">
                <div 
                  className="border-4 border-green-500 rounded-full w-12 h-12"
                  style={{
                    background: `conic-gradient(#10b981 ${onTimePercentage * 3.6}deg, transparent 0deg)`
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center font-medium text-gray-600 text-sm">
              <TrendingDown className="mr-2 w-4 h-4 text-red-600" />
              Not on Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="font-bold text-red-600 text-2xl">{notOnTimePercentage}%</div>
              <div className="relative border-4 border-red-500 rounded-full w-12 h-12">
                <div 
                  className="border-4 border-red-500 rounded-full w-12 h-12"
                  style={{
                    background: `conic-gradient(#ef4444 ${notOnTimePercentage * 3.6}deg, transparent 0deg)`
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Vehicle Details Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 p-4 border-gray-200 border-b">
          <h3 className="font-semibold text-gray-900 text-lg">Vehicle Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                  Vehicle Registration
                </th>
                <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                  Cost Centre
                </th>
                <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                  Start Time
                </th>
                <th className="px-6 py-3 w-24 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vehicles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-gray-500 text-center">
                    No vehicles found for this cost center.
                  </td>
                </tr>
              ) : (
                vehicles.map((vehicle) => {
                  const isLate = isVehicleLate(vehicle);
                  return (
                    <tr key={vehicle.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isLate ? (
                          <div className="flex items-center space-x-2">
                            <div className="bg-red-500 rounded-full w-3 h-3" />
                            <span className="font-medium text-red-600 text-xs">Late</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <div className="bg-green-500 rounded-full w-3 h-3" />
                            <span className="font-medium text-green-600 text-xs">On Time</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 text-sm whitespace-nowrap">
                        {vehicle.plate || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm whitespace-nowrap">
                        {vehicle.company || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm whitespace-nowrap">
                        {vehicle.start_time ? new Date(vehicle.start_time).toLocaleTimeString() : 'Unknown'}
                      </td>
                      <td className="px-6 py-4 w-24 text-gray-500 text-sm whitespace-nowrap">
                        {vehicle.reason || '-'}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm whitespace-nowrap">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-600"
                          onClick={() => openReasonDialog(vehicle)}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reason Update Dialog */}
      <Dialog open={isReasonDialogOpen} onOpenChange={setIsReasonDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <div className="flex justify-center items-center bg-blue-100 rounded-full w-6 h-6 font-medium text-blue-600 text-sm">
                1
              </div>
              <span>Add Log Message</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block mb-2 font-medium text-gray-700 text-sm">
                Select Message *
              </label>
              <Select value={selectedReason} onValueChange={setSelectedReason}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {REASON_OPTIONS.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!selectedReason && (
                <p className="mt-1 text-red-500 text-sm">This field is required</p>
              )}
            </div>
            
            {/* Error message for update failures */}
            {updateError && (
              <div className="bg-red-50 p-3 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{updateError}</p>
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsReasonDialogOpen(false);
                  setSelectedVehicle(null);
                  setSelectedReason('');
                  setUpdateError(null);
                }}
                disabled={isUpdatingReason}
              >
                Close
              </Button>
              <Button
                onClick={handleUpdateReason}
                disabled={!selectedReason || isUpdatingReason}
                className="bg-gray-500 hover:bg-gray-600 text-white"
              >
                {isUpdatingReason ? 'Updating...' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
