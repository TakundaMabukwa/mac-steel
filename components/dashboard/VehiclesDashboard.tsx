'use client';

import { useState, useEffect } from 'react';
import { Car, Building2, MapPin, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CompactTable } from '@/components/shared/CompactTable';
import { getAllMacSteelCostCenters, MacSteelCostCenter } from '@/lib/actions/macSteel';
import { VehicleDetailsView } from '@/components/dashboard/VehicleDetailsView';

export function VehiclesDashboard() {
  const [costCenters, setCostCenters] = useState<MacSteelCostCenter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCostCenter, setSelectedCostCenter] = useState<MacSteelCostCenter | null>(null);

  useEffect(() => {
    const loadCostCenters = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getAllMacSteelCostCenters();
        // Filter out cost centers where geozone is empty or null
        const filteredData = data.filter(cc => cc.geozone && cc.geozone.trim() !== '');
        setCostCenters(filteredData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load vehicles data');
      } finally {
        setIsLoading(false);
      }
    };

    loadCostCenters();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="font-semibold text-gray-900 text-2xl">Vehicles Dashboard</h1>
            <p className="text-gray-600 text-sm">Vehicle and cost center information</p>
          </div>
        </div>

        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <div className="mx-auto mb-4 border-b-2 border-blue-600 rounded-full w-12 h-12 animate-spin"></div>
              <p className="text-gray-600">Loading vehicles data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="font-semibold text-gray-900 text-2xl">Vehicles Dashboard</h1>
            <p className="text-gray-600 text-sm">Vehicle and cost center information</p>
          </div>
        </div>

        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Car className="mx-auto mb-4 w-12 h-12 text-gray-400" />
              <h3 className="mb-2 font-medium text-gray-900 text-lg">Error Loading Data</h3>
              <p className="text-red-600">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If a cost center is selected, show vehicle details
  if (selectedCostCenter) {
    return (
      <VehicleDetailsView
        costCenter={selectedCostCenter}
        onBack={() => setSelectedCostCenter(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-semibold text-gray-900 text-2xl">Vehicles Dashboard</h1>
          <p className="text-gray-600 text-sm">Vehicle and cost center information from MacSteel</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="gap-6 grid grid-cols-1 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Total Cost Centers</CardTitle>
            <Building2 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{costCenters.length}</div>
            <p className="text-muted-foreground text-xs">
              With geozones assigned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Unique Geozones</CardTitle>
            <MapPin className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {new Set(costCenters.map(cc => cc.geozone)).size}
            </div>
            <p className="text-muted-foreground text-xs">
              Different geozones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Companies</CardTitle>
            <Building2 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {new Set(costCenters.map(cc => cc.company).filter(Boolean)).size}
            </div>
            <p className="text-muted-foreground text-xs">
              Unique companies
            </p>
          </CardContent>
        </Card>
      </div>

      {/* MacSteel Data Table */}
      {costCenters.length === 0 ? (
        <div className="py-12 text-center">
          <div className="bg-gray-50 p-8 border border-gray-200 rounded-lg">
            <Car className="mx-auto mb-4 w-12 h-12 text-gray-400" />
            <h3 className="mb-2 font-medium text-gray-900 text-lg">No Data Found</h3>
            <p className="mb-4 text-gray-600">
              There are no cost centers available in the MacSteel database.
            </p>
            <p className="text-gray-500 text-sm">
              Data will update automatically when cost centers are added.
            </p>
          </div>
        </div>
      ) : (
        <CompactTable
          data={costCenters}
          onActionClick={(item: MacSteelCostCenter) => {
            setSelectedCostCenter(item);
          }}
          actionIcon={<Eye className="w-4 h-4" />}
          columns={[
            {
              key: 'company',
              label: 'Company',
              align: 'left' as const,
              sortable: true,
              render: (item: MacSteelCostCenter) => (
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <span className="block text-gray-700 text-sm">
                      {item.company || 'Unknown Company'}
                    </span>
                  </div>
                </div>
              )
            }
          ]}
          title="MacSteel Cost Centers & Vehicles"
          searchPlaceholder="Search companies..."
          showDownload={true}
          showColumns={true}
        />
      )}
    </div>
  );
}
