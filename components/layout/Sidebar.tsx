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
    <aside className={`fixed left-0 top-0 h-full bg-macsteel-100 border-r border-macsteel-200 transition-all duration-300 ease-in-out z-30 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header with toggle button */}
      <div className="flex justify-between items-center p-4 border-macsteel-200 border-b">
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
          className="hover:bg-macsteel-50 p-2 w-8 h-8 text-macsteel-600"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

            {/* Navigation Menu */}
      <nav className="space-y-2 p-4">
        {/* Dashboard Section */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="px-3 py-2 font-semibold text-macsteel-600 text-xs uppercase tracking-wider">
              Dashboard
            </div>
          )}
          
          <Link href="/protected?tab=start-time">
            <Button
              variant={pathname.includes('start-time') ? 'default' : 'ghost'}
              className={`w-full justify-start ${
                pathname.includes('start-time') 
                  ? 'bg-macsteel-100 text-macsteel-900 border-r-2 border-macsteel-600' 
                  : 'text-steel-600 hover:bg-macsteel-50'
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
                  ? 'bg-macsteel-100 text-macsteel-900 border-r-2 border-macsteel-600' 
                  : 'text-steel-600 hover:bg-macsteel-50'
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
                  ? 'bg-macsteel-100 text-macsteel-900 border-r-2 border-macsteel-600' 
                  : 'text-steel-600 hover:bg-macsteel-50'
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
                  ? 'bg-macsteel-100 text-macsteel-900 border-r-2 border-macsteel-600' 
                  : 'text-steel-600 hover:bg-macsteel-50'
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
            <div className="px-3 py-2 font-semibold text-macsteel-600 text-xs uppercase tracking-wider">
              Vehicles
            </div>
          )}
          
          <Link href="/protected?tab=vehicles">
            <Button
              variant={pathname.includes('vehicles') ? 'default' : 'ghost'}
              className={`w-full justify-start ${
                pathname.includes('vehicles') 
                  ? 'bg-macsteel-100 text-macsteel-900 border-r-2 border-macsteel-600' 
                  : 'text-steel-600 hover:bg-macsteel-50'
              }`}
            >
              <Car className="mr-3 w-5 h-5" />
              {!isCollapsed && <span>Vehicles</span>}
              </Button>
          </Link>
        </div>
      </nav>

      {/* Logout button at bottom */}
      <div className="mt-4 pt-4 border-macsteel-200 border-t">
                  <Button
          onClick={handleLogout}
                    variant="ghost"
          className="justify-start hover:bg-warning-50 w-full text-warning-600 hover:text-warning-700"
                  >
          <LogOut className="mr-3 w-5 h-5" />
          {!isCollapsed && <span>Logout</span>}
                  </Button>
      </div>
    </aside>
  );
}