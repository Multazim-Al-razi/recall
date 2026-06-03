import { useState } from "react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday
} from "date-fns";
import { cn } from "@/lib/utils";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

interface CalendarDropdownProps {
  value: Date | null;
  onChange: (date: Date) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export const AnimatedCalendarDropdown = ({
  value,
  onChange,
  label = "Select Date",
  placeholder = "Choose a date",
  className,
}: CalendarDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(value || new Date());

  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);
  const days = eachDayOfInterval({
    start: startOfWeek(firstDayOfMonth),
    end: endOfWeek(lastDayOfMonth),
  });

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const handleDayClick = (day: Date) => {
    onChange(day);
    setIsOpen(false);
  };

  return (
    <div className={cn("relative inline-block w-full", className)}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-ink-soft mb-2">
          {label}
        </label>
      )}
      
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-300",
          "bg-surface hover:border-rausch/50 focus:border-rausch focus:outline-none focus:ring-2 focus:ring-rausch-glow",
          "shadow-sm hover:shadow-md",
          !value ? "text-muted" : "text-ink",
        )}
      >
        <span className="flex items-center gap-3">
          <svg
            className={cn("w-5 h-5", value ? "text-teal" : "text-muted")}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {value ? format(value, "MMMM d, yyyy") : placeholder}
        </span>
        <ChevronRightIcon
          className={cn(
            "w-4 h-4 text-muted transition-transform duration-300",
            isOpen && "rotate-90"
          )}
        />
      </button>

      {/* Dropdown Calendar */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Calendar Panel */}
          <div className={cn(
            "absolute z-50 mt-2 p-4 rounded-2xl shadow-lg border",
            "bg-surface border-hairline",
            "top-full left-0 right-0 max-w-[320px]",
            "animate-in fade-in slide-in-from-top-2 duration-200",
          )}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handlePrevMonth}
                className={cn(
                  "p-2 rounded-lg hover:bg-surface-2 transition-colors",
                  "text-ink-soft hover:text-ink"
                )}
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              
              <span className="font-semibold text-ink">
                {format(currentDate, "MMMM yyyy")}
              </span>
              
              <button
                onClick={handleNextMonth}
                className={cn(
                  "p-2 rounded-lg hover:bg-surface-2 transition-colors",
                  "text-ink-soft hover:text-ink"
                )}
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Day Names */}
            <div className="grid grid-cols-7 mb-2">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-semibold text-muted"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                const isInCurrentMonth = isSameMonth(day, currentDate);
                const isSelected = value ? isSameDay(day, value) : false;
                const isTodayDate = isToday(day);

                return (
                  <button
                    key={index}
                    onClick={() => handleDayClick(day)}
                    className={cn(
                      "aspect-square rounded-lg text-sm font-medium transition-all duration-200",
                      !isInCurrentMonth && "text-muted/40",
                      isSelected && "bg-rausch text-white shadow-md scale-105",
                      !isSelected && !isInCurrentMonth && "hover:bg-surface-2",
                      isSelected || isTodayDate
                        ? "hover:scale-105"
                        : "hover:bg-surface-2 hover:shadow-sm",
                    )}
                  >
                    <span className={cn(
                      "flex items-center justify-center h-full",
                      isTodayDate && !isSelected && "text-rausch font-bold",
                    )}>
                      {format(day, "d")}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
