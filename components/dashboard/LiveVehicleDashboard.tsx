'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Car, Zap, Shield, MapPin, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useLiveVehicles } from '@/lib/context/LiveVehicleContext';
import { LiveVehicleCard } from '@/components/shared/LiveVehicleCard';

export function LiveVehicleDashboard() {
  const { 
    vehicles, 
    isLoading, 
    isProgressiveLoading,
    loadedCount,
    totalCount,
    error, 
    isConnected, 
    lastUpdate, 
    refreshVehicles 
  } = useLiveVehicles();
  
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'stopped'>('all');

  // Calculate stats
  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter(vehicle => vehicle.speed && parseFloat(vehicle.speed) > 0).length;
  const stoppedVehicles = totalVehicles - activeVehicles;
  const averageSpeed = vehicles.length > 0 
    ? vehicles.reduce((sum, vehicle) => sum + (vehicle.speed ? parseFloat(vehicle.speed) : 0), 0) / vehicles.length 
    : 0;

  // Filter vehicles
  const filteredVehicles = vehicles.filter(vehicle => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'active') return vehicle.speed && parseFloat(vehicle.speed) > 0;
    if (selectedFilter === 'stopped') return !vehicle.speed || parseFloat(vehicle.speed) === 0;
    return true;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-gray-900 text-xl">Live Vehicle Dashboard</h2>
        </div>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <RefreshCw className="mx-auto mb-4 w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-gray-600">Loading live vehicle data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show progressive loading indicator
  if (isProgressiveLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-gray-900 text-xl">Live Vehicle Dashboard</h2>
          <div className="flex items-center space-x-2">
            <Wifi className="w-4 h-4 text-green-600" />
            <span className="text-green-600 text-sm">Loading vehicles...</span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="bg-white p-6 border border-gray-200 rounded-lg">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700 text-sm">
                Loading vehicles... {loadedCount} of {totalCount}
              </span>
              <span className="text-gray-500 text-sm">
                {Math.round((loadedCount / totalCount) * 100)}%
              </span>
            </div>
            <div className="bg-gray-200 rounded-full w-full h-2">
              <div 
                className="bg-blue-600 rounded-full h-2 transition-all duration-300 ease-out"
                style={{ width: `${(loadedCount / totalCount) * 100}%` }}
              ></div>
            </div>
            <p className="text-gray-500 text-xs">
              Loading vehicles in batches to ensure smooth performance...
            </p>
          </div>
        </div>

        {/* Show loaded vehicles so far */}
        <div className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((vehicle) => (
            <LiveVehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-gray-900 text-xl">Live Vehicle Dashboard</h2>
        </div>
        <div className="bg-red-50 p-6 border border-red-200 rounded-lg text-center">
          <p className="text-red-600">Error loading live vehicles: {error}</p>
          <Button
            onClick={refreshVehicles}
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
          <h2 className="font-semibold text-gray-900 text-xl">Live Vehicle Dashboard</h2>
          <p className="text-gray-600 text-sm">
            Real-time monitoring of all MacSteel vehicles
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
          {/* Connection status */}
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <div className="flex items-center space-x-1 text-green-600">
                <Wifi className="w-4 h-4" />
                <span className="font-medium text-sm">Live</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-red-600">
                <WifiOff className="w-4 h-4" />
                <span className="font-medium text-sm">Offline</span>
              </div>
            )}
          </div>
          
          <Button 
            onClick={refreshVehicles} 
            size="sm" 
            variant="outline"
            className="flex items-center space-x-2"
            disabled={isConnected}
          >
            <RefreshCw className="mr-2 w-4 h-4" />
            {isConnected ? 'Auto-updating' : 'Refresh'}
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
          onClick={() => setSelectedFilter('all')}
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
              ? 'bg-gradient-to-br from-green-100 to-green-200 border-green-300 ring-2 ring-green-400' 
              : 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
          }`}
          onClick={() => setSelectedFilter('active')}
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
          onClick={() => setSelectedFilter('stopped')}
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
              <MapPin className="mr-2 w-4 h-4" />
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
        <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-700 text-sm">
                Showing {selectedFilter === 'active' ? 'Active' : 'Stopped'} Vehicles:
              </span>
              <span className="bg-blue-100 px-2.5 py-0.5 rounded-full font-medium text-blue-800 text-xs">
                {filteredVehicles.length} of {vehicles.length}
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedFilter('all')}
              className="text-gray-600 hover:text-gray-800"
            >
              Show All Vehicles
            </Button>
          </div>
        </div>
      )}

      {/* Vehicle Cards */}
      <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredVehicles.length === 0 ? (
          <div className="col-span-full bg-gray-50 p-12 border border-gray-200 rounded-lg text-center">
            <p className="text-gray-500">
              {vehicles.length === 0 
                ? 'No live vehicles found.'
                : `No ${selectedFilter === 'active' ? 'active' : 'stopped'} vehicles found.`
              }
            </p>
          </div>
        ) : (
          filteredVehicles.map((vehicle) => (
            <LiveVehicleCard
              key={vehicle.id}
              vehicle={vehicle}
            />
          ))
        )}
      </div>
    </div>
  );
}


