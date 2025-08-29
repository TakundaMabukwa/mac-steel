'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useCostCenters } from '@/lib/context/CostCenterContext';

// Component now uses context instead of props

interface DailyVehicleData {
  date: string;
  dayOfWeek: string;
  totalVehicles: number;
  onTime: number;
  notOnTime: number;
  onTimePercentage: number;
  notOnTimePercentage: number;
}

export function StartTimeDashboardWithLookup() {
  // Lookup options state
  const [lookupCostCenter, setLookupCostCenter] = useState<string>('');
  const [lookupDate, setLookupDate] = useState<{ year: number; month: number }>({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
  });

  // Mock daily vehicle data for August 2025
  const mockDailyData: DailyVehicleData[] = [
    {
      date: '05 Aug 2025',
      dayOfWeek: 'Tuesday',
      totalVehicles: 16,
      onTime: 0,
      notOnTime: 16,
      onTimePercentage: 0,
      notOnTimePercentage: 100
    },
    {
      date: '06 Aug 2025',
      dayOfWeek: 'Wednesday',
      totalVehicles: 16,
      onTime: 10,
      notOnTime: 6,
      onTimePercentage: 63,
      notOnTimePercentage: 38
    },
    {
      date: '07 Aug 2025',
      dayOfWeek: 'Thursday',
      totalVehicles: 16,
      onTime: 6,
      notOnTime: 10,
      onTimePercentage: 38,
      notOnTimePercentage: 63
    },
    {
      date: '08 Aug 2025',
      dayOfWeek: 'Friday',
      totalVehicles: 16,
      onTime: 7,
      notOnTime: 9,
      onTimePercentage: 44,
      notOnTimePercentage: 56
    },
    {
      date: '09 Aug 2025',
      dayOfWeek: 'Saturday',
      totalVehicles: 16,
      onTime: 0,
      notOnTime: 16,
      onTimePercentage: 0,
      notOnTimePercentage: 100
    }
  ];

  const handleSearch = () => {
    // TODO: Implement search functionality
    console.log('Searching with:', { lookupCostCenter, lookupDate });
  };

  const { costCenters } = useCostCenters();
  
  const isFormComplete = lookupCostCenter && lookupDate.year && lookupDate.month;

  return (
    <div className="space-y-6">
      {/* Lookup Options Section */}
      <Card className="bg-white border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-gray-900 text-lg">
            <div className="flex justify-center items-center bg-blue-600 mr-3 rounded-full w-6 h-6 font-bold text-white text-sm">
              1
            </div>
            Lookup Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cost-center" className="font-medium text-gray-700 text-sm">
                Cost Centre *
              </Label>
              <Select value={lookupCostCenter} onValueChange={setLookupCostCenter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select cost centre" />
                </SelectTrigger>
                <SelectContent>
                                     {costCenters.map((costCenter) => (
                     <SelectItem key={costCenter.id} value={costCenter.id.toString()}>
                       {costCenter.company || 'Unknown Company'} - (Geozone: {costCenter.geozone || 'N/A'})
                     </SelectItem>
                   ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="month" className="font-medium text-gray-700 text-sm">
                Select Month *
              </Label>
              <DatePicker
                value={lookupDate}
                onChange={setLookupDate}
                placeholder="Select month"
                className="w-full"
              />
            </div>
          </div>
          
          <div className="mt-6">
            <Button 
              onClick={handleSearch}
              className="bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-700"
            >
              <Search className="mr-2 w-4 h-4" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Daily Vehicle Punctuality Table */}
      {isFormComplete && (
        <Card className="bg-white border border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900 text-lg">
              Number of Vehicles on Time (Daily View)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold text-gray-700">Date</TableHead>
                    <TableHead className="font-semibold text-gray-700">Number of vehicles</TableHead>
                    <TableHead className="font-semibold text-gray-700">Number of vehicles on time</TableHead>
                    <TableHead className="font-semibold text-gray-700">Number not on Time</TableHead>
                    <TableHead className="font-semibold text-gray-700">% on time</TableHead>
                    <TableHead className="font-semibold text-gray-700">% not on time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockDailyData.map((day, index) => (
                    <TableRow 
                      key={day.date} 
                      className={index % 2 === 0 ? 'bg-pink-50' : 'bg-green-50'}
                    >
                      <TableCell className="font-medium">
                        {day.date} - ({day.dayOfWeek})
                      </TableCell>
                      <TableCell className="text-center">{day.totalVehicles}</TableCell>
                      <TableCell className="text-center">{day.onTime}</TableCell>
                      <TableCell className="text-center">{day.notOnTime}</TableCell>
                      <TableCell className="font-medium text-green-600 text-center">
                        {day.onTimePercentage}%
                      </TableCell>
                      <TableCell className="font-medium text-red-600 text-center">
                        {day.notOnTimePercentage}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content area when form is not complete */}
      {!isFormComplete && (
        <div className="py-12 text-gray-500 text-center">
          <h3 className="mb-2 font-medium text-lg">Search Results</h3>
          <p>Please select both cost centre and month to view the daily vehicle punctuality data.</p>
        </div>
      )}
    </div>
  );
}
