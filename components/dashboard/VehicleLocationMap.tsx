'use client';

import { useEffect, useRef } from 'react';
import { X, Navigation, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { LiveVehicle } from '@/lib/actions/vehicles';

interface VehicleLocationMapProps {
  vehicle: LiveVehicle | null;
  isOpen: boolean;
  onClose: () => void;
}

export function VehicleLocationMap({ vehicle, isOpen, onClose }: VehicleLocationMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);

  // Load Mapbox GL JS
  useEffect(() => {
    if (!(window as any).mapboxgl) {
      const script = document.createElement('script');
      script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
      script.onload = () => {
        const link = document.createElement('link');
        link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      };
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (!isOpen || !vehicle || !mapContainer.current) return;

    console.log('VehicleLocationMap: Initializing for vehicle:', vehicle.plate);

    // Check if vehicle has valid coordinates
    const lat = parseFloat(vehicle.latitude || '0');
    const lng = parseFloat(vehicle.longitude || '0');
    const hasValidCoordinates = vehicle.latitude && vehicle.longitude && lat !== 0 && lng !== 0;

    console.log('VehicleLocationMap: Coordinates:', { lat, lng, hasValidCoordinates });

    if (!hasValidCoordinates) {
      console.log('VehicleLocationMap: No valid coordinates');
      return;
    }

    // Simple map initialization with delay
    const timer = setTimeout(() => {
      if (!mapContainer.current) {
        console.log('VehicleLocationMap: Container not available');
        return;
      }

      console.log('VehicleLocationMap: Creating map...');
      
      // Set Mapbox token
      (window as any).mapboxgl.accessToken = 'pk.eyJ1IjoicmVuZGFuaS1kZXYiLCJhIjoiY21kM2c3OXQ4MDJ6MjJqczlqbzNwcDZvaCJ9.6skTnPcXqD7h24o9mfuQnw';

      try {
        const map = new (window as any).mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v11',
          center: [lng, lat],
          zoom: 15
        });

        map.addControl(new (window as any).mapboxgl.NavigationControl(), 'top-right');

        map.on('load', () => {
          console.log('VehicleLocationMap: Map loaded successfully');
          
          // Add marker
          new (window as any).mapboxgl.Marker({ color: '#3b82f6' })
            .setLngLat([lng, lat])
            .addTo(map);

          // Add popup
          new (window as any).mapboxgl.Popup({ offset: 25 })
            .setLngLat([lng, lat])
            .setHTML(`
              <div class="p-2">
                <h3 class="font-semibold text-gray-900">${vehicle.plate || 'Unknown Vehicle'}</h3>
                <p class="text-gray-600 text-sm">${vehicle.drivername || 'Unknown Driver'}</p>
                <p class="text-gray-500 text-xs">Speed: ${vehicle.speed || '0'} km/h</p>
              </div>
            `)
            .addTo(map);
        });

        map.on('error', (e: any) => {
          console.error('VehicleLocationMap: Map error:', e);
        });

      } catch (error) {
        console.error('VehicleLocationMap: Error creating map:', error);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [isOpen, vehicle]);

  const handleDirections = () => {
    if (vehicle?.latitude && vehicle?.longitude) {
      const lat = parseFloat(vehicle.latitude);
      const lng = parseFloat(vehicle.longitude);
      if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
      }
    }
  };

  if (!vehicle) return null;

  const lat = parseFloat(vehicle.latitude || '0');
  const lng = parseFloat(vehicle.longitude || '0');
  const hasValidCoordinates = vehicle.latitude && vehicle.longitude && lat !== 0 && lng !== 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-6xl h-[80vh]">
        <DialogHeader className="p-6 pb-4">
          <DialogDescription>
            View the current location and details for vehicle {vehicle.plate || 'Unknown'}
          </DialogDescription>
          <div className="flex justify-between items-center">
            <DialogTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <span>Vehicle Location: {vehicle.plate || 'Unknown'}</span>
              {!hasValidCoordinates && (
                <span className="inline-flex items-center bg-red-100 px-2 py-0.5 rounded-full font-medium text-red-800 text-xs">
                  No GPS Data
                </span>
              )}
            </DialogTitle>
            <div className="flex items-center space-x-2">
              {hasValidCoordinates && (
                <Button
                  onClick={handleDirections}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Navigation className="mr-2 w-4 h-4" />
                  Get Directions
                </Button>
              )}
              <Button
                onClick={onClose}
                size="sm"
                variant="outline"
                className="hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="bg-gray-50 mt-4 p-3 rounded-lg">
            <div className="gap-4 grid grid-cols-2 md:grid-cols-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Driver:</span>
                <span className="ml-2 text-gray-600">{vehicle.drivername || 'Unknown'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Speed:</span>
                <span className="ml-2 text-gray-600">{vehicle.speed || '0'} km/h</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Status:</span>
                <span className="ml-2 text-gray-600">
                  {vehicle.speed && parseFloat(vehicle.speed) > 0 ? 'Moving' : 'Stopped'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Last Update:</span>
                <span className="ml-2 text-gray-600">
                  {vehicle.loctime ? new Date(vehicle.loctime).toLocaleString() : 'Unknown'}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 p-6 pt-0">
          {hasValidCoordinates ? (
            <div 
              ref={mapContainer} 
              className="border border-gray-200 rounded-lg w-full"
              style={{ width: '100%', height: '500px', borderRadius: '8px' }}
            />
          ) : (
            <div className="flex justify-center items-center bg-gray-50 rounded-lg h-full" style={{ minHeight: '500px' }}>
              <div className="text-center">
                <MapPin className="mx-auto mb-4 w-16 h-16 text-gray-400" />
                <h3 className="mb-2 font-medium text-gray-900 text-lg">Location Unavailable</h3>
                <p className="text-gray-600">This vehicle doesn&apos;t have valid GPS coordinates.</p>
                <p className="mt-1 text-gray-500 text-sm">Please check if the vehicle has an active GPS signal.</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
