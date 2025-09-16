'use client';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, User, Menu } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface HeaderProps {
  isSidebarCollapsed: boolean;
  onToggleSidebar?: () => void;
}

export function Header({ isSidebarCollapsed, onToggleSidebar }: HeaderProps) {
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string; name?: string } | null>(null);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser({
          email: user.email,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
        });
      }
    };

    getUser();

    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 17) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  return (
    <header className={`fixed top-0 right-0 h-16 bg-macsteel-100 border-b border-macsteel-200 shadow-sm z-40 transition-all duration-300 ease-in-out ${
      isSidebarCollapsed ? 'left-16' : 'left-64'
    }`}>
      <div className="flex justify-between items-center px-6 h-full">
        {/* Left side - Sidebar toggle and Logo */}
        <div className="flex items-center space-x-4">
          {onToggleSidebar && (
            <Button
              onClick={onToggleSidebar}
              variant="ghost"
              size="sm"
              className="hover:bg-macsteel-50 p-2 rounded-lg w-10 h-10 text-macsteel-600"
            >
              <Menu className="w-5 h-5" />
            </Button>
          )}
          <div className="flex items-center space-x-3">
            <div className="flex justify-center items-center bg-macsteel-100 rounded-lg w-8 h-8">
              <span className="font-bold text-macsteel-600 text-lg">🚛</span>
            </div>
            <div className="text-steel-900">
              <h1 className="font-bold text-lg">MacSteel Fleet</h1>
              <p className="text-steel-500 text-xs">Logistics Management System</p>
            </div>
          </div>
        </div>

        {/* Right side - User info and actions */}
        <div className="flex items-center space-x-4">
          {/* Live Status Indicator */}
          <div className="flex items-center space-x-2 bg-success-50 px-3 py-1 border border-success-200 rounded-full">
            <div className="bg-success-500 rounded-full w-2 h-2"></div>
            <span className="font-medium text-success-700 text-sm">Live</span>
          </div>

          {/* Greeting and user name */}
          <div className="text-steel-700 text-sm">
            <span className="text-steel-500">{greeting}, </span>
            <span className="font-semibold text-steel-900">{user?.name || 'Admin'}</span>
          </div>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="relative hover:bg-macsteel-50 p-2 rounded-lg w-10 h-10 text-macsteel-600"
          >
            <Bell className="w-5 h-5" />
            <span className="-top-1 -right-1 absolute bg-warning-500 rounded-full w-3 h-3 text-xs"></span>
          </Button>

          {/* User avatar */}
          <Avatar className="ring-2 ring-macsteel-200 w-10 h-10">
            <AvatarImage src="" alt={user?.name || 'User'} />
            <AvatarFallback className="bg-macsteel-100 font-semibold text-macsteel-700 text-sm">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>

          {/* User menu dropdown */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="hover:bg-macsteel-50 p-2 rounded-lg w-10 h-10 text-macsteel-600"
          >
            <User className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}