'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from "@/lib/supabase/client";
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { TabNavigation } from '@/components/dashboard/TabNavigation';
import { StartTimeDashboard } from '@/components/dashboard/StartTimeDashboard';
import { StartTimeReportsDashboard } from '@/components/dashboard/StartTimeReportsDashboard';
import { StartTimeDashboardWithLookup } from '@/components/dashboard/StartTimeDashboardWithLookup';
import { VehiclesDashboard } from '@/components/dashboard/VehiclesDashboard';
import { UtilisationDashboard } from '@/components/dashboard/UtilisationDashboard';
import { ReportingDashboard } from '@/components/dashboard/ReportingDashboard';
import { LiveVehicleDashboard } from '@/components/dashboard/LiveVehicleDashboard';
import { CostCenterProvider } from '@/lib/context/CostCenterContext';
import { StartTimeReportsProvider } from '@/lib/context/StartTimeReportsContext';
import { LiveVehicleProvider } from '@/lib/context/LiveVehicleContext';

function ProtectedPageContent() {
  const [activeTab, setActiveTab] = useState('start-time');
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // Sync active tab with URL query parameter
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && ['start-time', 'start-time-dashboard', 'utilisation', 'utilisation-admin', 'reporting', 'drivers', 'vehicles'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    // Update URL without triggering a page reload
    const newUrl = `/protected?tab=${tabId}`;
    router.replace(newUrl, { scroll: false });
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          router.push('/auth/login');
          return;
        }
        
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/auth/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [supabase.auth, router]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'start-time':
        return <StartTimeDashboard />;
      case 'start-time-dashboard':
        return (
          <StartTimeReportsProvider>
            <StartTimeReportsDashboard />
          </StartTimeReportsProvider>
        );
      case 'utilisation':
      case 'utilisation-admin':
        return <UtilisationDashboard />;
      case 'reporting':
        return <ReportingDashboard />;

      case 'vehicles':
        return <VehiclesDashboard />;
      case 'drivers':
        return (
          <div className="p-8 text-gray-500 text-center">
            <h2 className="mb-2 font-semibold text-xl">Drivers Dashboard</h2>
            <p>Driver management and information will be displayed here.</p>
          </div>
        );
      default:
        return <StartTimeDashboard />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="mx-auto mb-4 border-b-2 border-blue-600 rounded-full w-12 h-12 animate-spin"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <LiveVehicleProvider>
      <CostCenterProvider>
        <div className="bg-blue-100 min-h-screen">
          <div className="flex flex-1 overflow-hidden">
            <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
            
            <div className={`flex flex-col flex-1 transition-all duration-300 ease-in-out ${
              isSidebarCollapsed ? 'ml-16' : 'ml-64'
            }`}>
              {/* New Header */}
              <Header isSidebarCollapsed={isSidebarCollapsed} onToggleSidebar={toggleSidebar} />
              
              {/* Main Content Area */}
              <main className="flex flex-col flex-1 bg-white mt-16 overflow-hidden">
                <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />

                <div className="flex-1 bg-blue-100/50 p-6 overflow-auto">
                  {renderTabContent()}
                </div>
              </main>
            </div>
          </div>
        </div>
      </CostCenterProvider>
    </LiveVehicleProvider>
  );
}

export default function ProtectedPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProtectedPageContent />
    </Suspense>
  );
}
