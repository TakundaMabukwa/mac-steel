'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Car, Building2, MapPin, Wifi, WifiOff, Loader2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CompactTable } from '@/components/shared/CompactTable';
import { VehicleSkeletonList } from '@/components/dashboard/VehicleSkeleton';
import { VehicleLoanDialog } from '@/components/dashboard/VehicleLoanDialog';
import { getVehiclesByAccountNumber, VehicleIp } from '@/lib/actions/vehiclesIp';

interface VehicleDetailsViewProps {
  costCenter: {
    new_account_number: string;
    company: string | null;
  };
  onBack: () => void;
}

export function VehicleDetailsView({ costCenter, onBack }: VehicleDetailsViewProps) {
  const [vehicles, setVehicles] = useState<VehicleIp[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [inactiveCount, setInactiveCount] = useState(0);
  const [isLoanDialogOpen, setIsLoanDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleIp | null>(null);

  const loadVehicles = async (page: number = 1, append: boolean = false) => {
    try {
      if (page === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      const result = await getVehiclesByAccountNumber(costCenter.new_account_number, page, 10);
      
      // Log the vehicle data
      console.log('Vehicle Details - Loaded vehicles:', result.data);
      console.log('Vehicle Details - Total count:', result.total);
      console.log('Vehicle Details - Has more:', result.hasMore);
      console.log('Vehicle Details - Current page:', page);
      
      if (append) {
        setVehicles(prev => [...prev, ...result.data]);
      } else {
        setVehicles(result.data);
      }
      
      setHasMore(result.hasMore);
      setTotalCount(result.total);
      setCurrentPage(page);

      // Calculate active/inactive counts
      const active = result.data.filter(v => v.active === true).length;
      const inactive = result.data.filter(v => v.active === false).length;
      
      if (append) {
        setActiveCount(prev => prev + active);
        setInactiveCount(prev => prev + inactive);
      } else {
        setActiveCount(active);
        setInactiveCount(inactive);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vehicles');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (hasMore && !isLoadingMore) {
      loadVehicles(currentPage + 1, true);
    }
  };

  useEffect(() => {
    console.log('Vehicle Details - Component loaded for cost center:', costCenter);
    loadVehicles(1);
  }, [costCenter.new_account_number]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Button onClick={onBack} variant="outline" className="hover:bg-blue-50 border-blue-800 text-blue-800">
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back to Cost Centers
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-semibold text-gray-900 text-2xl">Loading Vehicles...</h1>
              <p className="text-gray-600 text-sm">Fetching vehicle data for {costCenter.company}</p>
            </div>
          </div>

          <VehicleSkeletonList count={5} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Button onClick={onBack} variant="outline" className="hover:bg-blue-50 border-blue-800 text-blue-800">
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back to Cost Centers
          </Button>
        </div>

        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Car className="mx-auto mb-4 w-12 h-12 text-gray-400" />
              <h3 className="mb-2 font-medium text-gray-900 text-lg">Error Loading Vehicles</h3>
              <p className="text-red-600">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Button onClick={onBack} variant="outline" className="hover:bg-blue-50 border-blue-800 text-blue-800">
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back to Cost Centers
        </Button>
      </div>

      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-semibold text-gray-900 text-2xl">Vehicles</h1>
          <p className="text-gray-600 text-sm">Vehicle details for {costCenter.company}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="gap-6 grid grid-cols-1 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Total Vehicles</CardTitle>
            <Car className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{totalCount}</div>
            <p className="text-muted-foreground text-xs">
              All vehicles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Active Vehicles</CardTitle>
            <Wifi className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-green-600 text-2xl">{activeCount}</div>
            <p className="text-muted-foreground text-xs">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Inactive Vehicles</CardTitle>
            <WifiOff className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-red-600 text-2xl">{inactiveCount}</div>
            <p className="text-muted-foreground text-xs">
              Currently inactive
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Vehicles Table */}
      {vehicles.length === 0 ? (
        <div className="py-12 text-center">
          <div className="bg-gray-50 p-8 border border-gray-200 rounded-lg">
            <Car className="mx-auto mb-4 w-12 h-12 text-gray-400" />
            <h3 className="mb-2 font-medium text-gray-900 text-lg">No Vehicles Found</h3>
            <p className="mb-4 text-gray-600">
              There are no vehicles available for this cost center.
            </p>
          </div>
        </div>
      ) : (
                 <div className="space-y-4">
           <CompactTable
             data={vehicles}
             onActionClick={(item: VehicleIp) => {
               console.log('Vehicle Details - Vehicle selected for loan:', item);
               setSelectedVehicle(item);
               setIsLoanDialogOpen(true);
             }}
             actionIcon={<Settings className="w-4 h-4" />}
             columns={[
              {
                key: 'group_name',
                label: 'PLATE',
                align: 'left' as const,
                sortable: true,
                render: (item: VehicleIp) => (
                  <span className="font-medium text-gray-900 text-sm">
                    {item.group_name || 'N/A'}
                  </span>
                )
              },
              {
                key: 'company',
                label: 'Company',
                align: 'left' as const,
                sortable: true,
                render: (item: VehicleIp) => (
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <span className="block text-gray-700 text-sm">
                        {item.company || 'N/A'}
                      </span>
                    </div>
                  </div>
                )
              },
              {
                key: 'new_registration',
                label: 'Registration',
                align: 'left' as const,
                sortable: true,
                render: (item: VehicleIp) => (
                  <span className="font-mono text-gray-600 text-sm">
                    {item.new_registration || 'N/A'}
                  </span>
                )
              },
              {
                key: 'active',
                label: 'Status',
                align: 'left' as const,
                render: (item: VehicleIp) => (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    item.active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {item.active ? 'Active' : 'Inactive'}
                  </span>
                )
              }
            ]}
            title="Vehicle Details"
            searchPlaceholder="Search vehicles..."
            showDownload={true}
            showColumns={true}
          />

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                onClick={loadMore}
                disabled={isLoadingMore}
                variant="outline"
                className="hover:bg-blue-50 border-blue-800 text-blue-800"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More Vehicles'
                )}
              </Button>
            </div>
          )}
                 </div>
       )}

       {/* Loan Dialog */}
       <VehicleLoanDialog
         isOpen={isLoanDialogOpen}
         onClose={() => {
           console.log('Vehicle Details - Loan dialog closed');
           setIsLoanDialogOpen(false);
           setSelectedVehicle(null);
         }}
         vehicle={selectedVehicle}
         onSuccess={() => {
           console.log('Vehicle Details - Loan update successful, reloading vehicles');
           // Reload vehicles to reflect the changes
           loadVehicles(1);
         }}
       />
     </div>
   );
 }
