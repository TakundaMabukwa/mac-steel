'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getMacSteelCostCentersForDropdownPaginated, CostCenterDropdown } from '@/lib/actions/macSteel';

interface StartTimeReportsContextType {
  costCenters: CostCenterDropdown[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  totalCount: number;
  isInitialized: boolean;
  refreshCostCenters: () => Promise<void>;
  loadMoreCostCenters: () => Promise<void>;
}

const StartTimeReportsContext = createContext<StartTimeReportsContextType | undefined>(undefined);

export function StartTimeReportsProvider({ children }: { children: ReactNode }) {
  const [costCenters, setCostCenters] = useState<CostCenterDropdown[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const loadInitialCostCenters = async () => {
    if (isInitialized) return; // Don't reload if already initialized
    
    try {
      setIsLoading(true);
      setError(null);
      
              // Load first 10 items immediately
        const result = await getMacSteelCostCentersForDropdownPaginated(1, 10);
      setCostCenters(result.data);
      setHasMore(result.hasMore);
      setTotalCount(result.total);
      setCurrentPage(1);
      setIsInitialized(true);
      
      // Continue loading the rest in background if there are more items
      if (result.hasMore) {
        loadRemainingCostCenters(2);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cost centers');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRemainingCostCenters = async (startPage: number) => {
    try {
      setIsLoadingMore(true);
      let page = startPage;
      let allData = [...costCenters];
      
              while (true) {
          const result = await getMacSteelCostCentersForDropdownPaginated(page, 10);
        allData = [...allData, ...result.data];
        
        if (!result.hasMore) {
          break;
        }
        page++;
      }
      
      setCostCenters(allData);
      setHasMore(false);
    } catch (err) {
      console.error('Error loading remaining cost centers:', err);
      // Don't set error state for background loading failures
    } finally {
      setIsLoadingMore(false);
    }
  };

  const refreshCostCenters = async () => {
    setIsInitialized(false);
    setCostCenters([]);
    setCurrentPage(1);
    setHasMore(true);
    setTotalCount(0);
    await loadInitialCostCenters();
  };

  const loadMoreCostCenters = async () => {
    if (!hasMore || isLoadingMore) return;
    
    try {
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;
      const result = await getMacSteelCostCentersForDropdownPaginated(nextPage, 10);
      
      setCostCenters(prev => [...prev, ...result.data]);
      setHasMore(result.hasMore);
      setCurrentPage(nextPage);
    } catch (err) {
      console.error('Error loading more cost centers:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    loadInitialCostCenters();
  }, []);

  const value: StartTimeReportsContextType = {
    costCenters,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    totalCount,
    isInitialized,
    refreshCostCenters,
    loadMoreCostCenters,
  };

  return (
    <StartTimeReportsContext.Provider value={value}>
      {children}
    </StartTimeReportsContext.Provider>
  );
}

export function useStartTimeReports() {
  const context = useContext(StartTimeReportsContext);
  if (context === undefined) {
    throw new Error('useStartTimeReports must be used within a StartTimeReportsProvider');
  }
  return context;
}
