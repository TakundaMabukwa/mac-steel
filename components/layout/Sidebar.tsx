'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  TrendingUp, 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  LogOut,
  LayoutDashboard,
  Car
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  return (
    <aside className={`fixed left-0 top-0 h-full bg-blue-50 border-r border-blue-200 transition-all duration-300 ease-in-out z-30 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header with toggle button */}
      <div className="flex justify-between items-center p-4 border-b border-blue-200">
        {!isCollapsed && (
          <div className="flex flex-1 justify-center">
            <img 
              src="https://macsteel.co.za/assets/images/logo-macsteel-dark.svg" 
              alt="MacSteel Logo" 
              className="w-auto h-10"
            />
          </div>
        )}
              <Button
          onClick={onToggle}
                variant="ghost"
          size="sm"
          className="hover:bg-blue-100 p-2 w-8 h-8 text-blue-700"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

            {/* Navigation Menu */}
      <nav className="space-y-2 p-4">
        {/* Dashboard Section */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="px-3 py-2 font-semibold text-blue-600 text-xs uppercase tracking-wider">
              Dashboard
            </div>
          )}
          
          <Link href="/protected?tab=start-time">
            <Button
              variant={pathname.includes('start-time') ? 'default' : 'ghost'}
              className={`w-full justify-start ${
                pathname.includes('start-time') 
                  ? 'bg-blue-100 text-blue-800 border-r-2 border-blue-800' 
                  : 'text-blue-700 hover:bg-blue-100'
              }`}
            >
              <Clock className="mr-3 w-5 h-5" />
              {!isCollapsed && <span>Start Time</span>}
            </Button>
          </Link>

          <Link href="/protected?tab=start-time-dashboard">
            <Button
              variant={pathname.includes('start-time-dashboard') ? 'default' : 'ghost'}
              className={`w-full justify-start ${
                pathname.includes('start-time-dashboard') 
                  ? 'bg-blue-100 text-blue-800 border-r-2 border-blue-800' 
                  : 'text-blue-700 hover:bg-blue-100'
              }`}
            >
              <LayoutDashboard className="mr-3 w-5 h-5" />
              {!isCollapsed && <span>Start Time Dashboard</span>}
            </Button>
          </Link>

          <Link href="/protected?tab=utilisation">
            <Button
              variant={pathname.includes('utilisation') ? 'default' : 'ghost'}
              className={`w-full justify-start ${
                pathname.includes('utilisation') 
                  ? 'bg-blue-100 text-blue-800 border-r-2 border-blue-800' 
                  : 'text-blue-700 hover:bg-blue-100'
              }`}
            >
              <TrendingUp className="mr-3 w-5 h-5" />
              {!isCollapsed && <span>Utilisation</span>}
            </Button>
          </Link>

          <Link href="/protected?tab=reporting">
            <Button
              variant={pathname.includes('reporting') ? 'default' : 'ghost'}
              className={`w-full justify-start ${
                pathname.includes('reporting') 
                  ? 'bg-blue-100 text-blue-800 border-r-2 border-blue-800' 
                  : 'text-blue-700 hover:bg-blue-100'
              }`}
            >
              <FileText className="mr-3 w-5 h-5" />
              {!isCollapsed && <span>Reporting</span>}
            </Button>
          </Link>

        </div>

        {/* Vehicles Section */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="px-3 py-2 font-semibold text-blue-600 text-xs uppercase tracking-wider">
              Vehicles
            </div>
          )}
          
          <Link href="/protected?tab=vehicles">
            <Button
              variant={pathname.includes('vehicles') ? 'default' : 'ghost'}
              className={`w-full justify-start ${
                pathname.includes('vehicles') 
                  ? 'bg-blue-100 text-blue-800 border-r-2 border-blue-800' 
                  : 'text-blue-700 hover:bg-blue-100'
              }`}
            >
              <Car className="mr-3 w-5 h-5" />
              {!isCollapsed && <span>Vehicles</span>}
              </Button>
          </Link>
        </div>
      </nav>

      {/* Logout button at bottom */}
      <div className="mt-4 pt-4 border-t border-blue-200">
                  <Button
          onClick={handleLogout}
                    variant="ghost"
          className="justify-start hover:bg-red-50 w-full text-red-600 hover:text-red-700"
                  >
          <LogOut className="mr-3 w-5 h-5" />
          {!isCollapsed && <span>Logout</span>}
                  </Button>
      </div>
    </aside>
  );
}