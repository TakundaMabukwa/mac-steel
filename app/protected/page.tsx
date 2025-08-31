'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from "@/lib/supabase/client";
import { Sidebar } from '@/components/layout/Sidebar';
import { TabNavigation } from '@/components/dashboard/TabNavigation';
import { StartTimeDashboard } from '@/components/dashboard/StartTimeDashboard';
import { StartTimeDashboardWithLookup } from '@/components/dashboard/StartTimeDashboardWithLookup';
import { UtilisationDashboard } from '@/components/dashboard/UtilisationDashboard';
import { ReportingDashboard } from '@/components/dashboard/ReportingDashboard';
import { CostCenterProvider } from '@/lib/context/CostCenterContext';

export default function ProtectedPage() {
  const [activeTab, setActiveTab] = useState('start-time');
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const supabase = createClient();

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
        return <StartTimeDashboardWithLookup />;
      case 'utilisation':
      case 'utilisation-admin':
        return <UtilisationDashboard />;
      case 'reporting':
        return <ReportingDashboard />;
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
    <CostCenterProvider>
      <div className="">
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />

          <main className="flex flex-col flex-1 overflow-hidden">
            <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

            <div className="flex-1 p-6 overflow-auto">
              {renderTabContent()}
            </div>
          </main>
        </div>
      </div>
    </CostCenterProvider>
  );
}
