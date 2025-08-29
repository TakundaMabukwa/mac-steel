'use client';

import { Car, MapPin, Activity, Gauge, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Vehicle } from '@/types/dashboard';
import { cn } from '@/lib/utils';

interface VehicleCardProps {
  vehicle: Vehicle;
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  const getStatusColor = (status: Vehicle['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="bg-white shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-gray-900">
            {vehicle.registration}
          </CardTitle>
          <Lock className="h-5 w-5 text-gray-400" />
        </div>
        <Badge className={cn("w-fit", getStatusColor(vehicle.status))}>
          {vehicle.status.toUpperCase()}
        </Badge>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center space-x-3">
            <Car className="h-4 w-4 text-blue-600" />
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-700">Driver:</span>
              <span className="ml-2 text-sm text-gray-900">
                {vehicle.driver || 'No Driver'}
              </span>
            </div>
          </div>
          
          {vehicle.geoZone && (
            <div className="flex items-center space-x-3">
              <MapPin className="h-4 w-4 text-green-600" />
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-700">Geo Zone:</span>
                <span className="ml-2 text-sm text-gray-900">{vehicle.geoZone}</span>
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-3">
            <Activity className="h-4 w-4 text-blue-600" />
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-700">CPK:</span>
              <span className="ml-2 text-sm text-gray-900">{vehicle.cpk} Km/l</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Gauge className="h-4 w-4 text-blue-600" />
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-700">Odo:</span>
              <span className="ml-2 text-sm text-gray-900">{vehicle.odo.toLocaleString()}</span>
            </div>
          </div>
          
          {vehicle.safetyInfo && (
            <div className="flex items-start space-x-3">
              <div className="h-4 w-4 mt-0.5 rounded-full bg-blue-600 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-white"></div>
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-700">Safety info:</span>
                <span className="ml-2 text-sm text-gray-900">{vehicle.safetyInfo}</span>
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-3">
            <Car className="h-4 w-4 text-blue-600" />
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-700">Engine:</span>
              <span className={cn(
                "ml-2 text-sm font-medium",
                vehicle.engineOn ? "text-green-600" : "text-red-600"
              )}>
                {vehicle.engineOn ? 'On' : 'Off'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Gauge className="h-4 w-4 text-blue-600" />
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-700">Speed:</span>
              <span className="ml-2 text-sm text-gray-900">{vehicle.speed} Km/h</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}