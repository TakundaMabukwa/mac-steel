'use client';

import { useState, useEffect } from 'react';
import { Car, Calendar, Building2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithDay } from '@/components/ui/date-picker-with-day';
import { updateVehicleLoan, VehicleIp } from '@/lib/actions/vehiclesIp';
import { getAllMacSteelCostCenters, MacSteelCostCenter } from '@/lib/actions/macSteel';

interface VehicleLoanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: VehicleIp | null;
  onSuccess: () => void;
}

export function VehicleLoanDialog({ isOpen, onClose, vehicle, onSuccess }: VehicleLoanDialogProps) {
  const [costCenters, setCostCenters] = useState<MacSteelCostCenter[]>([]);
  const [selectedCostCenter, setSelectedCostCenter] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<{ year: number; month: number; day: number } | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load cost centers when dialog opens
  useEffect(() => {
    if (isOpen) {
      const loadCostCenters = async () => {
        try {
          setIsLoading(true);
          setError(null);
                     const data = await getAllMacSteelCostCenters();
           // Filter out cost centers where geozone is empty and exclude current vehicle's cost center
           const filteredData = data.filter(cc => 
             cc.geozone && 
             cc.geozone.trim() !== '' && 
             cc.new_account_number !== vehicle?.new_account_number
           );
           setCostCenters(filteredData);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load cost centers');
        } finally {
          setIsLoading(false);
        }
      };

      loadCostCenters();
    }
  }, [isOpen]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedCostCenter('');
      setSelectedDate(undefined);
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!vehicle || !selectedCostCenter || !selectedDate) {
      setError('Please select a cost center and return date');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const returnDate = `${selectedDate.year}-${selectedDate.month.toString().padStart(2, '0')}-${selectedDate.day.toString().padStart(2, '0')}`;
      
      const result = await updateVehicleLoan(
        vehicle.id,
        vehicle.new_account_number,
        selectedCostCenter,
        returnDate
      );

      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.error || 'Failed to update vehicle loan');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update vehicle loan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = selectedCostCenter && selectedDate;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Car className="w-5 h-5 text-blue-800" />
            <span>Update Vehicle Loan</span>
          </DialogTitle>
          <DialogDescription>
            Transfer vehicle to a different cost center and set loan return date.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Vehicle Info */}
          {vehicle && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-gray-600 text-sm">
                <div className="font-medium">Vehicle: {vehicle.new_registration || 'N/A'}</div>
                <div>Current Account: {vehicle.new_account_number}</div>
                <div>Company: {vehicle.company || 'N/A'}</div>
              </div>
            </div>
          )}

          {/* Cost Center Selection */}
          <div className="space-y-2">
            <label className="block font-medium text-gray-700 text-sm">
              Transfer to Cost Center
            </label>
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-gray-500 text-sm">Loading cost centers...</span>
              </div>
            ) : (
              <Select value={selectedCostCenter} onValueChange={setSelectedCostCenter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a cost center" />
                </SelectTrigger>
                <SelectContent>
                  {costCenters.map((costCenter) => (
                    <SelectItem key={costCenter.id} value={costCenter.new_account_number || ''}>
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        <div>
                          <div className="font-medium">{costCenter.company}</div>
                          <div className="text-gray-500 text-xs">{costCenter.new_account_number}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Return Date Selection */}
          <div className="space-y-2">
            <label className="block font-medium text-gray-700 text-sm">
              Loan Return Date
            </label>
                         <DatePickerWithDay
               value={selectedDate}
               onChange={setSelectedDate}
               placeholder="Select return date"
               className="w-full"
             />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 p-3 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmitting}
              className="bg-blue-800 hover:bg-blue-900 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Loan'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
