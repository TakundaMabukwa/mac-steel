'use client';

import { useState, useEffect } from 'react';
import { FileText, Building2, MapPin, Eye, Download, Fuel } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCostCenters } from '@/lib/context/CostCenterContext';
import { CostCenterSkeleton } from './CostCenterSkeleton';
import { MacSteelCostCenter } from '@/lib/actions/costCenters';
import { Report, getReportsByAccountNumber, getLatestDailyReport, getLatestWeeklyReport, getLatestMonthlyReport } from '@/lib/actions/reports';

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
        // Get all reports for this account number
        const allReportsData = await getReportsByAccountNumber(selectedCostCenter.new_account_number);
        console.log('All reports found:', allReportsData);
        setAllReports(allReportsData);
        
        // Categorize the reports
        const categorized = categorizeReports(allReportsData);
        console.log('Categorized reports:', categorized);
        
        // Get the most recent report of each type
        const daily = categorized.daily.length > 0 ? categorized.daily[0] : null;
        const weekly = categorized.weekly.length > 0 ? categorized.weekly[0] : null;
        const monthly = categorized.monthly.length > 0 ? categorized.monthly[0] : null;
        
        console.log('Most recent daily report:', daily);
        console.log('Most recent weekly report:', weekly);
        console.log('Most recent monthly report:', monthly);
        
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
                   <h3 className="font-bold text-gray-900 text-lg">Daily</h3>
                   {categorizeReports(allReports).daily.length > 0 && (
                     <span className="bg-blue-100 px-2 py-1 rounded-full font-medium text-blue-800 text-xs">
                       {categorizeReports(allReports).daily.length} available
                     </span>
                   )}
                 </div>
                 
                 {categorizeReports(allReports).daily.length > 0 ? (
                   <div className="space-y-2">
                     {categorizeReports(allReports).daily.slice(0, 3).map((report, index) => (
                       <div key={report.id} className="pl-3 border-blue-200 border-l-2">
                         <a
                           href={report.url || '#'}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm hover:underline"
                         >
                           <Download className="w-3 h-3" />
                           <span>Download {index === 0 ? '(Latest)' : `(${new Date(report.created_at).toLocaleDateString()})`}</span>
                         </a>
                       </div>
                     ))}
                     {categorizeReports(allReports).daily.length > 3 && (
                       <div className="mt-2 text-gray-500 text-xs">
                         +{categorizeReports(allReports).daily.length - 3} more reports
                       </div>
                     )}
                   </div>
                 ) : (
                   <span className="text-gray-400 text-sm">No daily reports available</span>
                 )}
               </div>

               {/* Weekly Report Card */}
               <div className="bg-white hover:shadow-md p-6 border border-gray-200 rounded-lg transition-shadow">
                 <div className="flex justify-between items-center mb-4">
                   <h3 className="font-bold text-gray-900 text-lg">Weekly</h3>
                   {categorizeReports(allReports).weekly.length > 0 && (
                     <span className="bg-green-100 px-2 py-1 rounded-full font-medium text-green-800 text-xs">
                       {categorizeReports(allReports).weekly.length} available
                     </span>
                   )}
                 </div>
                 
                 {categorizeReports(allReports).weekly.length > 0 ? (
                   <div className="space-y-2">
                     {categorizeReports(allReports).weekly.slice(0, 3).map((report, index) => (
                       <div key={report.id} className="pl-3 border-green-200 border-l-2">
                         <a
                           href={report.url || '#'}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="inline-flex items-center space-x-2 text-green-600 hover:text-green-700 text-sm hover:underline"
                         >
                           <Download className="w-3 h-3" />
                           <span>Download {index === 0 ? '(Latest)' : `(${new Date(report.created_at).toLocaleDateString()})`}</span>
                         </a>
                       </div>
                     ))}
                     {categorizeReports(allReports).weekly.length > 3 && (
                       <div className="mt-2 text-gray-500 text-xs">
                         +{categorizeReports(allReports).weekly.length - 3} more reports
                       </div>
                     )}
                   </div>
                 ) : (
                   <span className="text-gray-400 text-sm">No weekly reports available</span>
                 )}
               </div>

               {/* Monthly Report Card */}
               <div className="bg-white hover:shadow-md p-6 border border-gray-200 rounded-lg transition-shadow">
                 <div className="flex justify-between items-center mb-4">
                   <h3 className="font-bold text-gray-900 text-lg">Monthly</h3>
                   {categorizeReports(allReports).monthly.length > 0 && (
                     <span className="bg-purple-100 px-2 py-1 rounded-full font-medium text-purple-800 text-xs">
                       {categorizeReports(allReports).monthly.length} available
                     </span>
                   )}
                 </div>
                 
                                   {categorizeReports(allReports).monthly.length > 0 ? (
                    <div className="space-y-2">
                      {categorizeReports(allReports).monthly.slice(0, 3).map((report, index) => (
                        <div key={report.id} className="pl-3 border-purple-200 border-l-2">
                          <a
                            href={report.url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-2 text-purple-600 hover:text-purple-700 text-sm hover:underline"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download {index === 0 ? '(Latest)' : `(${new Date(report.created_at).toLocaleDateString()})`}</span>
                          </a>
                        </div>
                      ))}
                      {categorizeReports(allReports).monthly.length > 3 && (
                        <div className="mt-2 text-gray-500 text-xs">
                          +{categorizeReports(allReports).monthly.length - 3} more reports
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">No monthly reports available</span>
                  )}
               </div>
             </div>
          )}

                     {/* Debug section - show all reports */}
           <div className="mt-8">
             <div className="flex items-center space-x-2 mb-4">
               <FileText className="w-5 h-5 text-blue-600" />
               <h3 className="font-semibold text-gray-900 text-lg">Debug: All Available Reports</h3>
             </div>
             <div className="bg-white p-4 border border-gray-200 rounded-lg">
               <div className="mb-2 text-gray-600 text-sm">
                 Account Number: <span className="bg-gray-100 px-2 py-1 rounded font-mono">{selectedCostCenter.new_account_number || 'N/A'}</span>
               </div>
               <div className="mb-2 text-gray-600 text-sm">
                 Total Reports Found: <span className="bg-gray-100 px-2 py-1 rounded font-mono">{allReports.length}</span>
               </div>
               <div className="space-y-2">
                 <div className="flex items-center space-x-2">
                   <span className="text-gray-700">Daily Reports:</span>
                   <span className={categorizeReports(allReports).daily.length > 0 ? 'text-green-600' : 'text-red-600'}>
                     {categorizeReports(allReports).daily.length} available
                   </span>
                 </div>
                 <div className="flex items-center space-x-2">
                   <span className="text-gray-700">Weekly Reports:</span>
                   <span className={categorizeReports(allReports).weekly.length > 0 ? 'text-green-600' : 'text-red-600'}>
                     {categorizeReports(allReports).weekly.length} available
                   </span>
                 </div>
                 <div className="flex items-center space-x-2">
                   <span className="text-gray-700">Monthly Reports:</span>
                   <span className={categorizeReports(allReports).monthly.length > 0 ? 'text-green-600' : 'text-red-600'}>
                     {categorizeReports(allReports).monthly.length} available
                   </span>
                 </div>
               </div>
               {allReports.length > 0 && (
                 <div className="mt-4 pt-4 border-gray-200 border-t">
                   <div className="mb-2 text-gray-700 text-sm">All Reports in Database:</div>
                   <div className="space-y-1 text-gray-600 text-xs">
                     {allReports.map((report, index) => (
                       <div key={report.id} className="flex justify-between">
                         <span>Report {index + 1}:</span>
                         <span>Daily: {report.daily ? 'Yes' : 'No'}, Weekly: {report.weekly ? 'Yes' : 'No'}, Monthly: {report.monthly ? 'Yes' : 'No'}</span>
                         <span>Month: {report.month || 'N/A'}</span>
                       </div>
                     ))}
                   </div>
                 </div>
               )}
             </div>
           </div>

           {/* Additional reports section */}
           <div className="mt-8">
             <div className="flex items-center space-x-2 mb-4">
               <FileText className="w-5 h-5 text-blue-600" />
               <h3 className="font-semibold text-gray-900 text-lg">Other Reports</h3>
             </div>
             <div className="bg-white p-4 border border-gray-200 rounded-lg">
               <a
                 href="#"
                 className="inline-flex items-center space-x-2 font-medium text-blue-600 hover:text-blue-700"
               >
                 <span>Expenditure Report</span>
                 <Download className="w-4 h-4" />
               </a>
             </div>
           </div>
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

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 p-4 border-gray-200 border-b">
          <h3 className="font-semibold text-gray-900 text-lg">Cost Centers</h3>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            {costCenters.map((costCenter) => (
              <div key={costCenter.id} className="flex justify-between items-center hover:bg-gray-50 p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-gray-900">
                        {costCenter.company || 'Unknown Company'}
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600 text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>{costCenter.geozone}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => handleViewReports(costCenter)}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Reports</span>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
