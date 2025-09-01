'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Navigation, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { LiveVehicle } from '@/lib/actions/vehicles';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface VehicleLocationMapProps {
  vehicle: LiveVehicle | null;
  isOpen: boolean;
  onClose: () => void;
}

export function VehicleLocationMap({ vehicle, isOpen, onClose }: VehicleLocationMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);

  console.log('VehicleLocationMap: Component rendered', { 
    isOpen, 
    vehicle: vehicle?.plate, 
    hasVehicle: !!vehicle,
    container: !!mapContainer.current 
  });

  // Ensure Mapbox CSS is loaded
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.14.0/mapbox-gl.css';
    link.rel = 'stylesheet';
    link.type = 'text/css';
    
    // Check if the CSS is already loaded
    const existingLink = document.querySelector('link[href*="mapbox-gl.css"]');
    if (!existingLink) {
      document.head.appendChild(link);
      console.log('VehicleLocationMap: Added Mapbox CSS dynamically');
    } else {
      console.log('VehicleLocationMap: Mapbox CSS already loaded');
    }
    
    // Also check if mapboxgl is available
    console.log('VehicleLocationMap: Mapbox GL JS available:', typeof mapboxgl !== 'undefined');
    console.log('VehicleLocationMap: Mapbox GL JS version:', mapboxgl?.version || 'Unknown');
  }, []);

  useEffect(() => {
    console.log('VehicleLocationMap: useEffect triggered', { isOpen, vehicle: !!vehicle, container: !!mapContainer.current });
    
    if (!isOpen || !vehicle || !mapContainer.current) {
      console.log('VehicleLocationMap: Early return - missing requirements', { isOpen, vehicle: !!vehicle, container: !!mapContainer.current });
      return;
    }

    setMapLoading(true);
    setMapError(null);

    console.log('VehicleLocationMap: Initializing for vehicle:', vehicle.plate);

    // Check if vehicle has valid coordinates
    const lat = parseFloat(vehicle.latitude || '0');
    const lng = parseFloat(vehicle.longitude || '0');
    const hasValidCoordinates = vehicle.latitude && vehicle.longitude && 
      !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0 &&
      lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;

    console.log('VehicleLocationMap: Raw coordinates:', { 
      rawLat: vehicle.latitude, 
      rawLng: vehicle.longitude,
      parsedLat: lat, 
      parsedLng: lng, 
      hasValidCoordinates 
    });

    // Clean up existing map instance
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    // Set Mapbox token
    mapboxgl.accessToken = 'pk.eyJ1IjoicmVuZGFuaS1kZXYiLCJhIjoiY21kM2c3OXQ4MDJ6MjJqczlqbzNwcDZvaCJ9.6skTnPcXqD7h24o9mfuQnw';
    console.log('VehicleLocationMap: Token set to:', mapboxgl.accessToken);

    // Simple map initialization with delay
    const timer = setTimeout(() => {
      if (!mapContainer.current) {
        console.log('VehicleLocationMap: Container not available');
        return;
      }

      console.log('VehicleLocationMap: Creating map...');
      console.log('VehicleLocationMap: Mapbox available:', typeof mapboxgl !== 'undefined');
      console.log('VehicleLocationMap: Mapbox access token:', mapboxgl.accessToken ? 'Set' : 'Not set');
      console.log('VehicleLocationMap: Access token value:', mapboxgl.accessToken);
      console.log('VehicleLocationMap: Container element:', mapContainer.current);
      console.log('VehicleLocationMap: Container dimensions:', {
        width: mapContainer.current.offsetWidth,
        height: mapContainer.current.offsetHeight,
        clientWidth: mapContainer.current.clientWidth,
        clientHeight: mapContainer.current.clientHeight
      });

      // Ensure container has proper dimensions
      if (mapContainer.current.offsetWidth === 0 || mapContainer.current.offsetHeight === 0) {
        console.log('VehicleLocationMap: Container has zero dimensions, setting explicit size');
        mapContainer.current.style.width = '100%';
        mapContainer.current.style.height = '500px';
      }

      try {
        console.log('VehicleLocationMap: Attempting to create map with config:', {
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v11',
          center: hasValidCoordinates ? [lng, lat] : [28.0473, -26.2041],
          zoom: 15,
          accessToken: mapboxgl.accessToken
        });

        const map = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v11',
          center: hasValidCoordinates ? [lng, lat] : [28.0473, -26.2041], // Use fallback if no valid coords
          zoom: 15
        });

        // Store map instance for cleanup
        mapInstance.current = map;

        map.addControl(new mapboxgl.NavigationControl(), 'top-right');

        map.on('load', () => {
          console.log('VehicleLocationMap: Map loaded successfully');
          console.log('VehicleLocationMap: Map style loaded:', map.isStyleLoaded());
          console.log('VehicleLocationMap: Map container style:', {
            width: mapContainer.current?.style.width,
            height: mapContainer.current?.style.height,
            display: mapContainer.current?.style.display,
            visibility: mapContainer.current?.style.visibility
          });
          
          setMapLoading(false);
          
          // Force a resize to ensure the map renders properly
          setTimeout(() => {
            map.resize();
            console.log('VehicleLocationMap: Map resized');
          }, 100);
          
          // Add marker
          const markerCoords: [number, number] = hasValidCoordinates ? [lng, lat] : [28.0473, -26.2041];
          new mapboxgl.Marker({ color: hasValidCoordinates ? '#3b82f6' : '#ef4444' })
            .setLngLat(markerCoords)
            .addTo(map);

          // Add popup
          new mapboxgl.Popup({ offset: 25 })
            .setLngLat(markerCoords)
            .setHTML(`
              <div class="p-2">
                <h3 class="font-semibold text-gray-900">${vehicle.plate || 'Unknown Vehicle'}</h3>
                <p class="text-gray-600 text-sm">${vehicle.drivername || 'Unknown Driver'}</p>
                <p class="text-gray-500 text-xs">Speed: ${vehicle.speed || '0'} km/h</p>
                ${!hasValidCoordinates ? '<p class="text-red-500 text-xs">No GPS coordinates - showing fallback location</p>' : ''}
              </div>
            `)
            .addTo(map);
        });

        map.on('error', (e) => {
          console.error('VehicleLocationMap: Map error:', e);
          setMapError('Failed to load map');
          setMapLoading(false);
        });

        map.on('style.load', () => {
          console.log('VehicleLocationMap: Map style loaded');
        });

        map.on('render', () => {
          console.log('VehicleLocationMap: Map rendered');
        });

      } catch (error) {
        console.error('VehicleLocationMap: Error creating map:', error);
        setMapError('Failed to create map');
        setMapLoading(false);
      }
    }, 300);

    // Add a timeout to handle cases where map doesn't load
    const loadTimeout = setTimeout(() => {
      console.log('VehicleLocationMap: Map loading timeout');
      setMapError('Map failed to load within timeout period');
      setMapLoading(false);
    }, 10000); // 10 second timeout

    return () => {
      clearTimeout(timer);
      clearTimeout(loadTimeout);
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [isOpen, vehicle]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

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
  const hasValidCoordinates = vehicle.latitude && vehicle.longitude && 
    !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0 &&
    lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;

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
          <div className="relative">
            <div 
              ref={mapContainer} 
              className="bg-gray-100 border border-gray-200 rounded-lg w-full"
              style={{ width: '100%', height: '500px', borderRadius: '8px', minHeight: '500px' }}
            />
            {mapLoading && (
              <div className="absolute inset-0 flex justify-center items-center bg-gray-100 rounded-lg">
                <div className="text-center">
                  <div className="mx-auto mb-2 border-b-2 border-blue-600 rounded-full w-8 h-8 animate-spin"></div>
                  <p className="text-gray-600 text-sm">Loading map...</p>
                </div>
              </div>
            )}
            {mapError && (
              <div className="absolute inset-0 flex justify-center items-center bg-red-50 rounded-lg">
                <div className="text-center">
                  <p className="text-red-600 text-sm">{mapError}</p>
                  <p className="mt-1 text-red-500 text-xs">Check console for details</p>
                </div>
              </div>
            )}
          </div>
          {!hasValidCoordinates && (
            <div className="bg-yellow-50 mt-2 p-3 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <strong>Note:</strong> This vehicle doesn&apos;t have valid GPS coordinates. 
                Showing fallback location for testing purposes.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
