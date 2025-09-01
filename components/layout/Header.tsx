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
    <header className={`fixed top-0 right-0 h-16 bg-gradient-to-r from-blue-800 to-blue-900 shadow-lg z-40 transition-all duration-300 ease-in-out ${
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
              className="hover:bg-blue-700 p-2 w-9 h-9 text-white"
            >
              <Menu className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Right side - User info and actions */}
        <div className="flex items-center space-x-4">
          {/* Greeting and user name */}
          <div className="text-white text-sm">
            <span className="opacity-90">{greeting}, </span>
            <span className="font-medium">{user?.name || 'Admin'}</span>
          </div>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="hover:bg-blue-700 p-2 w-9 h-9 text-white"
          >
            <Bell className="w-5 h-5" />
          </Button>

          {/* User avatar */}
          <Avatar className="w-8 h-8">
            <AvatarImage src="" alt={user?.name || 'User'} />
            <AvatarFallback className="bg-blue-700 font-medium text-white text-sm">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>

          {/* User menu dropdown */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="hover:bg-blue-700 p-2 w-9 h-9 text-white"
          >
            <User className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}