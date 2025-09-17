'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Truck, Clock, TrendingUp, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'indigo';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
}

const colorClasses = {
  blue: {
    bg: 'bg-macsteel-50',
    icon: 'text-macsteel-600',
    accent: 'bg-macsteel-100',
    text: 'text-steel-700',
    border: 'border-macsteel-200',
    iconBg: 'bg-macsteel-100'
  },
  green: {
    bg: 'bg-success-50',
    icon: 'text-success-600',
    accent: 'bg-success-100',
    text: 'text-steel-700',
    border: 'border-success-200',
    iconBg: 'bg-success-100'
  },
  orange: {
    bg: 'bg-warning-50',
    icon: 'text-warning-600',
    accent: 'bg-warning-100',
    text: 'text-steel-700',
    border: 'border-warning-200',
    iconBg: 'bg-warning-100'
  },
  red: {
    bg: 'bg-red-50',
    icon: 'text-red-600',
    accent: 'bg-red-100',
    text: 'text-steel-700',
    border: 'border-red-200',
    iconBg: 'bg-red-100'
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    accent: 'bg-purple-100',
    text: 'text-steel-700',
    border: 'border-purple-200',
    iconBg: 'bg-purple-100'
  },
  indigo: {
    bg: 'bg-indigo-50',
    icon: 'text-indigo-600',
    accent: 'bg-indigo-100',
    text: 'text-steel-700',
    border: 'border-indigo-200',
    iconBg: 'bg-indigo-100'
  }
};

export function StatCard({ title, value, icon, color, trend, subtitle }: StatCardProps) {
  const colors = colorClasses[color];

  return (
    <Card className={`relative border ${colors.border} ${colors.bg} hover:shadow-md transition-all duration-200`}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <p className="mb-2 font-medium text-steel-600 text-sm uppercase tracking-wide">{title}</p>
            <p className="mb-2 font-bold text-steel-900 text-2xl">{value}</p>
            {subtitle && (
              <p className="font-medium text-steel-500 text-sm">{subtitle}</p>
            )}
            {trend && (
              <div className="flex items-center mt-3">
                <div className={`flex items-center px-2 py-1 rounded text-xs font-semibold ${
                  trend.isPositive ? 'bg-success-50 text-success-700' : 'bg-red-50 text-red-700'
                }`}>
                  <TrendingUp className={`w-3 h-3 mr-1 ${trend.isPositive ? '' : 'rotate-180'}`} />
                  {Math.abs(trend.value)}%
                </div>
              </div>
            )}
          </div>
          <div className={`w-12 h-12 ${colors.iconBg} rounded-lg flex items-center justify-center`}>
            <div className={colors.icon}>
              {icon}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface StatCardsProps {
  totalVehicles: number;
  onTimeVehicles: number;
  lateVehicles: number;
  pendingVehicles: number;
}

export function StatCards({ totalVehicles, onTimeVehicles, lateVehicles, pendingVehicles }: StatCardsProps) {
  const onTimePercentage = totalVehicles > 0 ? Math.round((onTimeVehicles / totalVehicles) * 100) : 0;
  const latePercentage = totalVehicles > 0 ? Math.round((lateVehicles / totalVehicles) * 100) : 0;
  const pendingPercentage = totalVehicles > 0 ? Math.round((pendingVehicles / totalVehicles) * 100) : 0;

  return (
    <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-8">
      <StatCard
        title="Total Vehicles"
        value={totalVehicles}
        icon={<Truck className="w-6 h-6" />}
        color="blue"
        subtitle="Active fleet"
        trend={{ value: 5, isPositive: true }}
      />
      <StatCard
        title="On Time"
        value={`${onTimePercentage}%`}
        icon={<CheckCircle className="w-6 h-6" />}
        color="green"
        subtitle={`${onTimeVehicles} vehicles`}
        trend={{ value: 8, isPositive: true }}
      />
      <StatCard
        title="Late Vehicles"
        value={`${latePercentage}%`}
        icon={<AlertTriangle className="w-6 h-6" />}
        color="red"
        subtitle={`${lateVehicles} vehicles`}
        trend={{ value: 3, isPositive: false }}
      />
      <StatCard
        title="Pending"
        value={`${pendingPercentage}%`}
        icon={<Clock className="w-6 h-6" />}
        color="orange"
        subtitle={`${pendingVehicles} vehicles`}
        trend={{ value: 0, isPositive: true }}
      />
    </div>
  );
}
