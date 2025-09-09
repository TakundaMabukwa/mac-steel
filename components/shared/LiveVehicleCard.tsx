'use client';

import { MapPin, Gauge, Shield, Key, Thermometer, Clock, Car, Navigation, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LiveVehicleData } from '@/lib/context/LiveVehicleContext';

interface LiveVehicleCardProps {
  vehicle: LiveVehicleData;
  showHighlight?: boolean;
  className?: string;
}

export function LiveVehicleCard({ vehicle, showHighlight = false, className = '' }: LiveVehicleCardProps) {
  const isMoving = vehicle.speed && parseFloat(vehicle.speed) > 0;
  const hasLocation = vehicle.latitude && vehicle.longitude;
  
  return (
    <Card 
      className={`transition-all duration-500 border border-gray-200 bg-white hover:shadow-lg ${
        showHighlight ? 'ring-2 ring-blue-400 bg-blue-50 shadow-lg' : ''
      } ${className}`}
    >
      <CardHeader className="pb-3 border-gray-100 border-b">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="font-semibold text-gray-900 text-lg underline">
              {vehicle.plate || 'N/A'}
            </CardTitle>
            <div className="flex items-center space-x-2 mt-1">
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
              {isMoving ? 'Vehicle Moving' : 'Vehicle Stopped'}
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
              {isMoving ? 'On' : 'Off'}
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
        
        {hasLocation && (
          <div className="flex items-center space-x-3">
            <div className="flex justify-center items-center bg-cyan-100 rounded-full w-8 h-8">
              <MapPin className="w-4 h-4 text-cyan-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Location</p>
              <p className="text-gray-600 text-sm">
                {vehicle.address || `${vehicle.latitude}, ${vehicle.longitude}`}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


