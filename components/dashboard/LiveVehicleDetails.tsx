'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Gauge, Shield, Key, Thermometer, Clock, RefreshCw, Car, Navigation, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getLiveVehiclesByAccountNumber, LiveVehicle } from '@/lib/actions/vehicles';
import { MacSteelCostCenter } from '@/lib/actions/costCenters';

interface LiveVehicleDetailsProps {
  costCenter: MacSteelCostCenter;
  onBack: () => void;
}

export function LiveVehicleDetails({ costCenter, onBack }: LiveVehicleDetailsProps) {
  const [vehicles, setVehicles] = useState<LiveVehicle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'stopped'>('all');
  const [isFiltering, setIsFiltering] = useState(false);
  const hasInitialized = useRef(false);

  // Fetch data on initial page load - only run once when component mounts
  useEffect(() => {
    if (hasInitialized.current) return;
    
    hasInitialized.current = true;
    
    const initialFetch = async () => {
      if (!costCenter.new_account_number) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const vehicleData = await getLiveVehiclesByAccountNumber(costCenter.new_account_number);
        setVehicles(vehicleData);
        setLastUpdate(new Date());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch live vehicles');
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
      const vehicleData = await getLiveVehiclesByAccountNumber(costCenter.new_account_number);
      setVehicles(vehicleData);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch live vehicles');
    } finally {
      setIsLoading(false);
    }
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
         <Card 
           className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
             selectedFilter === 'all' 
               ? 'bg-gradient-to-br from-blue-100 to-blue-200 border-blue-300 ring-2 ring-blue-400' 
               : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'
           }`}
           onClick={() => handleFilterChange('all')}
         >
           <CardHeader className="pb-2">
             <CardTitle className="flex items-center font-medium text-blue-700 text-sm">
               <Car className="mr-2 w-4 h-4" />
               Total Vehicles
             </CardTitle>
           </CardHeader>
           <CardContent>
             <div className="font-bold text-blue-900 text-2xl">{totalVehicles}</div>
           </CardContent>
         </Card>
         
         <Card 
           className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
             selectedFilter === 'active' 
               ? 'bg-gradient-to-br from-green-100 to-green-200 border-green-300 ring-2 ring-blue-400' 
               : 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
           }`}
           onClick={() => handleFilterChange('active')}
         >
           <CardHeader className="pb-2">
             <CardTitle className="flex items-center font-medium text-green-700 text-sm">
               <Zap className="mr-2 w-4 h-4" />
               Active Vehicles
             </CardTitle>
           </CardHeader>
           <CardContent>
             <div className="font-bold text-green-900 text-2xl">{activeVehicles}</div>
           </CardContent>
         </Card>
         
         <Card 
           className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
             selectedFilter === 'stopped' 
               ? 'bg-gradient-to-br from-orange-100 to-orange-200 border-orange-300 ring-2 ring-orange-400' 
               : 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200'
             }`}
           onClick={() => handleFilterChange('stopped')}
         >
           <CardHeader className="pb-2">
             <CardTitle className="flex items-center font-medium text-orange-700 text-sm">
               <Shield className="mr-2 w-4 h-4" />
               Stopped Vehicles
             </CardTitle>
           </CardHeader>
           <CardContent>
             <div className="font-bold text-orange-900 text-2xl">{stoppedVehicles}</div>
           </CardContent>
         </Card>
         
         <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
           <CardHeader className="pb-2">
             <CardTitle className="flex items-center font-medium text-purple-700 text-sm">
               <Gauge className="mr-2 w-4 h-4" />
               Avg Speed
             </CardTitle>
           </CardHeader>
           <CardContent>
             <div className="font-bold text-purple-900 text-2xl">{averageSpeed.toFixed(1)} km/h</div>
           </CardContent>
         </Card>
       </div>
      
                           {/* Filter Indicator */}
        {selectedFilter !== 'all' && (
          <div className="col-span-full">
            <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-700 text-sm">
                    Showing {selectedFilter === 'active' ? 'Active' : 'Stopped'} Vehicles:
                  </span>
                  <span className="bg-blue-100 px-2.5 py-0.5 rounded-full font-medium text-blue-800 text-xs">
                    {isFiltering ? '...' : `${filteredVehicles.length} of ${vehicles.length}`}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleFilterChange('all')}
                  className="text-gray-600 hover:text-gray-800"
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
            <Card key={vehicle.id} className="bg-white hover:shadow-lg border border-gray-200 transition-shadow duration-200">
              <CardHeader className="pb-3 border-gray-100 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="font-semibold text-gray-900 text-lg underline">
                      {vehicle.plate || 'N/A'}
                    </CardTitle>
                    <div className="flex items-center mt-1">
                      <Shield className="mr-1 w-4 h-4 text-gray-400" />
                      <span className="text-gray-500 text-xs">Secure</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <div className="flex items-center space-x-3">
                  <div className="flex justify-center items-center bg-blue-100 rounded-full w-8 h-8">
                    <Car className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Driver</p>
                    <p className="text-gray-600 text-sm">{vehicle.drivername || vehicle.plate || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex justify-center items-center bg-green-100 rounded-full w-8 h-8">
                    <MapPin className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Geo Zone</p>
                    <p className="text-gray-600 text-sm">{vehicle.geozone || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex justify-center items-center bg-purple-100 rounded-full w-8 h-8">
                    <Gauge className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">CPK</p>
                    <p className="text-gray-600 text-sm">0 Km/l</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex justify-center items-center bg-orange-100 rounded-full w-8 h-8">
                    <Navigation className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Odo</p>
                    <p className="text-gray-600 text-sm">{vehicle.mileage || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex justify-center items-center bg-red-100 rounded-full w-8 h-8">
                    <Shield className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Safety Info</p>
                    <p className="text-gray-600 text-sm">
                      {vehicle.speed && parseFloat(vehicle.speed) > 0 ? 'Vehicle Moving' : 'Vehicle Stopped'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex justify-center items-center bg-yellow-100 rounded-full w-8 h-8">
                    <Key className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Engine</p>
                    <p className="text-gray-600 text-sm">
                      {vehicle.speed && parseFloat(vehicle.speed) > 0 ? 'On' : 'Off'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex justify-center items-center bg-indigo-100 rounded-full w-8 h-8">
                                         <Zap className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Speed</p>
                    <p className="text-gray-600 text-sm">
                      {vehicle.speed ? `${vehicle.speed} km/h` : '0 km/h'}
                    </p>
                  </div>
                </div>
                
                {vehicle.temperature && (
                  <div className="flex items-center space-x-3">
                    <div className="flex justify-center items-center bg-pink-100 rounded-full w-8 h-8">
                      <Thermometer className="w-4 h-4 text-pink-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Temperature</p>
                      <p className="text-gray-600 text-sm">{vehicle.temperature}°C</p>
                    </div>
                  </div>
                )}
                
                {vehicle.loctime && (
                  <div className="flex items-center space-x-3">
                    <div className="flex justify-center items-center bg-gray-100 rounded-full w-8 h-8">
                      <Clock className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Last Update</p>
                      <p className="text-gray-600 text-sm">
                        {new Date(vehicle.loctime).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Active vs Stopped Vehicles Line Graph */}
      <div className="bg-white p-6 border border-gray-200 rounded-lg">
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 text-lg">Vehicle Activity Over Time</h3>
          <p className="text-gray-600 text-sm">Active vs Stopped vehicles trend</p>
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
            
            {/* X-axis time labels */}
            {(() => {
              const timeLabels = [
                '6:00 AM', '8:00 AM', '10:00 AM', '12:00 PM', 
                '2:00 PM', '4:00 PM', '6:00 PM', '8:00 PM'
              ];
              return timeLabels.map((time, index) => {
                const x = (index / (timeLabels.length - 1)) * 700 + 50;
                return (
                  <text
                    key={index}
                    x={x}
                    y="250"
                    className="font-medium text-gray-500 text-xs"
                    textAnchor="middle"
                  >
                    {time}
                  </text>
                );
              });
            })()}
            
            {/* Generate sample data points for demonstration */}
            {(() => {
              const dataPoints = 20;
              const activeData = [];
              const stoppedData = [];
              const totalData = [];
              
              for (let i = 0; i < dataPoints; i++) {
                const x = (i / (dataPoints - 1)) * 700 + 50;
                const activeY = 140 - (Math.random() * 60 + 20); // Random active vehicles between 20-80, positioned higher
                const stoppedY = 140 - (Math.random() * 40 + 10); // Random stopped vehicles between 10-50, positioned higher
                const totalY = 140 - (activeY + stoppedY - 140); // Total is sum, positioned higher
                
                activeData.push({ x, y: activeY });
                stoppedData.push({ x, y: stoppedY });
                totalData.push({ x, y: totalY });
              }
              
              return (
                <>
                  {/* Active vehicles line */}
                  <polyline
                    points={activeData.map(d => `${d.x},${d.y}`).join(' ')}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  
                  {/* Stopped vehicles line */}
                  <polyline
                    points={stoppedData.map(d => `${d.x},${d.y}`).join(' ')}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  
                  {/* Total vehicles line */}
                  <polyline
                    points={totalData.map(d => `${d.x},${d.y}`).join(' ')}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="5,5"
                  />
                  
                  {/* Data points for active vehicles */}
                  {activeData.map((point, index) => (
                    <circle
                      key={`active-${index}`}
                      cx={point.x}
                      cy={point.y}
                      r="3"
                      fill="#10b981"
                      className="transition-all duration-200 hover:r-4"
                    />
                  ))}
                  
                  {/* Data points for stopped vehicles */}
                  {stoppedData.map((point, index) => (
                    <circle
                      key={`stopped-${index}`}
                      cx={point.x}
                      cy={point.y}
                      r="3"
                      fill="#f59e0b"
                      className="transition-all duration-200 hover:r-4"
                    />
                  ))}
                  
                  {/* Data points for total vehicles */}
                  {totalData.map((point, index) => (
                    <circle
                      key={`total-${index}`}
                      cx={point.x}
                      cy={point.y}
                      r="2"
                      fill="#3b82f6"
                      className="transition-all duration-200 hover:r-3"
                    />
                  ))}
                </>
              );
            })()}
            
            {/* Legend with better spacing */}
            <g transform="translate(50, 200)">
              <rect x="0" y="0" width="12" height="12" fill="#10b981" rx="2" />
              <text x="20" y="10" className="font-medium text-gray-700 text-xs">Active Vehicles</text>
              
              <rect x="120" y="0" width="12" height="12" fill="#f59e0b" rx="2" />
              <text x="140" y="10" className="font-medium text-gray-700 text-xs">Stopped Vehicles</text>
              
              <rect x="240" y="0" width="12" height="12" fill="#3b82f6" rx="2" />
              <text x="260" y="10" className="font-medium text-gray-700 text-xs">Total Vehicles</text>
            </g>
          </svg>
        </div>
        
        {/* Current Status Summary with better spacing */}
        <div className="gap-6 grid grid-cols-3 mt-8 text-center">
          <div className="bg-green-50 p-4 border border-green-200 rounded-lg">
            <div className="mb-2 font-bold text-green-600 text-2xl">{activeVehicles}</div>
            <div className="text-green-700 text-sm">Currently Active</div>
          </div>
          <div className="bg-orange-50 p-4 border border-orange-200 rounded-lg">
            <div className="mb-2 font-bold text-orange-600 text-2xl">{stoppedVehicles}</div>
            <div className="text-orange-700 text-sm">Currently Stopped</div>
          </div>
          <div className="bg-blue-50 p-4 border border-blue-200 rounded-lg">
            <div className="mb-2 font-bold text-blue-600 text-2xl">{totalVehicles}</div>
            <div className="text-blue-700 text-sm">Total Fleet</div>
          </div>
        </div>
      </div>
    </div>
  );
}
