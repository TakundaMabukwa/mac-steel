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
    <div className="bg-white border-gray-200 border-b">
      <div className="flex space-x-0 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center space-x-2 px-6 py-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors",
              activeTab === tab.id
                ? "border-blue-600 text-blue-600 bg-blue-50"
                : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
            )}
          >
            <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? tab.color : "text-gray-400")} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}