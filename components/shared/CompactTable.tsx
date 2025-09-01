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
      <div className="flex lg:flex-row flex-col justify-between items-start lg:items-center gap-4">
        <h3 className="font-semibold text-gray-900 text-lg">{title}</h3>
        <div className="flex sm:flex-row flex-col items-start sm:items-center sm:space-x-3 space-y-3 sm:space-y-0 w-full lg:w-auto">
          {/* Search Bar - Responsive width */}
          <div className="relative w-full sm:w-80">
            <Search className="top-1/2 left-3 absolute w-4 h-4 text-gray-400 -translate-y-1/2 transform" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white pl-10 border-gray-300 focus:border-blue-800 focus:ring-blue-800 text-sm"
            />
          </div>
          
          {/* Action Buttons - Responsive */}
          <div className="flex items-center space-x-2">
            {showDownload && (
              <Button variant="outline" size="sm" className="hover:bg-blue-50 px-3 py-2 border-blue-800 h-9 text-blue-800 text-sm">
                <Download className="mr-2 w-4 h-4" />
                <span className="hidden sm:inline">Download (csv)</span>
                <span className="sm:hidden">CSV</span>
              </Button>
            )}
            {showColumns && (
              <Button variant="outline" size="sm" className="hover:bg-blue-50 px-3 py-2 border-blue-800 h-9 text-blue-800 text-sm">
                Columns
                <ChevronDown className="ml-2 w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Table - Responsive */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-blue-800">
              {columns.map((column) => (
                <th 
                  key={column.key} 
                  className={`px-3 py-3 font-semibold text-white text-xs uppercase tracking-wider ${
                    column.align === 'center' ? 'text-center' : 
                    column.align === 'right' ? 'text-right' : 'text-left'
                  } ${column.width || ''}`}
                >
                  <div className="flex justify-center items-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <ArrowUpDown className="ml-1 w-4 h-4" />
                    )}
                  </div>
                </th>
              ))}
              <th className="px-3 py-3 font-semibold text-white text-xs text-center uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 border-gray-100 border-b">
                {columns.map((column) => (
                  <td 
                    key={column.key} 
                    className={`px-3 py-3 text-sm ${
                      column.align === 'center' ? 'text-center' : 
                      column.align === 'right' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {column.render ? column.render(item) : String(item[column.key] || '')}
                  </td>
                ))}
                                 <td className="px-3 py-3 text-center">
                   {onViewCostCenter ? (
                     <Button
                       onClick={() => onViewCostCenter(item)}
                       variant="ghost"
                       size="sm"
                       className="hover:bg-blue-50 p-2 h-8 text-blue-600 hover:text-blue-700"
                     >
                       <Eye className="mr-2 w-4 h-4" />
                       View
                     </Button>
                   ) : onActionClick ? (
                     <Button
                       onClick={() => onActionClick(item)}
                       variant="ghost"
                       size="sm"
                       className="hover:bg-blue-50 p-2 w-8 h-8 text-blue-800 hover:text-blue-900"
                     >
                       {actionIcon || <Edit className="w-4 h-4" />}
                     </Button>
                   ) : (
                     <Button
                       variant="ghost"
                       size="sm"
                       className="hover:bg-gray-100 p-2 w-8 h-8 text-gray-600 hover:text-gray-800"
                     >
                       <Edit className="w-4 h-4" />
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
