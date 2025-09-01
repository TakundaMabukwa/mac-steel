'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCostCenters } from '@/lib/context/CostCenterContext';
import { CostCenterSkeleton } from './CostCenterSkeleton';
import { MacSteelCostCenter } from '@/lib/actions/costCenters';
import { LiveVehicleDetails } from './LiveVehicleDetails';
import { CompactTable } from '@/components/shared/CompactTable';

export function UtilisationDashboard() {
  const { costCenters, isLoading, error, selectedCostCenter, setSelectedCostCenter } = useCostCenters();

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

      {/* Cost Centers Table using CompactTable */}
      <CompactTable
        data={costCenters}
        columns={[
          {
            key: 'company',
            label: 'Company',
            align: 'left' as const,
            render: (item: MacSteelCostCenter) => item.company || 'Unknown Company'
          },
          {
            key: 'geozone',
            label: 'Geozone',
            align: 'left' as const,
            render: (item: MacSteelCostCenter) => item.geozone
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