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
      className={`transition-all duration-500 border border-macsteel-200 bg-white hover:shadow-xl hover:scale-105 ${
        showHighlight ? 'ring-2 ring-macsteel-400 bg-macsteel-50 shadow-xl' : ''
      } ${className}`}
    >
      <CardHeader className="bg-gradient-to-r from-macsteel-50 to-white pb-3 border-macsteel-100 border-b">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="font-bold text-macsteel-900 text-lg">
              {vehicle.plate || 'N/A'}
            </CardTitle>
            <div className="flex items-center space-x-2 mt-1">
              <div className="flex justify-center items-center bg-success-100 rounded-full w-5 h-5">
                <Shield className="w-3 h-3 text-success-600" />
              </div>
              <span className="font-medium text-success-600 text-xs">Secure</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-4">
        <div className="flex items-center space-x-3">
          <div className="flex justify-center items-center bg-macsteel-100 rounded-lg w-8 h-8">
            <Car className="w-4 h-4 text-macsteel-600" />
          </div>
          <div>
            <p className="font-semibold text-steel-900 text-sm">Driver</p>
            <p className="text-steel-600 text-sm">{vehicle.drivername || vehicle.plate || 'N/A'}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex justify-center items-center bg-success-100 rounded-lg w-8 h-8">
            <MapPin className="w-4 h-4 text-success-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-steel-900 text-sm">Geo Zone</p>
            <div className="text-steel-600 text-sm leading-tight">
              {vehicle.geozone ? (
                <div 
                  className="overflow-hidden"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    lineHeight: '1.25rem',
                    maxHeight: '2.5rem'
                  }}
                >
                  {vehicle.geozone}
                </div>
              ) : (
                'N/A'
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex justify-center items-center bg-purple-100 rounded-lg w-8 h-8">
            <Gauge className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <p className="font-semibold text-steel-900 text-sm">CPK</p>
            <p className="text-steel-600 text-sm">0 Km/l</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex justify-center items-center bg-warning-100 rounded-lg w-8 h-8">
            <Navigation className="w-4 h-4 text-warning-600" />
          </div>
          <div>
            <p className="font-semibold text-steel-900 text-sm">Odo</p>
            <p className="text-steel-600 text-sm">{vehicle.mileage || 'N/A'}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className={`flex justify-center items-center rounded-lg w-8 h-8 ${
            isMoving ? 'bg-success-100' : 'bg-red-100'
          }`}>
            <Shield className={`w-4 h-4 ${
              isMoving ? 'text-success-600' : 'text-red-600'
            }`} />
          </div>
          <div>
            <p className="font-semibold text-steel-900 text-sm">Safety Info</p>
            <p className={`text-sm font-medium ${
              isMoving ? 'text-success-600' : 'text-red-600'
            }`}>
              {isMoving ? 'Vehicle Moving' : 'Vehicle Stopped'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className={`flex justify-center items-center rounded-lg w-8 h-8 ${
            isMoving ? 'bg-success-100' : 'bg-warning-100'
          }`}>
            <Key className={`w-4 h-4 ${
              isMoving ? 'text-success-600' : 'text-warning-600'
            }`} />
          </div>
          <div>
            <p className="font-semibold text-steel-900 text-sm">Engine</p>
            <p className={`text-sm font-medium ${
              isMoving ? 'text-success-600' : 'text-warning-600'
            }`}>
              {isMoving ? 'On' : 'Off'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex justify-center items-center bg-macsteel-100 rounded-lg w-8 h-8">
            <Zap className="w-4 h-4 text-macsteel-600" />
          </div>
          <div>
            <p className="font-semibold text-steel-900 text-sm">Speed</p>
            <p className="font-medium text-steel-600 text-sm">
              {vehicle.speed ? `${vehicle.speed} km/h` : '0 km/h'}
            </p>
          </div>
        </div>
        
        {vehicle.temperature && (
          <div className="flex items-center space-x-3">
            <div className="flex justify-center items-center bg-pink-100 rounded-lg w-8 h-8">
              <Thermometer className="w-4 h-4 text-pink-600" />
            </div>
            <div>
              <p className="font-semibold text-steel-900 text-sm">Temperature</p>
              <p className="font-medium text-steel-600 text-sm">{vehicle.temperature}°C</p>
            </div>
          </div>
        )}
        
        {vehicle.loctime && (
          <div className="flex items-center space-x-3">
            <div className="flex justify-center items-center bg-steel-100 rounded-lg w-8 h-8">
              <Clock className="w-4 h-4 text-steel-600" />
            </div>
            <div>
              <p className="font-semibold text-steel-900 text-sm">Last Update</p>
              <p className="font-medium text-steel-600 text-sm">
                {new Date(vehicle.loctime).toLocaleTimeString()}
              </p>
            </div>
          </div>
        )}
        
        {hasLocation && (
          <div className="flex items-center space-x-3">
            <div className="flex justify-center items-center bg-cyan-100 rounded-lg w-8 h-8">
              <MapPin className="w-4 h-4 text-cyan-600" />
            </div>
            <div>
              <p className="font-semibold text-steel-900 text-sm">Location</p>
              <p className="font-medium text-steel-600 text-sm">
                {vehicle.address || `${vehicle.latitude}, ${vehicle.longitude}`}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


