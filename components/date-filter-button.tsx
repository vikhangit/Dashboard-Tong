"use client";

import { useState } from "react";
import { CalendarDays, X, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export type DateFilterMode = "day" | "month";

export interface DateFilterValue {
  mode: DateFilterMode;
  date: Date;
}

interface DateFilterButtonProps {
  value?: DateFilterValue | null;
  onChange: (value: DateFilterValue | null) => void;
  className?: string;
}

export function DateFilterButton({
  value,
  onChange,
  className,
}: DateFilterButtonProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<DateFilterMode>("day");

  const handleDaySelect = (date: Date | undefined) => {
    if (date) {
      onChange({ mode: "day", date });
      setOpen(false);
    }
  };

  const handleMonthSelect = (month: Date) => {
    onChange({ mode: "month", date: month });
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setOpen(false);
  };

  const isActive = !!value;

  const label = value
    ? value.mode === "day"
      ? format(value.date, "dd/MM/yyyy")
      : format(value.date, "MM/yyyy")
    : null;

  // Generate months for month picker
  const currentYear = new Date().getFullYear();
  const months = Array.from(
    { length: 12 },
    (_, i) => new Date(currentYear, i, 1),
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          className={cn(
            "fixed bottom-20 right-4 z-50 size-11 rounded-full shadow-lg transition-all duration-300",
            isActive
              ? "bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/30 ring-2 ring-blue-400/50"
              : "bg-gradient-to-br from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-white shadow-slate-500/20",
            className,
          )}
        >
          <div className="relative">
            <CalendarDays className="size-6" />
            {isActive && (
              <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-green-400 ring-2 ring-white animate-pulse" />
            )}
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        side="top"
        align="end"
        sideOffset={12}
        className="w-auto p-0 rounded-2xl border-slate-200/80 shadow-2xl overflow-hidden"
      >
        {/* Header with mode toggle */}
        <div className="flex items-center justify-center bg-gradient-to-r from-slate-900 to-slate-800 px-5 py-3">
          <div className="flex items-center gap-1.5 bg-slate-700/50 rounded-xl p-1">
            <button
              onClick={() => setMode("day")}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                mode === "day"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                  : "text-slate-300 hover:text-white hover:bg-slate-600/50",
              )}
            >
              Theo ngày
            </button>
            <button
              onClick={() => setMode("month")}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                mode === "month"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                  : "text-slate-300 hover:text-white hover:bg-slate-600/50",
              )}
            >
              Theo tháng
            </button>
          </div>
        </div>

        {/* Active filter indicator */}
        {isActive && (
          <div className="px-5 py-2.5 bg-blue-50/80 border-b border-blue-100 flex items-center gap-2.5">
            <CalendarClock className="size-4 text-blue-500" />
            <span className="text-base text-blue-700 font-medium">
              Đang lọc: {label}
            </span>
            <button
              onClick={handleClear}
              className="text-slate-600 hover:text-white transition-colors rounded-lg hover:bg-slate-700/80 ml-3"
              title="Xóa bộ lọc"
            >
              <X className="size-6" />
            </button>
          </div>
        )}

        {/* Content */}
        {mode === "day" ? (
          <div className="p-4 [--cell-size:--spacing(10)]">
            <Calendar
              mode="single"
              selected={value?.mode === "day" ? value.date : undefined}
              onSelect={handleDaySelect}
              locale={vi}
              className="rounded-xl !p-0"
            />
          </div>
        ) : (
          <div className="p-5">
            {/* Year navigation */}
            <YearMonthPicker
              selectedDate={value?.mode === "month" ? value.date : undefined}
              onSelect={handleMonthSelect}
            />
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

// ─── Year/Month Picker Sub-component ─────────────────────────────

function YearMonthPicker({
  selectedDate,
  onSelect,
}: {
  selectedDate?: Date;
  onSelect: (date: Date) => void;
}) {
  const [year, setYear] = useState(
    selectedDate?.getFullYear() ?? new Date().getFullYear(),
  );

  const monthNames = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
  ];

  const isSelectedMonth = (monthIndex: number) =>
    selectedDate &&
    selectedDate.getFullYear() === year &&
    selectedDate.getMonth() === monthIndex;

  const isCurrentMonth = (monthIndex: number) => {
    const now = new Date();
    return now.getFullYear() === year && now.getMonth() === monthIndex;
  };

  return (
    <div className="w-[260px]">
      {/* Year selector */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setYear((y) => y - 1)}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
        >
          <svg
            className="size-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <span className="text-lg font-semibold text-blue-600">{year}</span>
        <button
          onClick={() => setYear((y) => y + 1)}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
        >
          <svg
            className="size-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Month grid */}
      <div className="grid grid-cols-3 gap-1">
        {monthNames.map((name, index) => (
          <button
            key={index}
            onClick={() => onSelect(new Date(year, index, 1))}
            className={cn(
              "py-1 px-1 rounded-xl text-lg font-medium transition-all duration-200",
              isSelectedMonth(index)
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                : isCurrentMonth(index)
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-slate-700 hover:bg-slate-100",
            )}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}
