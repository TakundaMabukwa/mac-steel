"use client"

import * as React from "react"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface DatePickerWithDayProps {
  value?: { year: number; month: number; day: number }
  onChange?: (value: { year: number; month: number; day: number }) => void
  placeholder?: string
  className?: string
}

export function DatePickerWithDay({ value, onChange, placeholder, className }: DatePickerWithDayProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [currentYear, setCurrentYear] = React.useState(value?.year || new Date().getFullYear())
  const [currentMonth, setCurrentMonth] = React.useState(value?.month || new Date().getMonth() + 1)
  const [viewMode, setViewMode] = React.useState<'year' | 'month' | 'day'>('year')

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
    setCurrentMonth(month)
    setViewMode('day')
  }

  const handleDaySelect = (day: number) => {
    const newValue = { year: currentYear, month: currentMonth, day }
    onChange?.(newValue)
    setIsOpen(false)
    setViewMode('year') // Reset to year view for next time
  }

  const handleBackToYearView = () => {
    setViewMode('year')
  }

  const handleBackToMonthView = () => {
    setViewMode('month')
  }

  const displayValue = value ? `${months[value.month - 1]} ${value.day}, ${value.year}` : placeholder

  // Generate years for the grid (24 years: 12 before current, 12 after)
  const currentYearValue = new Date().getFullYear()
  const years = Array.from({ length: 24 }, (_, i) => currentYearValue - 12 + i)
  
  // Check if year should be disabled (2024 and earlier)
  const isYearDisabled = (year: number) => year <= 2024

  // Generate days for the selected month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate()
  }

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start w-full font-normal text-left",
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
                {years.map((year) => {
                  const disabled = isYearDisabled(year);
                  return (
                    <Button
                      key={year}
                      variant="ghost"
                      size="sm"
                      onClick={() => !disabled && handleYearSelect(year)}
                      disabled={disabled}
                      className={cn(
                        "h-8 text-xs",
                        disabled
                          ? "text-gray-400 cursor-not-allowed opacity-50"
                          : value?.year === year
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "hover:bg-gray-100"
                      )}
                    >
                      {year}
                    </Button>
                  );
                })}
              </div>
            </>
          ) : viewMode === 'month' ? (
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
          ) : (
            <>
              {/* Day Selection Header */}
              <div className="flex justify-between items-center mb-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToMonthView}
                  className="p-0 w-8 h-8"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="font-medium text-sm">{months[currentMonth - 1]} {currentYear}</span>
                <div className="w-8"></div> {/* Spacer for alignment */}
              </div>
              
              {/* Day Grid */}
              <div className="gap-1 grid grid-cols-7">
                {days.map((day) => (
                  <Button
                    key={day}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDaySelect(day)}
                    className={cn(
                      "h-8 text-xs",
                      value?.year === currentYear && value?.month === currentMonth && value?.day === day
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "hover:bg-gray-100"
                    )}
                  >
                    {day}
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
