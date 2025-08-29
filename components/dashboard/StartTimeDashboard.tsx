'use client';

import { useState } from 'react';
import { Eye, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCostCenters } from '@/lib/context/CostCenterContext';
import { CostCenterSkeleton } from './CostCenterSkeleton';
import { MacSteelCostCenter } from '@/lib/actions/costCenters';
import { VehicleDetailsTable } from './VehicleDetailsTable';
import { LateVehicleReports } from './LateVehicleReports';

export function StartTimeDashboard() {
  const { costCenters, isLoading, error } = useCostCenters();
  const [selectedCostCenter, setSelectedCostCenter] = useState<MacSteelCostCenter | null>(null);
  const [viewMode, setViewMode] = useState<'vehicles' | 'reports'>('vehicles');

  const handleViewCostCenter = (costCenter: MacSteelCostCenter) => {
    setSelectedCostCenter(costCenter);
    setViewMode('vehicles'); // Default to vehicles view
  };

  const handleBackToTable = () => {
    setSelectedCostCenter(null);
    setViewMode('vehicles');
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
          </div>
          <div className="flex items-center space-x-3">
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