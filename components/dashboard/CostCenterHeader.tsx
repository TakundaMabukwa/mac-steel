'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Eye, Clock, CheckCircle, XCircle } from 'lucide-react';
import { MacSteelCostCenter } from '@/types/dashboard';

interface CostCenterHeaderProps {
  costCenter: MacSteelCostCenter;
  totalVehicles: number;
  onTimePercentage: number;
  latePercentage: number;
  pendingPercentage: number;
}

interface CircularGaugeProps {
  percentage: number;
  label: string;
  color: 'green' | 'red' | 'yellow';
  size?: 'sm' | 'md' | 'lg';
}

function CircularGauge({ percentage, label, color, size = 'md' }: CircularGaugeProps) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-20 h-20',
    lg: 'w-24 h-24'
  };

  const strokeWidth = size === 'sm' ? 3 : size === 'md' ? 4 : 5;
  const radius = size === 'sm' ? 26 : size === 'md' ? 32 : 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const colorClasses = {
    green: {
      stroke: '#10b981',
      bg: '#ecfdf5',
      text: '#059669'
    },
    red: {
      stroke: '#ef4444',
      bg: '#fef2f2',
      text: '#dc2626'
    },
    yellow: {
      stroke: '#f59e0b',
      bg: '#fffbeb',
      text: '#d97706'
    }
  };

  const colors = colorClasses[color];

  return (
    <div className="flex flex-col items-center">
      <div className={`relative ${sizeClasses[size]}`}>
        <svg
          className="w-full h-full -rotate-90 transform"
          viewBox="0 0 80 80"
        >
          {/* Background circle */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="none"
            className="opacity-30"
          />
          {/* Progress circle */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            stroke={colors.stroke}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-in-out"
          />
        </svg>
        {/* Percentage text */}
        <div className="absolute inset-0 flex justify-center items-center">
          <span className={`font-bold text-lg ${colors.text}`}>
            {percentage}%
          </span>
        </div>
      </div>
      <span className={`mt-2 text-sm font-medium ${colors.text}`}>
        {label}
      </span>
    </div>
  );
}

export function CostCenterHeader({ 
  costCenter, 
  totalVehicles, 
  onTimePercentage, 
  latePercentage,
  pendingPercentage
}: CostCenterHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Main Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border border-blue-200 rounded-xl">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-blue-100 px-3 py-1 border-blue-200 text-blue-700">
                Cost Centre ({totalVehicles})
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <ChevronDown className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <h2 className="font-semibold text-gray-900 text-xl">
            {costCenter.company || 'Unknown Company'}
          </h2>
          <p className="mt-1 text-gray-600">
            {costCenter.new_account_number} - {costCenter.geozone || 'N/A'}
          </p>
          {costCenter.exit_time && (
            <p className="mt-1 text-gray-500 text-sm">
              Exit Time: {costCenter.exit_time}
            </p>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
        {/* Number of Vehicles */}
        <Card className="hover:shadow-lg border-2 border-gray-100 hover:border-blue-200 transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-bold text-gray-900 text-lg">Number of Vehicles</h3>
                  <Eye className="w-5 h-5 text-blue-600" />
                </div>
                <p className="font-bold text-blue-600 text-3xl">{totalVehicles}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Gauges */}
        <Card className="hover:shadow-lg border-2 border-gray-100 hover:border-green-200 transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex justify-center items-center space-x-6">
              <CircularGauge
                percentage={onTimePercentage}
                label="On Time"
                color="green"
                size="md"
              />
              <CircularGauge
                percentage={latePercentage}
                label="Not on Time"
                color="red"
                size="md"
              />
              <CircularGauge
                percentage={pendingPercentage}
                label="Pending"
                color="yellow"
                size="md"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
