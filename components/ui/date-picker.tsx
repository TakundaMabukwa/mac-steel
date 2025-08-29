"use client"

import * as React from "react"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface DatePickerProps {
  value?: { year: number; month: number }
  onChange?: (value: { year: number; month: number }) => void
  placeholder?: string
  className?: string
}

export function DatePicker({ value, onChange, placeholder, className }: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [currentYear, setCurrentYear] = React.useState(value?.year || new Date().getFullYear())
  const [viewMode, setViewMode] = React.useState<'year' | 'month'>('year')

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const handleYearChange = (increment: number) => {
    setCurrentYear(prev => prev + increment)
  }

  const handleYearSelect = (year: number) => {
    setCurrentYear(year)
    setViewMode('month')
  }

  const handleMonthSelect = (month: number) => {
    const newValue = { year: currentYear, month }
    onChange?.(newValue)
    setIsOpen(false)
    setViewMode('year') // Reset to year view for next time
  }

  const handleBackToYearView = () => {
    setViewMode('year')
  }

  const displayValue = value ? `${months[value.month - 1]} ${value.year}` : placeholder

  // Generate years for the grid (24 years: 12 before current, 12 after)
  const currentYearValue = new Date().getFullYear()
  const years = Array.from({ length: 24 }, (_, i) => currentYearValue - 12 + i)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <Calendar className="mr-2 w-4 h-4" />
          {displayValue}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-auto" align="start">
        <div className="p-3">
          {viewMode === 'year' ? (
            <>
              {/* Year Grid Header */}
              <div className="flex justify-between items-center mb-3">
                <span className="font-medium text-gray-600 text-sm">
                  {years[0]} - {years[years.length - 1]}
                </span>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleYearChange(-24)}
                    className="p-0 w-8 h-8"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleYearChange(24)}
                    className="p-0 w-8 h-8"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* Year Grid */}
              <div className="gap-1 grid grid-cols-4">
                {years.map((year) => (
                  <Button
                    key={year}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleYearSelect(year)}
                    className={cn(
                      "h-8 text-xs",
                      value?.year === year
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "hover:bg-gray-100"
                    )}
                  >
                    {year}
                  </Button>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Month Selection Header */}
              <div className="flex justify-between items-center mb-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToYearView}
                  className="p-0 w-8 h-8"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="font-medium text-sm">{currentYear}</span>
                <div className="w-8"></div> {/* Spacer for alignment */}
              </div>
              
              {/* Month Grid */}
              <div className="gap-1 grid grid-cols-3">
                {months.map((month, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMonthSelect(index + 1)}
                    className={cn(
                      "h-8 text-xs",
                      value?.year === currentYear && value?.month === index + 1
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "hover:bg-gray-100"
                    )}
                  >
                    {month.slice(0, 3)}
                  </Button>
                ))}
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
