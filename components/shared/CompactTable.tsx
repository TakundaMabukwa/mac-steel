'use client';

import { useState } from 'react';
import { Search, Download, ChevronDown, ArrowUpDown, Edit, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CompactTableProps {
  data: any[];
  columns: {
    key: string;
    label: string;
    render?: (item: any) => React.ReactNode;
    sortable?: boolean;
    align?: 'left' | 'center' | 'right';
    width?: string;
  }[];
  title?: string;
  searchPlaceholder?: string;
  showDownload?: boolean;
  showColumns?: boolean;
  onViewCostCenter?: (item: any) => void;
  onActionClick?: (item: any) => void;
  actionIcon?: React.ReactNode;
}

export function CompactTable({ 
  data, 
  columns, 
  title = "Data Table",
  searchPlaceholder = "Search Tomorrow's orders..",
  showDownload = true,
  showColumns = true,
  onViewCostCenter,
  onActionClick,
  actionIcon
}: CompactTableProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = data.filter(item =>
    Object.values(item).some(value => 
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="space-y-4">
      {/* Header Section - Responsive */}
      <div className="flex lg:flex-row flex-col justify-between items-start lg:items-center gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="flex justify-center items-center bg-slate-100 rounded-lg w-10 h-10">
            <span className="font-bold text-slate-600 text-lg">📊</span>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-xl">{title}</h3>
            <p className="text-slate-500 text-sm">Fleet management and analytics</p>
          </div>
        </div>
        <div className="flex sm:flex-row flex-col items-start sm:items-center sm:space-x-3 space-y-3 sm:space-y-0 w-full lg:w-auto">
          {/* Search Bar - Responsive width */}
          <div className="relative w-full sm:w-80">
            <Search className="top-1/2 left-3 absolute w-4 h-4 text-gray-400 -translate-y-1/2 transform" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white shadow-sm pl-10 border-slate-300 focus:border-slate-500 rounded-lg focus:ring-slate-500 text-sm"
            />
          </div>
          
          {/* Action Buttons - Responsive */}
          <div className="flex items-center space-x-2">
            {showDownload && (
              <Button variant="outline" size="sm" className="hover:bg-slate-50 shadow-sm px-4 py-2 border-slate-300 rounded-lg h-10 font-medium text-slate-600 text-sm">
                <Download className="mr-2 w-4 h-4" />
                <span className="hidden sm:inline">Export CSV</span>
                <span className="sm:hidden">CSV</span>
              </Button>
            )}
            {showColumns && (
              <Button variant="outline" size="sm" className="hover:bg-slate-50 shadow-sm px-4 py-2 border-slate-300 rounded-lg h-10 font-medium text-slate-600 text-sm">
                Columns
                <ChevronDown className="ml-2 w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Table - Responsive */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-macsteel-100 border-macsteel-200 border-b">
              {columns.map((column) => (
              <th 
                key={column.key} 
                className={`px-4 py-3 font-semibold text-macsteel-700 text-sm uppercase tracking-wider ${
                  column.align === 'center' ? 'text-center' : 
                  column.align === 'right' ? 'text-right' : 'text-left'
                } ${column.width || ''}`}
              >
                  <div className="flex justify-center items-center space-x-2">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <ArrowUpDown className="opacity-80 ml-1 w-4 h-4" />
                    )}
                  </div>
                </th>
              ))}
              <th className="px-4 py-3 font-semibold text-macsteel-700 text-sm text-center uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => (
              <tr key={index} className="hover:bg-slate-50 border-slate-200 border-b transition-all duration-200">
                {columns.map((column) => (
                  <td 
                    key={column.key} 
                    className={`px-4 py-2 text-sm ${
                      column.align === 'center' ? 'text-center' : 
                      column.align === 'right' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {column.render ? column.render(item) : String(item[column.key] || '')}
                  </td>
                ))}
                <td className="px-4 py-2 text-center">
                   {onViewCostCenter ? (
                     <Button
                       onClick={() => onViewCostCenter(item)}
                       variant="ghost"
                       size="sm"
                       className="hover:bg-slate-100 p-2 rounded-lg h-8 font-medium text-slate-600 hover:text-slate-700 transition-all duration-200"
                     >
                       <Eye className="mr-1 w-3 h-3" />
                       View
                     </Button>
                   ) : onActionClick ? (
                     <Button
                       onClick={() => onActionClick(item)}
                       variant="ghost"
                       size="sm"
                       className="hover:bg-slate-100 p-1 rounded-lg w-8 h-8 text-slate-600 hover:text-slate-700 transition-all duration-200"
                     >
                       {actionIcon || <Edit className="w-3 h-3" />}
                     </Button>
                   ) : (
                     <Button
                       variant="ghost"
                       size="sm"
                       className="hover:bg-slate-100 p-1 rounded-lg w-8 h-8 text-slate-600 hover:text-slate-700 transition-all duration-200"
                     >
                       <Edit className="w-3 h-3" />
                     </Button>
                   )}
                 </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

// Badge component for displaying numerical data - exact styling from image
export function DataBadge({ value, className = "" }: { value: string | number; className?: string }) {
  return (
    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full bg-pink-100 border border-pink-300 text-pink-800 text-sm font-medium ${className}`}>
      {value}
    </span>
  );
}
