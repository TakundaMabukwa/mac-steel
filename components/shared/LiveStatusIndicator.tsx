'use client';

import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useLiveVehicles } from '@/lib/context/LiveVehicleContext';

interface LiveStatusIndicatorProps {
  showText?: boolean;
  className?: string;
}

export function LiveStatusIndicator({ showText = true, className = '' }: LiveStatusIndicatorProps) {
  const { isConnected, isLoading, lastUpdate } = useLiveVehicles();

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {isConnected ? (
        <div className="flex items-center space-x-1 text-success-600">
          <Wifi className="w-4 h-4" />
          {showText && <span className="font-medium text-sm">Live</span>}
        </div>
      ) : isLoading ? (
        <div className="flex items-center space-x-1 text-warning-600">
          <RefreshCw className="w-4 h-4 animate-spin" />
          {showText && <span className="font-medium text-sm">Connecting...</span>}
        </div>
      ) : (
        <div className="flex items-center space-x-1 text-red-600">
          <WifiOff className="w-4 h-4" />
          {showText && <span className="font-medium text-sm">Offline</span>}
        </div>
      )}
      
      {lastUpdate && showText && (
        <span className="text-steel-500 text-xs">
          Last update: {lastUpdate.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}


