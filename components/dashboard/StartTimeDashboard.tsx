'use client';

import { useState } from 'react';
import { Eye, FileText, Clock } from 'lucide-react';
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

export function StartTimeDashboard() {
  const { costCenters, isLoading, error } = useCostCenters();
  const [selectedCostCenter, setSelectedCostCenter] = useState<MacSteelCostCenter | null>(null);
  const [viewMode, setViewMode] = useState<'vehicles' | 'reports'>('vehicles');
  const [isExitTimeDialogOpen, setIsExitTimeDialogOpen] = useState(false);
  const [newExitTime, setNewExitTime] = useState('');
  const [isUpdatingExitTime, setIsUpdatingExitTime] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

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
      
      // Update local state to reflect the change
      setSelectedCostCenter(prev => prev ? {
        ...prev,
        exit_time: newExitTime
      } : null);
      
      setIsExitTimeDialogOpen(false);
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : 'Failed to update exit time');
    } finally {
      setIsUpdatingExitTime(false);
    }
  };

  // Show loading skeleton while fetching data
  if (isLoading) {
    return <CostCenterSkeleton />;
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-gray-900 text-xl">Start Time Dashboard</h2>
        </div>
        <div className="bg-red-50 p-6 border border-red-200 rounded-lg text-center">
          <p className="text-red-600">Error loading cost centers: {error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
            variant="outline"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Show cost center details when selected
  if (selectedCostCenter) {
    return (
      <div className="space-y-6">
        {/* View Mode Toggle */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-semibold text-gray-900 text-xl">
              {selectedCostCenter.company || 'Unknown Company'}
            </h2>
            <p className="text-gray-600 text-sm">
              Geozone: {selectedCostCenter.geozone}
            </p>
            {selectedCostCenter.exit_time && (
              <p className="text-gray-600 text-sm">
                Exit Time: {selectedCostCenter.exit_time}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={openExitTimeDialog}
              size="sm"
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Clock className="w-4 h-4" />
              <span>Update Exit Time</span>
            </Button>
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <Button
                variant={viewMode === 'vehicles' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('vehicles')}
                className="flex items-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>Vehicle Details</span>
              </Button>
              <Button
                variant={viewMode === 'reports' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('reports')}
                className="flex items-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>Late Reports</span>
              </Button>
            </div>
            <Button onClick={handleBackToTable} variant="outline">
              Back to Cost Centers
            </Button>
          </div>
        </div>

        {/* Render appropriate component based on view mode */}
        {viewMode === 'vehicles' ? (
          <VehicleDetailsTable 
            costCenter={selectedCostCenter} 
            onBack={handleBackToTable} 
          />
        ) : (
          <LateVehicleReports 
            costCenter={selectedCostCenter} 
            onBack={handleBackToTable} 
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
                <Label htmlFor="exit-time" className="block mb-2 font-medium text-gray-700 text-sm">
                  New Exit Time *
                </Label>
                <Input
                  id="exit-time"
                  type="time"
                  value={newExitTime}
                  onChange={(e) => setNewExitTime(e.target.value)}
                  className="w-full"
                  required
                />
                <p className="mt-1 text-gray-500 text-xs">
                  Current exit time: {selectedCostCenter?.exit_time || '09:00:00'}
                </p>
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
                    setIsExitTimeDialogOpen(false);
                    setNewExitTime('');
                    setUpdateError(null);
                  }}
                  disabled={isUpdatingExitTime}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateExitTime}
                  disabled={!newExitTime || isUpdatingExitTime}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
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

  // Show cost centers table (initial view)
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-gray-900 text-xl">Start Time Dashboard</h2>
        <div className="text-gray-600 text-sm">
          Select a cost center to view details
        </div>
      </div>
      
      {/* Cost Centers Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 p-4 border-gray-200 border-b">
          <h3 className="font-semibold text-gray-900 text-lg">Cost Centers</h3>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            {costCenters.map((costCenter) => (
              <div key={costCenter.id} className="flex justify-between items-center hover:bg-gray-50 p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {costCenter.company || 'Unknown Company'}
                  </div>
                  <div className="text-gray-600 text-sm">
                    Geozone: {costCenter.geozone}
                  </div>
                  {costCenter.exit_time && (
                    <div className="text-gray-600 text-sm">
                      Exit Time: {costCenter.exit_time}
                    </div>
                  )}
                </div>
                <Button 
                  onClick={() => handleViewCostCenter(costCenter)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Eye className="mr-2 w-4 h-4" />
                  View Details
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}