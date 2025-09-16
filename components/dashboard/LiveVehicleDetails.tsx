'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Gauge, Shield, Key, Thermometer, Clock, RefreshCw, Car, Navigation, Zap, Wifi, WifiOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MacSteelCostCenter } from '@/lib/actions/costCenters';
import { useLiveVehicles, LiveVehicleData } from '@/lib/context/LiveVehicleContext';
import { LiveVehicleCard } from '@/components/shared/LiveVehicleCard';

interface LiveVehicleDetailsProps {
  costCenter: MacSteelCostCenter;
  onBack: () => void;
}

export function LiveVehicleDetails({ costCenter, onBack }: LiveVehicleDetailsProps) {
  const { 
    vehicles: allVehicles, 
    isLoading, 
    error, 
    isConnected, 
    lastUpdate, 
    refreshVehicles, 
    getVehiclesByCostCenter 
  } = useLiveVehicles();
  
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'stopped'>('all');
  const [isFiltering, setIsFiltering] = useState(false);
  const [updatedVehicleIds, setUpdatedVehicleIds] = useState<Set<number>>(new Set());
  const hasInitialized = useRef(false);

  // Get vehicles for this specific cost center
  const vehicles = getVehiclesByCostCenter(costCenter.new_account_number || '');

  // Set up visual update indicators for vehicles
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    
    // Add visual update indicator for vehicles when they change
    const interval = setInterval(() => {
      // This will trigger re-renders when vehicles are updated via WebSocket
      // The context handles the actual data updates
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchVehicles = async () => {
    await refreshVehicles();
  };

  // Calculate stats from vehicle data
  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter(vehicle => vehicle.speed && parseFloat(vehicle.speed) > 0).length;
  const stoppedVehicles = totalVehicles - activeVehicles;
  const averageSpeed = vehicles.length > 0 
    ? vehicles.reduce((sum, vehicle) => sum + (vehicle.speed ? parseFloat(vehicle.speed) : 0), 0) / vehicles.length 
    : 0;

  // Filter vehicles based on selected category
  const filteredVehicles = vehicles.filter(vehicle => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'active') return vehicle.speed && parseFloat(vehicle.speed) > 0;
    if (selectedFilter === 'stopped') return !vehicle.speed || parseFloat(vehicle.speed) === 0;
    return true;
  });

  // Get filter count for display
  // const getFilterCount = () => {
  //   switch (selectedFilter) {
  //     case 'active': return activeVehicles;
  //     case 'stopped': return stoppedVehicles;
  //     default: return totalVehicles;
  //   }
  // };

  // Handle filter change with loading state
  const handleFilterChange = (filter: 'all' | 'active' | 'stopped') => {
    setIsFiltering(true);
    setSelectedFilter(filter);
    
    // Simulate a small delay for smooth transition
    setTimeout(() => {
      setIsFiltering(false);
    }, 300);
  };

  // Show loading state
  if (isLoading) {
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
        
        {/* Vehicle Cards Skeleton */}
        <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="bg-white border border-gray-200">
              <CardHeader className="pb-2">
                <Skeleton className="w-32 h-6" />
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <Skeleton className="w-4 h-4" />
                    <Skeleton className="w-24 h-4" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-gray-900 text-xl">Live Vehicle Details</h2>
          <Button onClick={onBack} variant="outline">
            Back to Cost Centers
          </Button>
        </div>
        <div className="bg-red-50 p-6 border border-red-200 rounded-lg text-center">
          <p className="text-red-600">Error loading live vehicles: {error}</p>
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
            <div className="flex items-center space-x-2 mt-1">
              <p className="text-gray-500 text-xs">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
              {isConnected && (
                <span className="inline-flex items-center bg-green-100 px-2 py-0.5 rounded-full font-medium text-green-800 text-xs">
                  <div className="bg-green-400 mr-1 rounded-full w-1.5 h-1.5 animate-pulse"></div>
                  Live Updates
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-3">
          {/* Real-time connection status */}
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <div className="flex items-center space-x-1 text-green-600">
                <Wifi className="w-4 h-4" />
                <span className="font-medium text-sm">Live</span>
              </div>
            ) : isLoading ? (
              <div className="flex items-center space-x-1 text-yellow-600">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="font-medium text-sm">Connecting...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-red-600">
                <WifiOff className="w-4 h-4" />
                <span className="font-medium text-sm">Offline</span>
              </div>
            )}
          </div>
          
          <Button 
            onClick={fetchVehicles} 
            size="sm" 
            variant="outline"
            className="flex items-center space-x-2"
            disabled={isConnected}
          >
            <RefreshCw className="mr-2 w-4 h-4" />
            {isConnected ? 'Auto-updating' : 'Refresh'}
          </Button>
          <Button onClick={onBack} variant="outline">
            Back to Cost Centers
          </Button>
        </div>
      </div>
      
             {/* Stats Cards */}
       <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
         <Card 
           className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
             selectedFilter === 'all' 
               ? 'bg-gradient-to-br from-macsteel-100 to-macsteel-200 border-macsteel-300 ring-2 ring-macsteel-400 shadow-lg' 
               : 'bg-gradient-to-br from-macsteel-50 to-macsteel-100 border-macsteel-200 hover:border-macsteel-300'
           }`}
           onClick={() => handleFilterChange('all')}
         >
           <CardHeader className="pb-3">
             <CardTitle className="flex items-center font-semibold text-macsteel-700 text-sm">
               <div className="flex justify-center items-center bg-macsteel-200 mr-3 rounded-lg w-8 h-8">
                 <Car className="w-4 h-4 text-macsteel-600" />
               </div>
               Total Vehicles
             </CardTitle>
           </CardHeader>
           <CardContent>
             <div className="font-bold text-macsteel-900 text-3xl">{totalVehicles}</div>
             <div className="mt-1 text-macsteel-600 text-xs">Fleet Size</div>
           </CardContent>
         </Card>
         
         <Card 
           className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
             selectedFilter === 'active' 
               ? 'bg-gradient-to-br from-success-100 to-success-200 border-success-300 ring-2 ring-success-400 shadow-lg' 
               : 'bg-gradient-to-br from-success-50 to-success-100 border-success-200 hover:border-success-300'
           }`}
           onClick={() => handleFilterChange('active')}
         >
           <CardHeader className="pb-3">
             <CardTitle className="flex items-center font-semibold text-success-700 text-sm">
               <div className="flex justify-center items-center bg-success-200 mr-3 rounded-lg w-8 h-8">
                 <Zap className="w-4 h-4 text-success-600" />
               </div>
               Active Vehicles
             </CardTitle>
           </CardHeader>
           <CardContent>
             <div className="font-bold text-success-900 text-3xl">{activeVehicles}</div>
             <div className="mt-1 text-success-600 text-xs">Currently Moving</div>
           </CardContent>
         </Card>
         
         <Card 
           className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
             selectedFilter === 'stopped' 
               ? 'bg-gradient-to-br from-warning-100 to-warning-200 border-warning-300 ring-2 ring-warning-400 shadow-lg' 
               : 'bg-gradient-to-br from-warning-50 to-warning-100 border-warning-200 hover:border-warning-300'
             }`}
           onClick={() => handleFilterChange('stopped')}
         >
           <CardHeader className="pb-3">
             <CardTitle className="flex items-center font-semibold text-warning-700 text-sm">
               <div className="flex justify-center items-center bg-warning-200 mr-3 rounded-lg w-8 h-8">
                 <Shield className="w-4 h-4 text-warning-600" />
               </div>
               Stopped Vehicles
             </CardTitle>
           </CardHeader>
           <CardContent>
             <div className="font-bold text-warning-900 text-3xl">{stoppedVehicles}</div>
             <div className="mt-1 text-warning-600 text-xs">Currently Idle</div>
           </CardContent>
         </Card>
         
         <Card className="bg-gradient-to-br from-macsteel-50 to-macsteel-100 hover:shadow-xl border-macsteel-200 hover:border-macsteel-300 hover:scale-105 transition-all duration-300">
           <CardHeader className="pb-3">
             <CardTitle className="flex items-center font-semibold text-macsteel-700 text-sm">
               <div className="flex justify-center items-center bg-macsteel-200 mr-3 rounded-lg w-8 h-8">
                 <Gauge className="w-4 h-4 text-macsteel-600" />
               </div>
               Avg Speed
             </CardTitle>
           </CardHeader>
           <CardContent>
             <div className="font-bold text-macsteel-900 text-3xl">{averageSpeed.toFixed(1)} km/h</div>
             <div className="mt-1 text-macsteel-600 text-xs">Fleet Average</div>
           </CardContent>
         </Card>
       </div>
      
                           {/* Filter Indicator */}
        {selectedFilter !== 'all' && (
          <div className="col-span-full">
            <div className="bg-macsteel-50 p-4 border border-macsteel-200 rounded-lg">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-macsteel-700 text-sm">
                    Showing {selectedFilter === 'active' ? 'Active' : 'Stopped'} Vehicles:
                  </span>
                  <span className="bg-macsteel-200 px-2.5 py-0.5 rounded-full font-medium text-macsteel-800 text-xs">
                    {isFiltering ? '...' : `${filteredVehicles.length} of ${vehicles.length}`}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleFilterChange('all')}
                  className="border-macsteel-300 hover:border-macsteel-400 text-macsteel-600 hover:text-macsteel-800"
                  disabled={isFiltering}
                >
                  {isFiltering ? 'Loading...' : 'Show All Vehicles'}
                </Button>
              </div>
            </div>
          </div>
        )}

               {/* Live Vehicle Cards */}
        <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {isFiltering ? (
            // Show skeleton loading while filtering
            Array.from({ length: Math.min(6, vehicles.length) }).map((_, index) => (
              <Card key={index} className="bg-white border border-gray-200">
                <CardHeader className="pb-3 border-gray-100 border-b">
                  <Skeleton className="w-32 h-6" />
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <Skeleton className="rounded-full w-8 h-8" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="w-20 h-3" />
                        <Skeleton className="w-24 h-3" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))
          ) : filteredVehicles.length === 0 ? (
            <div className="col-span-full bg-gray-50 p-12 border border-gray-200 rounded-lg text-center">
              <p className="text-gray-500">
                {vehicles.length === 0 
                  ? 'No live vehicles found for this cost center.'
                  : `No ${selectedFilter === 'active' ? 'active' : 'stopped'} vehicles found.`
                }
              </p>
            </div>
          ) : (
            filteredVehicles.map((vehicle) => (
              <LiveVehicleCard
                key={vehicle.id} 
                vehicle={vehicle}
                showHighlight={updatedVehicleIds.has(vehicle.id)}
              />
            ))
        )}
      </div>

      {/* Vehicle Status Bar Chart */}
      <div className="bg-white p-6 border border-gray-200 rounded-lg">
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 text-lg">Vehicle Status Overview</h3>
          <p className="text-gray-600 text-sm">Current fleet status breakdown</p>
        </div>
        
        <div className="w-full h-80">
          <svg width="100%" height="100%" viewBox="0 0 800 280" className="overflow-visible">
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Y-axis line (left vertical line) */}
            <line x1="50" y1="30" x2="50" y2="220" stroke="#d1d5db" strokeWidth="2" />
            
            {/* X-axis line (bottom horizontal line) */}
            <line x1="50" y1="220" x2="750" y2="220" stroke="#d1d5db" strokeWidth="2" />
            
            {/* Y-axis labels */}
            {(() => {
              const maxValue = Math.max(activeVehicles, stoppedVehicles, totalVehicles);
              const yLabels = [0, Math.ceil(maxValue * 0.25), Math.ceil(maxValue * 0.5), Math.ceil(maxValue * 0.75), maxValue];
              return yLabels.map((value, index) => {
                const y = 220 - (index / (yLabels.length - 1)) * 190;
                return (
                  <text
                    key={index}
                    x="40"
                    y={y + 5}
                    className="font-medium text-gray-500 text-xs"
                    textAnchor="end"
                  >
                    {value}
                  </text>
                );
              });
            })()}
            
            {/* Bar Chart */}
            {(() => {
              const maxValue = Math.max(activeVehicles, stoppedVehicles, totalVehicles, 1); // Ensure minimum value of 1 to prevent division by zero
              const barWidth = 120;
              const barSpacing = 40;
              const startX = 150;
              
              // Active Vehicles Bar
              const activeHeight = maxValue > 0 ? (activeVehicles / maxValue) * 180 : 0;
              const activeY = 220 - activeHeight;
              
              // Stopped Vehicles Bar
              const stoppedHeight = maxValue > 0 ? (stoppedVehicles / maxValue) * 180 : 0;
              const stoppedY = 220 - stoppedHeight;
              
              // Total Vehicles Bar
              const totalHeight = maxValue > 0 ? (totalVehicles / maxValue) * 180 : 0;
              const totalY = 220 - totalHeight;
              
              return (
                <>
                  {/* Active Vehicles Bar */}
                  <rect
                    x={startX}
                    y={activeY}
                    width={barWidth}
                    height={activeHeight}
                    fill="#22c55e"
                    rx="4"
                    className="hover:opacity-80 transition-all duration-300"
                  />
                  <text
                    x={startX + barWidth / 2}
                    y={activeY - 10}
                    className="font-semibold text-gray-700 text-sm"
                    textAnchor="middle"
                  >
                    {activeVehicles}
                  </text>
                  
                  {/* Stopped Vehicles Bar */}
                  <rect
                    x={startX + barWidth + barSpacing}
                    y={stoppedY}
                    width={barWidth}
                    height={stoppedHeight}
                    fill="#f59e0b"
                    rx="4"
                    className="hover:opacity-80 transition-all duration-300"
                  />
                  <text
                    x={startX + barWidth + barSpacing + barWidth / 2}
                    y={stoppedY - 10}
                    className="font-semibold text-gray-700 text-sm"
                    textAnchor="middle"
                  >
                    {stoppedVehicles}
                  </text>
                  
                  {/* Total Vehicles Bar */}
                  <rect
                    x={startX + (barWidth + barSpacing) * 2}
                    y={totalY}
                    width={barWidth}
                    height={totalHeight}
                    fill="#0ea5e9"
                    rx="4"
                    className="hover:opacity-80 transition-all duration-300"
                  />
                  <text
                    x={startX + (barWidth + barSpacing) * 2 + barWidth / 2}
                    y={totalY - 10}
                    className="font-semibold text-gray-700 text-sm"
                    textAnchor="middle"
                  >
                    {totalVehicles}
                  </text>
                </>
              );
            })()}
            
            {/* X-axis labels */}
            <g transform="translate(0, 240)">
              <text x="210" y="10" className="font-medium text-gray-700 text-sm" textAnchor="middle">Active Vehicles</text>
              <text x="370" y="10" className="font-medium text-gray-700 text-sm" textAnchor="middle">Stopped Vehicles</text>
              <text x="530" y="10" className="font-medium text-gray-700 text-sm" textAnchor="middle">Total Vehicles</text>
            </g>
            

          </svg>
        </div>
        
        {/* Current Status Summary with better spacing */}
        <div className="gap-6 grid grid-cols-3 mt-8 text-center">
          <div className="bg-success-50 hover:shadow-md p-4 border border-success-200 rounded-lg transition-all duration-200">
            <div className="mb-2 font-bold text-success-600 text-2xl">{activeVehicles}</div>
            <div className="text-success-700 text-sm">Currently Active</div>
          </div>
          <div className="bg-warning-50 hover:shadow-md p-4 border border-warning-200 rounded-lg transition-all duration-200">
            <div className="mb-2 font-bold text-warning-600 text-2xl">{stoppedVehicles}</div>
            <div className="text-warning-700 text-sm">Currently Stopped</div>
          </div>
          <div className="bg-macsteel-50 hover:shadow-md p-4 border border-macsteel-200 rounded-lg transition-all duration-200">
            <div className="mb-2 font-bold text-macsteel-600 text-2xl">{totalVehicles}</div>
            <div className="text-macsteel-700 text-sm">Total Fleet</div>
          </div>
        </div>
      </div>
      

    </div>
  );
}
