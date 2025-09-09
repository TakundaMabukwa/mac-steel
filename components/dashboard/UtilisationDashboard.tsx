'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useCostCenters } from '@/lib/context/CostCenterContext';
import { CostCenterSkeleton } from './CostCenterSkeleton';
import { MacSteelCostCenter } from '@/lib/actions/costCenters';
import { LiveVehicleDetails } from './LiveVehicleDetails';
import { CompactTable } from '@/components/shared/CompactTable';
import { useLiveVehicles, LiveVehicleData, WebSocketVehicleData } from '@/lib/context/LiveVehicleContext';

export function UtilisationDashboard() {
  const { costCenters, isLoading, error, selectedCostCenter, setSelectedCostCenter } = useCostCenters();
  const { vehicles: liveVehicles, getVehiclesByCostCenter } = useLiveVehicles();
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const hasInitialized = useRef(false);

  // Set up WebSocket connection
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const setupWebSocket = () => {
      try {
        const websocket = new WebSocket('ws://64.227.138.235:8000/latest');
        
        websocket.onopen = () => {
          console.log('WebSocket connected in UtilisationDashboard');
          setIsConnected(true);
        };
        
        websocket.onmessage = (event) => {
          try {
            const data: WebSocketVehicleData = JSON.parse(event.data);
            console.log('WebSocket data received in UtilisationDashboard:', data);
            
            // Update vehicles in the LiveVehicleContext by plate
            // The context will handle the actual state updates
            setLastUpdate(new Date());
          } catch (err) {
            console.error('Error parsing WebSocket data in UtilisationDashboard:', err);
          }
        };
        
        websocket.onclose = () => {
          console.log('WebSocket disconnected in UtilisationDashboard');
          setIsConnected(false);
          // Attempt to reconnect after 5 seconds
          setTimeout(() => {
            if (!ws || ws.readyState === WebSocket.CLOSED) {
              setupWebSocket();
            }
          }, 5000);
        };
        
        websocket.onerror = (error) => {
          console.error('WebSocket error in UtilisationDashboard:', error);
          setIsConnected(false);
        };
        
        setWs(websocket);
      } catch (err) {
        console.error('Error setting up WebSocket in UtilisationDashboard:', err);
      }
    };

    setupWebSocket();

    // Cleanup WebSocket on unmount
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const handleViewCostCenter = (costCenter: MacSteelCostCenter) => {
    setSelectedCostCenter(costCenter);
  };

  const handleBackToTable = () => {
    setSelectedCostCenter(null);
  };

  if (isLoading) {
    return <CostCenterSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-gray-900 text-xl">Utilisation Dashboard</h2>
        </div>
        <div className="bg-red-50 p-6 border border-red-200 rounded-lg text-center">
          <p className="text-red-600">Error loading cost centers: {error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4"
            variant="outline"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (selectedCostCenter) {
    return (
      <LiveVehicleDetails
        costCenter={selectedCostCenter}
        onBack={handleBackToTable}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-semibold text-gray-900 text-xl">Utilisation Dashboard</h2>
          <div className="flex items-center space-x-4 mt-1">
            <div className="text-gray-600 text-sm">
              Select a cost center to view live vehicle data
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className={`text-xs ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                {isConnected ? 'Live Updates' : 'Offline'}
              </span>
              {lastUpdate && (
                <span className="text-gray-500 text-xs">
                  Last update: {lastUpdate.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cost Centers Table using CompactTable */}
      <CompactTable
        data={costCenters}
        columns={[
          {
            key: 'company',
            label: 'Company',
            align: 'left' as const,
            render: (item: MacSteelCostCenter) => item.company || 'Unknown Company'
          },
          {
            key: 'geozone',
            label: 'Geozone',
            align: 'left' as const,
            render: (item: MacSteelCostCenter) => item.geozone
          }
        ]}
        title="Cost Centers"
        searchPlaceholder="Search cost centers..."
        showDownload={true}
        showColumns={true}
        onViewCostCenter={handleViewCostCenter}
      />
    </div>
  );
}