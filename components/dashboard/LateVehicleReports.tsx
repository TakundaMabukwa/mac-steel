'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, Car, TrendingDown, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getLateVehicleReportsByCostCenterAndDate, LateVehicleReport } from '@/lib/actions/vehicles';
import { MacSteelCostCenter } from '@/lib/actions/costCenters';

interface LateVehicleReportsProps {
  costCenter: MacSteelCostCenter;
  onBack: () => void;
}

export function LateVehicleReports({ costCenter, onBack }: LateVehicleReportsProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [reports, setReports] = useState<LateVehicleReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Get today's date for minimum date restriction
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const fetchReports = useCallback(async () => {
    if (!costCenter.new_account_number || !selectedDate) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const dateString = selectedDate.toISOString().split('T')[0];
      const reportData = await getLateVehicleReportsByCostCenterAndDate(
        costCenter.new_account_number, 
        dateString
      );
      setReports(reportData);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reports');
    } finally {
      setIsLoading(false);
    }
  }, [costCenter.new_account_number, selectedDate]);

  // Fetch reports when date changes
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Calculate stats from report data
  const totalVehicles = reports.length;
  const vehiclesNotOnTime = reports.filter(report => 
    report.status === 'not_on_time' || report.status === 'late'
  ).length;
  const vehiclesOnTime = totalVehicles - vehiclesNotOnTime;
  
  const onTimePercentage = totalVehicles > 0 ? Math.round((vehiclesOnTime / totalVehicles) * 100) : 0;
  const notOnTimePercentage = 100 - onTimePercentage;

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-semibold text-gray-900 text-xl">
              Late Vehicle Reports - {costCenter.company || 'Unknown Company'}
            </h2>
            <p className="text-gray-600 text-sm">
              Geozone: {costCenter.geozone}
            </p>
          </div>
          <Button onClick={onBack} variant="outline">
            Back to Cost Centers
          </Button>
        </div>
        
        {/* Stats Cards Skeleton */}
        <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="bg-white border border-gray-200">
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                  <Skeleton className="w-4 h-4" />
                  <Skeleton className="w-32 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="w-16 h-8" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Table Skeleton */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 p-4 border-gray-200 border-b">
            <Skeleton className="w-32 h-6" />
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <Skeleton className="w-16 h-4" />
                  <Skeleton className="w-24 h-4" />
                  <Skeleton className="w-24 h-4" />
                  <Skeleton className="w-24 h-4" />
                  <Skeleton className="w-24 h-4" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-gray-900 text-xl">Late Vehicle Reports</h2>
          <Button onClick={onBack} variant="outline">
            Back to Cost Centers
          </Button>
        </div>
        <div className="bg-red-50 p-6 border border-red-200 rounded-lg text-center">
          <p className="text-red-600">Error loading reports: {error}</p>
          <Button 
            onClick={fetchReports} 
            className="mt-4"
            variant="outline"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-semibold text-gray-900 text-xl">
            Late Vehicle Reports - {costCenter.company || 'Unknown Company'}
          </h2>
          <p className="text-gray-600 text-sm">
            Geozone: {costCenter.geozone}
          </p>
          {lastUpdate && (
            <p className="mt-1 text-gray-500 text-xs">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            onClick={fetchReports} 
            size="sm" 
            variant="outline"
            className="flex items-center space-x-2"
          >
            <RefreshCw className="mr-2 w-4 h-4" />
            Refresh
          </Button>
          <Button onClick={onBack} variant="outline">
            Back to Cost Centers
          </Button>
        </div>
      </div>

      {/* Date Selection */}
      <div className="bg-white p-4 border border-gray-200 rounded-lg">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-700">Select Date:</span>
          </div>
          <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => {
              const newDate = new Date(e.target.value);
              if (newDate >= today) {
                setSelectedDate(newDate);
              }
            }}
            min={today.toISOString().split('T')[0]}
            className="px-3 py-2 border border-gray-300 focus:border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white border border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center font-medium text-gray-600 text-sm">
              <Car className="mr-2 w-4 h-4" />
              Total Vehicles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-gray-900 text-2xl">{totalVehicles}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center font-medium text-gray-600 text-sm">
              <Clock className="mr-2 w-4 h-4" />
              Vehicles On Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-green-600 text-2xl">{vehiclesOnTime}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center font-medium text-gray-600 text-sm">
              <TrendingDown className="mr-2 w-4 h-4 text-red-600" />
              Vehicles Not On Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-red-600 text-2xl">{vehiclesNotOnTime}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center font-medium text-gray-600 text-sm">
              <TrendingDown className="mr-2 w-4 h-4 text-red-600" />
              Not On Time %
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="font-bold text-red-600 text-2xl">{notOnTimePercentage}%</div>
              <div className="relative border-4 border-gray-200 rounded-full w-12 h-12">
                <div 
                  className="border-4 border-red-500 rounded-full w-12 h-12"
                  style={{
                    background: `conic-gradient(#ef4444 ${notOnTimePercentage * 3.6}deg, transparent 0deg)`
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Reports Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 p-4 border-gray-200 border-b">
          <h3 className="font-semibold text-gray-900 text-lg">
            Late Vehicle Reports for {selectedDate.toLocaleDateString()}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-macsteel-100">
              <tr>
                <th className="px-6 py-3 font-medium text-macsteel-700 text-xs text-left uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 font-medium text-macsteel-700 text-xs text-left uppercase tracking-wider">
                  Vehicle Registration
                </th>
                <th className="px-6 py-3 font-medium text-macsteel-700 text-xs text-left uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 font-medium text-macsteel-700 text-xs text-left uppercase tracking-wider">
                  Start Time
                </th>
                <th className="px-6 py-3 font-medium text-macsteel-700 text-xs text-left uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 font-medium text-macsteel-700 text-xs text-left uppercase tracking-wider">
                  Created At
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-gray-500 text-center">
                    No late vehicle reports found for {selectedDate.toLocaleDateString()}.
                  </td>
                </tr>
              ) : (
                reports.map((report) => {
                  const isLate = report.status === 'not_on_time' || report.status === 'late';
                  return (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isLate ? (
                          <div className="flex items-center space-x-2">
                            <div className="bg-red-500 rounded-full w-3 h-3" />
                            <span className="font-medium text-red-600 text-xs">Not On Time</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <div className="bg-green-500 rounded-full w-3 h-3" />
                            <span className="font-medium text-green-600 text-xs">On Time</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 text-sm whitespace-nowrap">
                        {report.plate || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm whitespace-nowrap">
                        {report.company || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm whitespace-nowrap">
                        {report.start_time ? new Date(report.start_time).toLocaleTimeString() : 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm whitespace-nowrap">
                        {report.reason || '-'}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm whitespace-nowrap">
                        {report.created_at ? new Date(report.created_at).toLocaleString() : 'Unknown'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
