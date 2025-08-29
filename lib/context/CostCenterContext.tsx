'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCostCenters, MacSteelCostCenter } from '@/lib/actions/costCenters';
import { getAllVehiclesWithStartTime, Vehicle } from '@/lib/actions/vehicles';

interface CostCenterContextType {
  costCenters: MacSteelCostCenter[];
  isLoading: boolean;
  error: string | null;
  refreshCostCenters: () => Promise<void>;
  getVehiclesForCostCenter: (accountNumber: string) => Promise<Vehicle[]>;
  isVehicleLoading: Record<string, boolean>;
}

const CostCenterContext = createContext<CostCenterContextType | undefined>(undefined);

export function CostCenterProvider({ children }: { children: ReactNode }) {
  const [costCenters, setCostCenters] = useState<MacSteelCostCenter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVehicleLoading, setIsVehicleLoading] = useState<Record<string, boolean>>({});

  const fetchCostCenters = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getCostCenters();
      setCostCenters(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cost centers');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshCostCenters = async () => {
    await fetchCostCenters();
  };

  const getVehiclesForCostCenter = async (accountNumber: string): Promise<Vehicle[]> => {
    setIsVehicleLoading(prev => ({ ...prev, [accountNumber]: true }));

    try {
      const vehicles = await getAllVehiclesWithStartTime(accountNumber);
      return vehicles;
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      throw err;
    } finally {
      setIsVehicleLoading(prev => ({ ...prev, [accountNumber]: false }));
    }
  };

  useEffect(() => {
    fetchCostCenters();
  }, []);

  const value: CostCenterContextType = {
    costCenters,
    isLoading,
    error,
    refreshCostCenters,
    getVehiclesForCostCenter,
    isVehicleLoading,
  };

  return (
    <CostCenterContext.Provider value={value}>
      {children}
    </CostCenterContext.Provider>
  );
}

export function useCostCenters() {
  const context = useContext(CostCenterContext);
  if (context === undefined) {
    throw new Error('useCostCenters must be used within a CostCenterProvider');
  }
  return context;
}
