'use client';

import { useState, useEffect } from 'react';
import { FileText, Building2, MapPin, Eye, Download, Fuel } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCostCenters } from '@/lib/context/CostCenterContext';
import { CostCenterSkeleton } from './CostCenterSkeleton';
import { MacSteelCostCenter } from '@/lib/actions/costCenters';
import { Report, getReportsByAccountNumber, getLatestDailyReport, getLatestWeeklyReport, getLatestMonthlyReport } from '@/lib/actions/reports';
import { CompactTable } from '@/components/shared/CompactTable';

export function ReportingDashboard() {
  const { costCenters, isLoading, error } = useCostCenters();
  const [selectedCostCenter, setSelectedCostCenter] = useState<MacSteelCostCenter | null>(null);
  const [dailyReport, setDailyReport] = useState<Report | null>(null);
  const [weeklyReport, setWeeklyReport] = useState<Report | null>(null);
  const [monthlyReport, setMonthlyReport] = useState<Report | null>(null);
  const [allReports, setAllReports] = useState<Report[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);


  // Helper function to categorize reports
  const categorizeReports = (reports: Report[]) => {
    const categorized = {
      daily: [] as Report[],
      weekly: [] as Report[],
      monthly: [] as Report[]
    };

    reports.forEach(report => {
      if (report.daily) categorized.daily.push(report);
      if (report.weekly) categorized.weekly.push(report);
      if (report.monthly) categorized.monthly.push(report);
    });

    return categorized;
  };

  const handleViewReports = (costCenter: MacSteelCostCenter) => {
    setSelectedCostCenter(costCenter);
  };

  const handleBackToTable = () => {
    setSelectedCostCenter(null);
    setDailyReport(null);
    setWeeklyReport(null);
    setMonthlyReport(null);
    setAllReports([]);
  };

  // Fetch reports when a cost center is selected
  useEffect(() => {
    const fetchReports = async () => {
      if (!selectedCostCenter?.new_account_number) return;
      
      console.log('Fetching reports for account number:', selectedCostCenter.new_account_number);
      console.log('Selected cost center:', selectedCostCenter);
      
      setReportsLoading(true);
      try {
        // Get the latest reports for each time period
        const [daily, weekly, monthly, allReportsData] = await Promise.all([
          getLatestDailyReport(selectedCostCenter.new_account_number),
          getLatestWeeklyReport(selectedCostCenter.new_account_number),
          getLatestMonthlyReport(selectedCostCenter.new_account_number),
          getReportsByAccountNumber(selectedCostCenter.new_account_number)
        ]);
        
        console.log('Latest daily report (yesterday):', daily);
        console.log('Latest weekly report (this week):', weekly);
        console.log('Latest monthly report (this month):', monthly);
        console.log('All reports found:', allReportsData);
        
        setAllReports(allReportsData);
        setDailyReport(daily);
        setWeeklyReport(weekly);
        setMonthlyReport(monthly);
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setReportsLoading(false);
      }
    };

    fetchReports();
  }, [selectedCostCenter]);

  if (isLoading) {
    return <CostCenterSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-gray-900 text-xl">Reporting Dashboard</h2>
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
      <div className="space-y-6">
        {/* Header with cost center info */}
        <div className="bg-blue-50 pb-4 border-b-2 border-blue-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="mb-1 font-medium text-blue-600 text-sm">
                Cost Centre ({selectedCostCenter.id})
              </div>
                             <div className="font-semibold text-gray-900 text-lg">
                 Macsteel &gt; {selectedCostCenter.company || 'Unknown Company'} &gt; TRUCKS - (COST CODE: {selectedCostCenter.new_account_number || 'N/A'})
               </div>
            </div>
            <Button onClick={handleBackToTable} variant="outline" size="sm">
              Back to Cost Centers
            </Button>
          </div>
        </div>

        {/* Main content area */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2 mb-4">
            <Fuel className="w-6 h-6 text-blue-600" />
            <h2 className="font-semibold text-gray-900 text-xl">Fuel Reports</h2>
          </div>

          {reportsLoading ? (
            <div className="space-y-4">
              <div className="mb-4 text-gray-500 text-center">
                <div className="inline-flex items-center space-x-2">
                  <div className="border-b-2 border-blue-600 rounded-full w-4 h-4 animate-spin"></div>
                  <span>Loading reports...</span>
                </div>
              </div>
              <div className="gap-6 grid grid-cols-1 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white p-6 border border-gray-200 rounded-lg animate-pulse">
                    <div className="bg-gray-200 mb-4 rounded h-6"></div>
                    <div className="bg-gray-200 rounded w-20 h-4"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="gap-6 grid grid-cols-1 md:grid-cols-3">
              {/* Daily Report Card */}
              <div className="bg-white hover:shadow-md p-6 border border-gray-200 rounded-lg transition-shadow">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">Daily</h3>
                    <p className="text-gray-500 text-xs">Yesterday's Report</p>
                  </div>
                  {dailyReport && (
                    <span className="bg-blue-100 px-2 py-1 rounded-full font-medium text-blue-800 text-xs">
                      Available
                    </span>
                  )}
                </div>
                
                {dailyReport ? (
                  <div className="space-y-2">
                    <div className="pl-3 border-blue-200 border-l-2">
                      <a
                        href={dailyReport.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm hover:underline"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download Yesterday's Report</span>
                      </a>
                      <p className="mt-1 text-gray-500 text-xs">
                        Generated: {new Date(dailyReport.created_at).toLocaleDateString()} at {new Date(dailyReport.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm">No daily report available for yesterday</span>
                )}
              </div>

              {/* Weekly Report Card */}
              <div className="bg-white hover:shadow-md p-6 border border-gray-200 rounded-lg transition-shadow">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">Weekly</h3>
                    <p className="text-gray-500 text-xs">This Week's Report</p>
                  </div>
                  {weeklyReport && (
                    <span className="bg-green-100 px-2 py-1 rounded-full font-medium text-green-800 text-xs">
                      Available
                    </span>
                  )}
                </div>
                
                {weeklyReport ? (
                  <div className="space-y-2">
                    <div className="pl-3 border-green-200 border-l-2">
                      <a
                        href={weeklyReport.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 text-green-600 hover:text-green-700 text-sm hover:underline"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download This Week's Report</span>
                      </a>
                      <p className="mt-1 text-gray-500 text-xs">
                        Generated: {new Date(weeklyReport.created_at).toLocaleDateString()} at {new Date(weeklyReport.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm">No weekly report available for this week</span>
                )}
              </div>

              {/* Monthly Report Card */}
              <div className="bg-white hover:shadow-md p-6 border border-gray-200 rounded-lg transition-shadow">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">Monthly</h3>
                    <p className="text-gray-500 text-xs">This Month's Report</p>
                  </div>
                  {monthlyReport && (
                    <span className="bg-purple-100 px-2 py-1 rounded-full font-medium text-purple-800 text-xs">
                      Available
                    </span>
                  )}
                </div>
                
                {monthlyReport ? (
                  <div className="space-y-2">
                    <div className="pl-3 border-purple-200 border-l-2">
                      <a
                        href={monthlyReport.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 text-purple-600 hover:text-purple-700 text-sm hover:underline"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download This Month's Report</span>
                      </a>
                      <p className="mt-1 text-gray-500 text-xs">
                        Generated: {new Date(monthlyReport.created_at).toLocaleDateString()} at {new Date(monthlyReport.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm">No monthly report available for this month</span>
                )}
              </div>
            </div>
          )}


        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-semibold text-gray-900 text-xl">Reporting Dashboard</h2>
          <p className="text-gray-600 text-sm">
            Select a cost center to view detailed reports and analytics
          </p>
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
            render: (item: MacSteelCostCenter) => (
              <div className="flex items-center space-x-3">
                <Building2 className="w-5 h-5 text-blue-600" />
                <span>{item.company || 'Unknown Company'}</span>
              </div>
            )
          },
          {
            key: 'geozone',
            label: 'Geozone',
            align: 'left' as const,
            render: (item: MacSteelCostCenter) => (
              <div className="flex items-center space-x-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{item.geozone}</span>
              </div>
            )
          }
        ]}
        title="Cost Centers"
        searchPlaceholder="Search cost centers..."
        showDownload={true}
        showColumns={true}
        onViewCostCenter={handleViewReports}
      />
    </div>
  );
}
