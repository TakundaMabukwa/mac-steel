'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface AddLogDialogProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleRegistration: string;
}

const messageOptions = [
  'Workshop',
  'Quality',
  'Warehouse',
  'Sales',
  'No loads',
  'No Driver',
  'Long Distance',
  'Shunter',
  'In yard repair',
  'Tyres'
];

export function AddLogDialog({ isOpen, onClose, vehicleRegistration }: AddLogDialogProps) {
  const [selectedMessage, setSelectedMessage] = useState('');
  const [error, setError] = useState('');

  const handleCreate = () => {
    if (!selectedMessage) {
      setError('This field is required');
      return;
    }
    
    // Handle log creation logic here
    console.log('Creating log for vehicle:', vehicleRegistration, 'Message:', selectedMessage);
    
    // Reset form and close dialog
    setSelectedMessage('');
    setError('');
    onClose();
  };

  const handleClose = () => {
    setSelectedMessage('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 font-semibold text-lg">
            <div className="flex justify-center items-center bg-blue-500 rounded-full w-8 h-8 font-bold text-white text-sm">
              1
            </div>
            <span>Add Log Message</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="message" className="font-medium text-gray-700 text-sm">
              Select Message <span className="text-red-500">*</span>
            </Label>
            <Select value={selectedMessage} onValueChange={(value) => {
              setSelectedMessage(value);
              setError('');
            }}>
              <SelectTrigger className={`w-full ${error ? 'border-red-500' : ''}`}>
                <SelectValue placeholder="Select Message *" />
              </SelectTrigger>
              <SelectContent>
                {messageOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            className="px-6"
          >
            Close
          </Button>
          <Button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 px-6"
            disabled={!selectedMessage}
          >
            Create
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}