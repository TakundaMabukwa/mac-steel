'use client';

import { useState } from 'react';
import { Eye, FileText, Clock, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCostCenters } from '@/lib/context/CostCenterContext';
import { CostCenterSkeleton } from './CostCenterSkeleton';
import { MacSteelCostCenter } from '@/lib/actions/costCenters';
import { updateCostCenterExitTime } from '@/lib/actions/costCenters';
import { VehicleDetailsTable } from './VehicleDetailsTable';
import { LateVehicleReports } from './LateVehicleReports';
import { CompactTable } from '@/components/shared/CompactTable';
import { StatCards } from './StatCards';
import { CostCenterHeader } from './CostCenterHeader';
import { Vehicle, getAllVehiclesWithStartTime } from '@/lib/actions/vehicles';
import { useEffect } from 'react';

export function StartTimeDashboard() {
  const { costCenters, isLoading, error } = useCostCenters();
  const [selectedCostCenter, setSelectedCostCenter] = useState<MacSteelCostCenter | null>(null);
  const [viewMode, setViewMode] = useState<'vehicles' | 'reports'>('vehicles');
  const [isExitTimeDialogOpen, setIsExitTimeDialogOpen] = useState(false);
  const [newExitTime, setNewExitTime] = useState('');
  const [isUpdatingExitTime, setIsUpdatingExitTime] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);

  const handleViewCostCenter = (costCenter: MacSteelCostCenter) => {
    setSelectedCostCenter(costCenter);
    setViewMode('vehicles'); // Default to vehicles view
  };

  const handleBackToTable = () => {
    setSelectedCostCenter(null);
    setViewMode('vehicles');
  };

  const openExitTimeDialog = () => {
    if (selectedCostCenter?.exit_time) {
      setNewExitTime(selectedCostCenter.exit_time);
    } else {
      setNewExitTime('09:00:00');
    }
    setUpdateError(null);
    setIsExitTimeDialogOpen(true);
  };

  const handleUpdateExitTime = async () => {
    if (!selectedCostCenter?.new_account_number || !newExitTime) return;

    setIsUpdatingExitTime(true);
    setUpdateError(null);

    try {
      await updateCostCenterExitTime(selectedCostCenter.new_account_number, newExitTime);
      
      // Update local state
      setSelectedCostCenter(prev => prev ? { ...prev, exit_time: newExitTime } : null);
      setIsExitTimeDialogOpen(false);
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : 'Failed to update exit time');
    } finally {
      setIsUpdatingExitTime(false);
    }
  };

  const toggleSidebar = () => {
    // This would be handled by the parent component
  };

  // Load vehicles when cost center is selected
  useEffect(() => {
    const loadVehicles = async () => {
      if (!selectedCostCenter?.new_account_number) {
        setVehicles([]);
        return;
      }

      try {
        setIsLoadingVehicles(true);
        const allVehicles = await getAllVehiclesWithStartTime();
        // Filter vehicles by cost center
        const costCenterVehicles = allVehicles.filter(
          vehicle => vehicle.account_number === selectedCostCenter.new_account_number
        );
        setVehicles(costCenterVehicles);
      } catch (err) {
        console.error('Failed to load vehicles:', err);
        setVehicles([]);
      } finally {
        setIsLoadingVehicles(false);
      }
    };

    loadVehicles();
  }, [selectedCostCenter]);

  // Calculate statistics for the cost center
  const calculateStatistics = () => {
    if (!vehicles.length || !selectedCostCenter) {
      return {
        totalVehicles: 0,
        departingBefore9AM: 0,
        onTimePercentage: 0,
        latePercentage: 0
      };
    }

    const totalVehicles = vehicles.length;
    
    // Calculate vehicles departing before 9:00 AM
    const departingBefore9AM = vehicles.filter(vehicle => {
      if (!vehicle.start_time) return false;
      const startTime = new Date(`2000-01-01T${vehicle.start_time}`);
      const nineAM = new Date(`2000-01-01T09:00:00`);
      return startTime < nineAM;
    }).length;

    // Calculate on-time vs late vehicles
    const onTimeVehicles = vehicles.filter(vehicle => {
      if (!vehicle.start_time || !selectedCostCenter.exit_time) return false;
      const startTime = new Date(`2000-01-01T${vehicle.start_time}`);
      const exitTime = new Date(`2000-01-01T${selectedCostCenter.exit_time}`);
      return startTime <= exitTime;
    }).length;

    const lateVehicles = totalVehicles - onTimeVehicles;
    const onTimePercentage = totalVehicles > 0 ? Math.round((onTimeVehicles / totalVehicles) * 100) : 0;
    const latePercentage = totalVehicles > 0 ? Math.round((lateVehicles / totalVehicles) * 100) : 0;

    return {
      totalVehicles,
      departingBefore9AM,
      onTimePercentage,
      latePercentage
    };
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Button onClick={toggleSidebar} variant="outline" className="hover:bg-gray-50 border-gray-300 text-gray-700">
            ← Back to Cost Centers
          </Button>
        </div>
        
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <CostCenterSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Button onClick={toggleSidebar} variant="outline" className="hover:bg-gray-50 border-gray-300 text-gray-700">
            ← Back to Cost Centers
          </Button>
        </div>
        
        <div className="bg-red-50 p-6 border border-red-200 rounded-lg text-center">
          <p className="text-red-600">Error loading cost centers: {error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4" variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Show cost center details when selected
  if (selectedCostCenter) {
    const stats = calculateStatistics();
    
    return (
      <div className="space-y-6">
        {/* Cost Center Header with Statistics */}
        <CostCenterHeader
          costCenter={selectedCostCenter}
          totalVehicles={stats.totalVehicles}
          departingBefore9AM={stats.departingBefore9AM}
          onTimePercentage={stats.onTimePercentage}
          latePercentage={stats.latePercentage}
        />

        {/* Action Buttons */}
        <div className="flex justify-end items-center space-x-4">
          <Button
            onClick={openExitTimeDialog}
            className="bg-blue-50 hover:bg-blue-100 border-blue-600 text-blue-600"
          >
            <Clock className="mr-2 w-4 h-4" />
            Update Exit Time
          </Button>
          
          <Button
            onClick={handleBackToTable}
            variant="outline"
            className="hover:bg-gray-50 border-gray-300 text-gray-700"
          >
            Back to Cost Centers
          </Button>
        </div>

        {/* View Mode Toggle Buttons */}
        <div className="flex space-x-2">
          <Button
            onClick={() => setViewMode('vehicles')}
            variant={viewMode === 'vehicles' ? 'default' : 'outline'}
            className={viewMode === 'vehicles' ? 'bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-600' : 'hover:bg-blue-50 border-gray-300 text-gray-700'}
          >
            <Car className="mr-2 w-4 h-4" />
            All Vehicles
          </Button>
          <Button
            onClick={() => setViewMode('reports')}
            variant={viewMode === 'reports' ? 'default' : 'outline'}
            className={viewMode === 'reports' ? 'bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-600' : 'hover:bg-blue-50 border-gray-300 text-gray-700'}
          >
            <FileText className="mr-2 w-4 h-4" />
            Late Vehicles
          </Button>
        </div>

        {/* Render appropriate component based on view mode */}
        {viewMode === 'vehicles' ? (
          <VehicleDetailsTable 
            costCenter={selectedCostCenter} 
            onBack={handleBackToTable}
            showLateVehiclesOnly={false}
          />
        ) : (
          <VehicleDetailsTable 
            costCenter={selectedCostCenter} 
            onBack={handleBackToTable}
            showLateVehiclesOnly={true}
          />
        )}

        {/* Exit Time Update Dialog */}
        <Dialog open={isExitTimeDialogOpen} onOpenChange={setIsExitTimeDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span>Update Exit Time</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="exitTime" className="block mb-2 font-medium text-gray-700 text-sm">
                  Exit Time
                </Label>
                <Input
                  id="exitTime"
                  type="time"
                  value={newExitTime}
                  onChange={(e) => setNewExitTime(e.target.value)}
                  className="w-full"
                />
              </div>
              
              {updateError && (
                <div className="bg-red-50 p-3 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{updateError}</p>
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setIsExitTimeDialogOpen(false)}
                  disabled={isUpdatingExitTime}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateExitTime}
                  disabled={!newExitTime || isUpdatingExitTime}
                  className="bg-blue-50 hover:bg-blue-100 border-blue-600 text-blue-600"
                >
                  {isUpdatingExitTime ? 'Updating...' : 'Update Exit Time'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Show cost centers table
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="mb-2 font-semibold text-slate-900 text-2xl">Fleet Management</h1>
          <p className="text-slate-600 text-base">Monitor vehicle performance and manage cost centers</p>
        </div>
      </div>

      {/* Stats Cards */}
      <StatCards
        totalVehicles={32}
        onTimeVehicles={28}
        lateVehicles={4}
        departingBefore9AM={12}
      />

      <CompactTable
        data={costCenters}
        columns={[
          {
            key: 'company',
            label: 'Company',
            align: 'left' as const,
            render: (item: MacSteelCostCenter) => (
              <div>
                <div className="font-medium text-gray-900 text-sm">
                  {item.company || 'Unknown Company'}
                </div>
                <div className="text-gray-500 text-xs">
                  {item.new_account_number}
                </div>
              </div>
            )
          },
          {
            key: 'geozone',
            label: 'Geozone',
            align: 'left' as const,
            render: (item: MacSteelCostCenter) => (
              <span className="text-gray-600 text-sm">
                {item.geozone || 'N/A'}
              </span>
            )
          },
          {
            key: 'exit_time',
            label: 'Exit Time',
            align: 'left' as const,
            render: (item: MacSteelCostCenter) => (
              <span className="text-gray-600 text-sm">
                {item.exit_time || 'Not set'}
              </span>
            )
          }
        ]}
        title="Cost Centers"
        searchPlaceholder="Search cost centers..."
        showDownload={true}
        showColumns={true}
        onViewCostCenter={handleViewCostCenter}
      />
    </div>
  );
}