'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

// Types for live vehicle data
export interface LiveVehicleData {
  id: number;
  plate: string;
  new_account_number: string;
  company: string;
  speed: string | null;
  latitude: string | null;
  longitude: string | null;
  loctime: string | null;
  quality: string | null;
  mileage: string | null;
  pocsagstr: string | null;
  head: string | null;
  geozone: string | null;
  drivername: string | null;
  nameevent: string | null;
  temperature: string | null;
  address: string | null;
}

// Types for WebSocket data
export interface WebSocketVehicleData {
  Plate: string;
  Speed: number;
  Latitude: number;
  Longitude: number;
  LocTime: string;
  Mileage: number;
  IP: string;
  Quality: string;
  Geozone: string;
  DriverName: string;
  Address: string;
  Statuses: string;
  Rules: string;
  CustomerDriverID: string;
  PlatformName: string;
}

interface LiveVehicleContextType {
  vehicles: LiveVehicleData[];
  isLoading: boolean;
  isProgressiveLoading: boolean;
  loadedCount: number;
  totalCount: number;
  error: string | null;
  isConnected: boolean;
  lastUpdate: Date | null;
  refreshVehicles: () => Promise<void>;
  getVehiclesByCostCenter: (accountNumber: string) => LiveVehicleData[];
  getVehicleByPlate: (plate: string) => LiveVehicleData | undefined;
}

const LiveVehicleContext = createContext<LiveVehicleContextType | undefined>(undefined);

export function LiveVehicleProvider({ children }: { children: ReactNode }) {
  const [vehicles, setVehicles] = useState<LiveVehicleData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProgressiveLoading, setIsProgressiveLoading] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);

  // Progressive loading function
  const loadVehiclesProgressively = useCallback(async (allVehicles: LiveVehicleData[]) => {
    const BATCH_SIZE = 10; // Load 10 vehicles at a time
    const DELAY_MS = 100; // 100ms delay between batches
    
    setIsProgressiveLoading(true);
    setLoadedCount(0);
    setTotalCount(allVehicles.length);
    setVehicles([]); // Clear existing vehicles
    
    for (let i = 0; i < allVehicles.length; i += BATCH_SIZE) {
      const batch = allVehicles.slice(i, i + BATCH_SIZE);
      
      // Add batch to vehicles
      setVehicles(prevVehicles => [...prevVehicles, ...batch]);
      setLoadedCount(i + batch.length);
      
      // Add delay between batches to prevent UI lag
      if (i + BATCH_SIZE < allVehicles.length) {
        await new Promise(resolve => setTimeout(resolve, DELAY_MS));
      }
    }
    
    setIsProgressiveLoading(false);
    setLastUpdate(new Date());
  }, []);

  // Fetch initial vehicle data
  const fetchInitialVehicles = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/macsteel-live');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        console.log('Initial vehicle data loaded:', data.data.length, 'vehicles');
        // Start progressive loading
        await loadVehiclesProgressively(data.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch vehicle data';
      setError(errorMessage);
      console.error('Error fetching initial vehicle data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [loadVehiclesProgressively]);

  // Setup WebSocket connection
  const setupWebSocket = useCallback(() => {
    try {
      const websocket = new WebSocket('ws://64.227.138.235:8000/latest');
      
      websocket.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
      };
      
      websocket.onmessage = (event) => {
        try {
          const data: WebSocketVehicleData = JSON.parse(event.data);
          console.log('WebSocket data received:', data);
          
          // Update vehicle data based on plate
          setVehicles(prevVehicles => {
            const updatedVehicles = [...prevVehicles];
            const vehicleIndex = updatedVehicles.findIndex(v => v.plate === data.Plate);
            
            if (vehicleIndex !== -1) {
              // Update existing vehicle
              updatedVehicles[vehicleIndex] = {
                ...updatedVehicles[vehicleIndex],
                speed: data.Speed.toString(),
                latitude: data.Latitude.toString(),
                longitude: data.Longitude.toString(),
                loctime: data.LocTime,
                quality: data.Quality,
                mileage: data.Mileage.toString(),
                geozone: data.Geozone,
                drivername: data.DriverName,
                address: data.Address,
              };
            } else {
              // Add new vehicle if not found (shouldn't happen but just in case)
              console.warn('Vehicle not found in initial data:', data.Plate);
            }
            
            return updatedVehicles;
          });
          
          setLastUpdate(new Date());
        } catch (err) {
          console.error('Error parsing WebSocket data:', err);
        }
      };
      
      websocket.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          if (!ws || ws.readyState === WebSocket.CLOSED) {
            setupWebSocket();
          }
        }, 5000);
      };
      
      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('WebSocket connection error');
        setIsConnected(false);
      };
      
      setWs(websocket);
    } catch (err) {
      console.error('Error setting up WebSocket:', err);
      setError('Failed to establish WebSocket connection');
    }
  }, [ws]);

  // Get vehicles by cost center account number
  const getVehiclesByCostCenter = useCallback((accountNumber: string): LiveVehicleData[] => {
    return vehicles.filter(vehicle => vehicle.new_account_number === accountNumber);
  }, [vehicles]);

  // Get vehicle by plate
  const getVehicleByPlate = useCallback((plate: string): LiveVehicleData | undefined => {
    return vehicles.find(vehicle => vehicle.plate === plate);
  }, [vehicles]);

  // Refresh vehicles manually
  const refreshVehicles = useCallback(async () => {
    await fetchInitialVehicles();
  }, [fetchInitialVehicles]);

  // Initialize data and WebSocket on mount
  useEffect(() => {
    fetchInitialVehicles();
    setupWebSocket();

    // Cleanup WebSocket on unmount
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  // Cleanup WebSocket when component unmounts
  useEffect(() => {
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [ws]);

  const value: LiveVehicleContextType = {
    vehicles,
    isLoading,
    isProgressiveLoading,
    loadedCount,
    totalCount,
    error,
    isConnected,
    lastUpdate,
    refreshVehicles,
    getVehiclesByCostCenter,
    getVehicleByPlate,
  };

  return (
    <LiveVehicleContext.Provider value={value}>
      {children}
    </LiveVehicleContext.Provider>
  );
}

export function useLiveVehicles() {
  const context = useContext(LiveVehicleContext);
  if (context === undefined) {
    throw new Error('useLiveVehicles must be used within a LiveVehicleProvider');
  }
  return context;
}


