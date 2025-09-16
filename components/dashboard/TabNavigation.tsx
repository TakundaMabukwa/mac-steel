'use client';

import { Clock, BarChart3, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs = [
    {
      id: 'start-time',
      label: 'Start Time',
      icon: Clock,
      color: 'text-blue-600'
    },
    {
      id: 'start-time-dashboard',
      label: 'Start Time Dashboard',
      icon: Clock,
      color: 'text-blue-600'
    },
    {
      id: 'utilisation',
      label: 'Utilisation Dashboard',
      icon: BarChart3,
      color: 'text-green-600'
    },
    // {
    //   id: 'utilisation-admin',
    //   label: 'Utilisation Dashboard Admin',
    //   icon: BarChart3,
    //   color: 'text-green-600'
    // },
    {
      id: 'reporting',
      label: 'Reporting',
      icon: FileText,
      color: 'text-blue-600'
    },
    // {
    //   id: 'drivers',
    //   label: 'Drivers',
    //   icon: Users,
    //   color: 'text-blue-600'
    // }
  ];

  return (
    <div className="bg-white border-slate-200 border-b">
      <div className="flex space-x-0 px-6 py-0 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center space-x-2 px-6 py-4 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-200",
              activeTab === tab.id
                ? "border-slate-900 text-slate-900 bg-slate-50"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
            )}
          >
            <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-slate-900" : "text-slate-500")} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}