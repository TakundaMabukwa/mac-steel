'use client';

import { 
  LayoutDashboard, 
  LogOut,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  className?: string;
}

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  color: string;
  expandable?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
  onClick?: () => void;
}

export function Sidebar({ className }: SidebarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const menuItems: MenuItem[] = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      active: true,
      color: 'text-green-600'
    },
    // {
    //   icon: Car,
    //   label: 'Vehicles',
    //   expandable: true,
    //   expanded: isVehiclesExpanded,
    //   onToggle: () => setIsVehiclesExpanded(!isVehiclesExpanded),
    //   color: 'text-blue-600'
    // },
    // {
    //   icon: Users,
    //   label: 'Drivers',
    //   color: 'text-blue-600'
    // },
    // {
    //   icon: Building2,
    //   label: 'Cost Centres',
    //   color: 'text-green-600'
    // },
    {
      icon: LogOut,
      label: 'Sign Out',
      color: 'text-red-600',
      onClick: handleLogout
    }
  ];

  return (
    <aside className={cn("w-64 bg-gray-50 border-r border-gray-200 flex flex-col", className)}>
      <div className="flex-1 py-6">
        <nav className="space-y-1 px-3">
          {menuItems.map((item, index) => (
            <div key={index}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                  item.active && "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                )}
                onClick={item.onClick || item.onToggle}
              >
                <item.icon className={cn("mr-3 h-5 w-5", item.color)} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.expandable && (
                  item.expanded ? 
                    <ChevronDown className="w-4 h-4" /> : 
                    <ChevronRight className="w-4 h-4" />
                )}
              </Button>
              
              {item.expandable && item.expanded && (
                <div className="space-y-1 mt-1 ml-9">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start hover:bg-gray-100 w-full text-gray-600"
                  >
                    Fleet Overview
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start hover:bg-gray-100 w-full text-gray-600"
                  >
                    Vehicle Status
                  </Button>
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}