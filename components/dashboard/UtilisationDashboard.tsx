'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCostCenters } from '@/lib/context/CostCenterContext';
import { CostCenterSkeleton } from './CostCenterSkeleton';
import { MacSteelCostCenter } from '@/lib/actions/costCenters';
import { LiveVehicleDetails } from './LiveVehicleDetails';

export function UtilisationDashboard() {
  const { costCenters, isLoading, error } = useCostCenters();
  const [selectedCostCenter, setSelectedCostCenter] = useState<MacSteelCostCenter | null>(null);

  const handleViewCostCenter = (costCenter: MacSteelCostCenter) => {
    setSelectedCostCenter(costCenter);
  };

  const handleBackToTable = () => {
    setSelectedCostCenter(null);
  };

  if (isLoading) {
    return <CostCenterSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-gray-900 text-xl">Utilisation Dashboard</h2>
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

  if (selectedCostCenter) {
    return (
      <LiveVehicleDetails
        costCenter={selectedCostCenter}
        onBack={handleBackToTable}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-gray-900 text-xl">Utilisation Dashboard</h2>
        <div className="text-gray-600 text-sm">
          Select a cost center to view live vehicle data
        </div>
      </div>

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