'use client';

import { useState, useEffect, useRef } from 'react';
import { Clock, Car, TrendingUp, TrendingDown, MoreHorizontal, Wifi, WifiOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCostCenters } from '@/lib/context/CostCenterContext';
import { Vehicle, updateVehicleReason, getAllVehiclesWithStartTime } from '@/lib/actions/vehicles';
import { MacSteelCostCenter } from '@/lib/actions/costCenters';
import { CompactTable } from '@/components/shared/CompactTable';
import { createClient } from '@/lib/supabase/client';

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
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [updatedVehicleIds, setUpdatedVehicleIds] = useState<Set<string>>(new Set());
  const supabase = createClient();

  // Set up real-time subscription and initial data fetch
  useEffect(() => {
    if (hasInitialized.current) return;
    
    hasInitialized.current = true;
    
    const setupRealTimeData = async () => {
      if (!costCenter.new_account_number) return;
      
      setIsLoading(true);
      setError(null);
      setConnectionStatus('connecting');
      
      try {
        // Initial data fetch - load all vehicles
        const vehicleData = await getAllVehiclesWithStartTime(costCenter.new_account_number);
        console.log('Fetched vehicles:', vehicleData);
        console.log('Vehicle statuses:', vehicleData.map(v => ({ plate: v.plate, status: v.status })));
        setVehicles(vehicleData);
        setLastUpdate(new Date());
        
        // Set up real-time subscription
        const channel = supabase
          .channel('vehicle_data_changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'late_vehicles',
              filter: `new_account_number=eq.${costCenter.new_account_number}`
            },
            (payload) => {
              console.log('Real-time update received:', payload);
              
              if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                const newVehicle = payload.new as Vehicle;
                setVehicles(prevVehicles => {
                  // Remove existing vehicle with same ID and add updated one
                  const filtered = prevVehicles.filter(v => v.id !== newVehicle.id);
                  return [...filtered, newVehicle];
                });
                
                // Add visual update indicator
                setUpdatedVehicleIds(prev => new Set([...prev, newVehicle.id]));
                setTimeout(() => {
                  setUpdatedVehicleIds(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(newVehicle.id);
                    return newSet;
                  });
                }, 2000); // Remove highlight after 2 seconds
                
                setLastUpdate(new Date());
              } else if (payload.eventType === 'DELETE') {
                const deletedVehicle = payload.old as Vehicle;
                setVehicles(prevVehicles => 
                  prevVehicles.filter(v => v.id !== deletedVehicle.id)
                );
                setLastUpdate(new Date());
              }
            }
          )
          .subscribe((status) => {
            console.log('Subscription status:', status);
            if (status === 'SUBSCRIBED') {
              setIsConnected(true);
              setConnectionStatus('connected');
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
              setIsConnected(false);
              setConnectionStatus('disconnected');
            }
          });
        
        // Store channel reference for cleanup
        return () => {
          supabase.removeChannel(channel);
        };
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch vehicles');
        setConnectionStatus('disconnected');
      } finally {
        setIsLoading(false);
      }
    };

    const cleanup = setupRealTimeData();
    
    // Cleanup function
    return () => {
      if (cleanup) {
        cleanup.then(cleanupFn => cleanupFn && cleanupFn());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - will only run once



  const handleReasonUpdate = async () => {
    if (!selectedVehicle || !selectedReason) return;

    setIsUpdatingReason(true);
    setUpdateError(null);

    try {
      await updateVehicleReason(selectedVehicle.id, selectedReason);
      
      // Update local state
      setVehicles(prev => prev.map(v => 
        v.id === selectedVehicle.id 
          ? { ...v, reason: selectedReason }
          : v
      ));
      
      setIsReasonDialogOpen(false);
      setSelectedVehicle(null);
      setSelectedReason('');
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : 'Failed to update vehicle reason');
    } finally {
      setIsUpdatingReason(false);
    }
  };

  const isVehicleLate = (vehicle: Vehicle) => {
    if (!vehicle.start_time || !costCenter.exit_time) return false;
    
    const startTime = new Date(`2000-01-01T${vehicle.start_time}`);
    const exitTime = new Date(`2000-01-01T${costCenter.exit_time}`);
    
    return startTime > exitTime;
  };

  const filteredVehicles = vehicles; // Show all vehicles by default

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex sm:flex-row flex-col justify-between items-start sm:items-center gap-4">
          <Button onClick={onBack} variant="outline" className="hover:bg-blue-50 border-blue-800 text-blue-800">
            ← Back to Cost Centers
          </Button>
          <div className="flex items-center space-x-2">
            <span className="text-gray-600 text-sm">Loading vehicles...</span>
          </div>
        </div>
        
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="w-48 h-4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="w-full h-4" />
                  <Skeleton className="w-3/4 h-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Button onClick={onBack} variant="outline" className="hover:bg-blue-50 border-blue-800 text-blue-800">
            ← Back to Cost Centers
          </Button>
        </div>
        
        <div className="bg-red-50 p-6 border border-red-200 rounded-lg text-center">
          <p className="text-red-600">Error loading vehicles: {error}</p>
          <p className="mt-2 text-gray-600 text-sm">Please check your connection and try refreshing the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex sm:flex-row flex-col justify-between items-start sm:items-center gap-4">
        <Button onClick={onBack} variant="outline" className="hover:bg-blue-50 border-blue-800 text-blue-800">
          ← Back to Cost Centers
        </Button>
        
        <div className="flex sm:flex-row flex-col items-start sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
          {/* Real-time connection status */}
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <Wifi className="w-4 h-4 text-green-600" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-600" />
            )}
            <span className={`text-sm font-medium ${
              isConnected ? 'text-green-600' : 'text-red-600'
            }`}>
              {connectionStatus === 'connecting' ? 'Connecting...' : 
               connectionStatus === 'connected' ? 'Live Updates' : 'Offline'}
            </span>
          </div>
          
          <div className="text-gray-600 text-sm">
            {lastUpdate && `Last updated: ${lastUpdate.toLocaleTimeString()}`}
          </div>
        </div>
      </div>
      
      {/* Check if there are vehicles */}
      {vehicles.length === 0 ? (
        <div className="py-12 text-center">
          <div className="bg-gray-50 p-8 border border-gray-200 rounded-lg">
            <Car className="mx-auto mb-4 w-12 h-12 text-gray-400" />
            <h3 className="mb-2 font-medium text-gray-900 text-lg">No Vehicles Found</h3>
            <p className="mb-4 text-gray-600">
              There are no vehicles available for cost center: <span className="font-medium">{costCenter.new_account_number}</span>
            </p>
            <p className="text-gray-500 text-sm">
              Data will update automatically when vehicles are added.
            </p>
      </div>
        </div>
      ) : (
        /* Vehicle Details Table using CompactTable */
        <CompactTable
          data={filteredVehicles}
          onActionClick={(item: Vehicle) => {
            setSelectedVehicle(item);
            setSelectedReason(item.reason || '');
            setIsReasonDialogOpen(true);
          }}
          actionIcon={<MoreHorizontal className="w-4 h-4" />}
          columns={[
            {
              key: 'status',
              label: 'Status',
              align: 'left' as const,
              width: 'w-20',
              render: (item: Vehicle) => (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  item.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : item.status === 'late' || item.status === 'not_on_time'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {item.status === 'not_on_time' ? 'Late' : item.status || 'Unknown'}
                </span>
              )
            },
            {
              key: 'plate',
              label: 'Vehicle',
              align: 'left' as const,
              sortable: true,
              width: 'w-24',
              render: (item: Vehicle) => (
                <span className="font-medium text-gray-900 text-sm">
                  {item.plate || 'N/A'}
                </span>
              )
            },
            {
              key: 'company',
              label: 'Company',
              align: 'left' as const,
              width: 'w-48',
              render: (item: Vehicle) => (
                <div className="max-w-xs">
                  <span className="block text-gray-700 text-sm truncate">
                    {item.company || 'N/A'}
                            </span>
                            </div>
                          )
            },
            {
              key: 'start_time',
              label: 'Start Time',
              align: 'left' as const,
              sortable: true,
              width: 'w-32',
              render: (item: Vehicle) => {
                const isLate = isVehicleLate(item);
                return (
                  <div className="space-y-1">
                    <span className={`text-sm ${isLate ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                      {item.start_time ? new Date(item.start_time).toLocaleTimeString() : 'N/A'}
                    </span>
                    {isLate && (
                      <span className="block text-red-500 text-xs">(Late)</span>
                    )}
                  </div>
                );
              }
            },
            {
              key: 'reason',
              label: 'Reason',
              align: 'left' as const,
              width: 'w-64',
              render: (item: Vehicle) => (
                <span className="text-gray-600 text-sm">
                  {item.reason || 'No reason'}
                </span>
              )
            }
          ]}
          title="Vehicle Details"
          searchPlaceholder="Search vehicles..."
          showDownload={true}
          showColumns={true}
        />
      )}

      {/* Reason Update Dialog */}
      <Dialog open={isReasonDialogOpen} onOpenChange={setIsReasonDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Car className="w-5 h-5 text-blue-800" />
              <span>Update Vehicle Reason</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block mb-2 font-medium text-gray-700 text-sm">
                Vehicle: {selectedVehicle?.plate}
              </label>
              <Select value={selectedReason} onValueChange={setSelectedReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {REASON_OPTIONS.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
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
                Cancel
              </Button>
              <Button
                onClick={handleReasonUpdate}
                disabled={!selectedReason || isUpdatingReason}
                className="bg-blue-800 hover:bg-blue-900 text-white"
              >
                {isUpdatingReason ? 'Updating...' : 'Update Reason'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
