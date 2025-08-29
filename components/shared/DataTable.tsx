'use client';

import { useState } from 'react';
import { Search, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CostCenter } from '@/types/dashboard';

interface DataTableProps {
  data: CostCenter[];
  onViewCostCenter: (costCenter: CostCenter) => void;
  columns: {
    key: string;
    label: string;
    render?: (item: CostCenter) => React.ReactNode;
  }[];
}

export function DataTable({ data, onViewCostCenter, columns }: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = data.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-900 text-lg">Cost Centers</h3>
        <div className="relative w-64">
          <Search className="top-1/2 left-3 absolute w-4 h-4 text-gray-400 -translate-y-1/2 transform" />
          <Input
            placeholder="Search cost centers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              {columns.map((column) => (
                <TableHead key={column.key} className="font-semibold text-gray-900">
                  {column.label}
                </TableHead>
              ))}
              <TableHead className="font-semibold text-gray-900">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((item) => (
              <TableRow key={item.id} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <TableCell key={column.key}>
                    {column.render ? column.render(item) : String((item as unknown as Record<string, unknown>)[column.key] || '')}
                  </TableCell>
                ))}
                <TableCell>
                  <Button
                    onClick={() => onViewCostCenter(item)}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Eye className="mr-2 w-4 h-4" />
                    View Cost Center
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}