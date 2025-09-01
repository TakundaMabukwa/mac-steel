'use client';

import { useState, useEffect } from 'react';
import { Calendar, Building2, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getVehicleReportsByAccountAndMonth, VehicleReport } from '@/lib/actions/macSteel';
import { CostCenterSelectSkeletonList } from './CostCenterSelectSkeleton';
import { DatePicker } from '@/components/ui/date-picker';
import { useStartTimeReports } from '@/lib/context/StartTimeReportsContext';

interface DailyReport {
  date: string;
  dayName: string;
  totalVehicles: number;
  onTimeVehicles: number;
  lateVehicles: number;
  onTimePercentage: number;
  latePercentage: number;
}

export function StartTimeReportsDashboard() {
  const { 
    costCenters, 
    isLoading, 
    isLoadingMore, 
    error, 
    hasMore, 
    totalCount, 
    isInitialized 
  } = useStartTimeReports();
  
  const [selectedCostCenter, setSelectedCostCenter] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<{ year: number; month: number } | undefined>();
  const [reports, setReports] = useState<VehicleReport[]>([]);
  const [dailyReports, setDailyReports] = useState<DailyReport[]>([]);
  const [isReportsLoading, setIsReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState<string | null>(null);

  // Load reports when cost center and date are selected
  useEffect(() => {
    if (selectedCostCenter && selectedDate) {
      const loadReports = async () => {
        try {
          setIsReportsLoading(true);
          setReportsError(null);
          const data = await getVehicleReportsByAccountAndMonth(
            selectedCostCenter, 
            selectedDate.month.toString(), 
            selectedDate.year.toString()
          );
          setReports(data);
          
          // Process reports into daily breakdown
          const dailyData = processDailyReports(data, selectedDate.year.toString(), selectedDate.month.toString());
          setDailyReports(dailyData);
        } catch (err) {
          setReportsError(err instanceof Error ? err.message : 'Failed to load reports');
          setReports([]);
          setDailyReports([]);
        } finally {
          setIsReportsLoading(false);
        }
      };

      loadReports();
    } else {
      setReports([]);
      setDailyReports([]);
    }
  }, [selectedCostCenter, selectedDate]);

  const processDailyReports = (reports: VehicleReport[], year: string, month: string): DailyReport[] => {
    const dailyData: DailyReport[] = [];

    // Group reports by date
    const reportsByDate = new Map<string, VehicleReport[]>();
    
    reports.forEach(report => {
      if (!report.month) return;
      const reportDate = new Date(report.month);
      const dateString = reportDate.toISOString().split('T')[0];
      
      if (!reportsByDate.has(dateString)) {
        reportsByDate.set(dateString, []);
      }
      reportsByDate.get(dateString)!.push(report);
    });

    // Process only dates that have reports
    reportsByDate.forEach((dayReports, dateString) => {
      const date = new Date(dateString);
      
      // Apply status determination rules based on reports table data
      // Rule 1: If daily = true, it's considered on-time
      // Rule 2: If daily = false or null, it's considered late
      const totalVehicles = dayReports.length;
      const onTimeVehicles = dayReports.filter(report => report.daily === true).length;
      const lateVehicles = totalVehicles - onTimeVehicles;
      const onTimePercentage = totalVehicles > 0 ? Math.round((onTimeVehicles / totalVehicles) * 100) : 0;
      const latePercentage = 100 - onTimePercentage;

      dailyData.push({
        date: dateString,
        dayName: date.toLocaleDateString('en-GB', { 
          day: '2-digit', 
          month: 'short', 
          year: 'numeric' 
        }) + ` - (${date.toLocaleDateString('en-US', { weekday: 'long' })})`,
        totalVehicles,
        onTimeVehicles,
        lateVehicles,
        onTimePercentage,
        latePercentage
      });
    });

    // Sort by date
    return dailyData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getRowBackgroundColor = (onTimePercentage: number) => {
    if (onTimePercentage === 0) return 'bg-red-50';
    if (onTimePercentage >= 50) return 'bg-green-50';
    return 'bg-yellow-50';
  };

  const getPercentageColor = (percentage: number, isOnTime: boolean) => {
    if (percentage === 0) return 'text-gray-900';
    if (isOnTime) return 'text-green-600';
    return 'text-red-600';
  };



  if (isLoading && !isInitialized) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex sm:flex-row flex-col justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-semibold text-gray-900 text-2xl">Start Time Reports Dashboard</h1>
            <p className="text-gray-600 text-sm">Vehicle punctuality reports by cost center</p>
          </div>
        </div>

        {/* Selection Controls with Skeleton */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-800" />
              <span>Report Selection</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CostCenterSelectSkeletonList count={3} />
          </CardContent>
        </Card>

        {/* Show loading message */}
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Calendar className="mx-auto mb-4 w-12 h-12 text-gray-400" />
              <h3 className="mb-2 font-medium text-gray-900 text-lg">Loading Cost Centers...</h3>
              <p className="text-gray-600">
                Please wait while we load the available cost centers.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !isInitialized) {
    return (
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
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex sm:flex-row flex-col justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-semibold text-gray-900 text-2xl">Start Time Reports Dashboard</h1>
          <p className="text-gray-600 text-sm">Vehicle punctuality reports by cost center</p>
        </div>
      </div>

      {/* Selection Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-800" />
            <span>Report Selection</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
                         {/* Cost Center Selection */}
             <div className="space-y-2">
               <div className="flex justify-between items-center">
                 <label className="block font-medium text-gray-700 text-sm">
                   Cost Center
                 </label>
                 {isLoadingMore && (
                   <div className="flex items-center space-x-2 text-gray-500 text-xs">
                     <div className="border border-t-transparent border-blue-600 rounded-full w-3 h-3 animate-spin"></div>
                     <span>Loading more...</span>
                   </div>
                 )}
               </div>
               <Select value={selectedCostCenter} onValueChange={setSelectedCostCenter}>
                 <SelectTrigger>
                   <SelectValue placeholder="Select cost center" />
                 </SelectTrigger>
                 <SelectContent>
                   {costCenters.map((center) => (
                     <SelectItem key={center.id} value={center.new_account_number || ''}>
                       <div className="flex items-center space-x-2">
                         <Building2 className="w-4 h-4 text-gray-500" />
                         <span>{center.company || center.new_account_number}</span>
                       </div>
                     </SelectItem>
                   ))}
                   {isLoadingMore && (
                     <div className="flex items-center space-x-2 px-2 py-1.5 text-gray-500 text-sm">
                       <div className="border border-gray-400 border-t-transparent rounded-full w-3 h-3 animate-spin"></div>
                       <span>Loading more cost centers...</span>
                     </div>
                   )}
                 </SelectContent>
               </Select>
             </div>

            {/* Date Selection */}
            <div className="space-y-2">
              <label className="block font-medium text-gray-700 text-sm">
                Month & Year
              </label>
              <DatePicker
                value={selectedDate}
                onChange={setSelectedDate}
                placeholder="Select month and year"
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table - Only show when cost center and date are selected */}
      {selectedCostCenter && selectedDate ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-800" />
              <span>Number of Vehicles on Time (Daily View)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
                         {isReportsLoading ? (
               <div className="space-y-4">
                 <div className="flex justify-center items-center py-4">
                   <div className="text-center">
                     <div className="mx-auto mb-2 border-b-2 border-blue-600 rounded-full w-6 h-6 animate-spin"></div>
                     <p className="text-gray-600 text-sm">Loading reports...</p>
                   </div>
                 </div>
                 {/* Table skeleton */}
                 <div className="overflow-x-auto">
                   <table className="w-full">
                     <thead>
                       <tr className="bg-blue-800">
                         <th className="px-4 py-3 font-semibold text-white text-sm text-left uppercase tracking-wider">
                           Date
                         </th>
                         <th className="px-4 py-3 font-semibold text-white text-sm text-center uppercase tracking-wider">
                           Number of vehicles
                         </th>
                         <th className="px-4 py-3 font-semibold text-white text-sm text-center uppercase tracking-wider">
                           Number of vehicles on time
                         </th>
                         <th className="px-4 py-3 font-semibold text-white text-sm text-center uppercase tracking-wider">
                           Number not on Time
                         </th>
                         <th className="px-4 py-3 font-semibold text-white text-sm text-center uppercase tracking-wider">
                           % on time
                         </th>
                         <th className="px-4 py-3 font-semibold text-white text-sm text-center uppercase tracking-wider">
                           % not on time
                         </th>
                       </tr>
                     </thead>
                     <tbody>
                       {Array.from({ length: 5 }).map((_, i) => (
                         <tr key={i} className="border-gray-200 border-b">
                           <td className="px-4 py-3">
                             <div className="bg-gray-200 rounded h-4 animate-pulse"></div>
                           </td>
                           <td className="px-4 py-3">
                             <div className="bg-gray-200 mx-auto rounded w-8 h-4 animate-pulse"></div>
                           </td>
                           <td className="px-4 py-3">
                             <div className="bg-gray-200 mx-auto rounded w-8 h-4 animate-pulse"></div>
                           </td>
                           <td className="px-4 py-3">
                             <div className="bg-gray-200 mx-auto rounded w-8 h-4 animate-pulse"></div>
                           </td>
                           <td className="px-4 py-3">
                             <div className="bg-gray-200 mx-auto rounded w-8 h-4 animate-pulse"></div>
                           </td>
                           <td className="px-4 py-3">
                             <div className="bg-gray-200 mx-auto rounded w-8 h-4 animate-pulse"></div>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               </div>
             ) : reportsError ? (
              <div className="bg-red-50 p-6 border border-red-200 rounded-lg text-center">
                <p className="text-red-600">Error loading reports: {reportsError}</p>
              </div>
            ) : dailyReports.length === 0 ? (
              <div className="bg-gray-50 p-8 border border-gray-200 rounded-lg text-center">
                <TrendingDown className="mx-auto mb-4 w-12 h-12 text-gray-400" />
                <h3 className="mb-2 font-medium text-gray-900 text-lg">Current Not Available</h3>
                <p className="text-gray-600">
                  No vehicle reports found for the selected cost center and time period.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-blue-800">
                      <th className="px-4 py-3 font-semibold text-white text-sm text-left uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 font-semibold text-white text-sm text-center uppercase tracking-wider">
                        Number of vehicles
                      </th>
                      <th className="px-4 py-3 font-semibold text-white text-sm text-center uppercase tracking-wider">
                        Number of vehicles on time
                      </th>
                      <th className="px-4 py-3 font-semibold text-white text-sm text-center uppercase tracking-wider">
                        Number not on Time
                      </th>
                      <th className="px-4 py-3 font-semibold text-white text-sm text-center uppercase tracking-wider">
                        % on time
                      </th>
                      <th className="px-4 py-3 font-semibold text-white text-sm text-center uppercase tracking-wider">
                        % not on time
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyReports.map((report, index) => (
                      <tr 
                        key={index} 
                        className={`border-b border-gray-200 ${getRowBackgroundColor(report.onTimePercentage)}`}
                      >
                        <td className="px-4 py-3 font-medium text-gray-900 text-sm">
                          {report.dayName}
                        </td>
                        <td className="px-4 py-3 text-gray-900 text-sm text-center">
                          {report.totalVehicles}
                        </td>
                        <td className="px-4 py-3 text-gray-900 text-sm text-center">
                          {report.onTimeVehicles}
                        </td>
                        <td className="px-4 py-3 text-gray-900 text-sm text-center">
                          {report.lateVehicles}
                        </td>
                        <td className={`px-4 py-3 text-sm font-medium text-center ${getPercentageColor(report.onTimePercentage, true)}`}>
                          {report.onTimePercentage}%
                        </td>
                        <td className={`px-4 py-3 text-sm font-medium text-center ${getPercentageColor(report.latePercentage, false)}`}>
                          {report.latePercentage}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Show message when selections are incomplete */
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Calendar className="mx-auto mb-4 w-12 h-12 text-gray-400" />
              <h3 className="mb-2 font-medium text-gray-900 text-lg">Select Report Parameters</h3>
                             <p className="text-gray-600">
                 Please select a cost center and month/year to view vehicle reports.
               </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
