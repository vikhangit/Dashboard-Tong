"use client";

import { useState, useEffect, useMemo } from "react";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  format,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfWeek,
  endOfWeek,
  isSameDay,
  eachDayOfInterval,
  subDays,
  startOfDay,
  endOfDay,
  startOfYear,
  endOfYear,
  subYears,
  eachMonthOfInterval,
  isSameMonth,
  getDaysInMonth,
  getDaysInYear,
  eachWeekOfInterval,
} from "date-fns";
import { vi } from "date-fns/locale";
import { Revenue } from "@/lib/types";
import {
  Loader2,
  Search,
  TrendingUp,
  TrendingDown,
  LayoutGrid,
  Building2,
  ChevronLeft,
  ChevronRight,
  Banknote,
  List,
  Plus,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";

export default function RevenuePage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Revenue[]>([]);

  // Filters
  const [timeFilter, setTimeFilter] = useState<
    "day" | "week" | "month" | "year"
  >("month");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedProject, setSelectedProject] = useState<string | null>(null); // null = All
  const [searchProject, setSearchProject] = useState("");
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchRevenues();
  }, []);

  const fetchRevenues = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/revenue");
      const result = await res.json();
      if (result.success) {
        const parsedData = result.data.map((item: any) => ({
          ...item,
          date: new Date(item.date),
          createdAt: new Date(item.createdAt),
        }));
        setData(parsedData);
      }
    } catch (error) {
      console.error("Failed to fetch revenue data", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Hero Section Stats: Dynamic based on filters ---
  const heroStats = useMemo(() => {
    let currentStart, currentEnd;
    let prevStart, prevEnd;
    let periodLabel = "";
    let compareLabel = "";

    // 1. Determine Date Ranges
    if (timeFilter === "day") {
      currentStart = startOfDay(selectedDate);
      currentEnd = endOfDay(selectedDate);
      const prevDate = subDays(selectedDate, 1);
      prevStart = startOfDay(prevDate);
      prevEnd = endOfDay(prevDate);
      periodLabel = "Ngày này";
      compareLabel = "so với ngày trước";
    } else if (timeFilter === "week") {
      currentStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
      currentEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
      const prevDate = subDays(selectedDate, 7);
      prevStart = startOfWeek(prevDate, { weekStartsOn: 1 });
      prevEnd = endOfWeek(prevDate, { weekStartsOn: 1 });
      periodLabel = "Tuần này";
      compareLabel = "so với tuần trước";
    } else if (timeFilter === "month") {
      currentStart = startOfMonth(selectedDate);
      currentEnd = endOfMonth(selectedDate);
      const prevDate = subMonths(selectedDate, 1);
      prevStart = startOfMonth(prevDate);
      prevEnd = endOfMonth(prevDate);
      periodLabel = "Tháng này";
      compareLabel = "so với tháng trước";
    } else {
      // Year
      currentStart = startOfYear(selectedDate);
      currentEnd = endOfYear(selectedDate);
      const prevDate = subYears(selectedDate, 1);
      prevStart = startOfYear(prevDate);
      prevEnd = endOfYear(prevDate);
      periodLabel = "Năm này";
      compareLabel = "so với năm trước";
    }

    // 2. Filter Data Helper
    const calculateRevenue = (start: Date, end: Date) => {
      return data
        .filter((d) => {
          const inDateRange = d.date >= start && d.date <= end;
          const inProject = selectedProject
            ? d.projectName === selectedProject
            : true;
          return inDateRange && inProject;
        })
        .reduce((sum, item) => sum + item.amount, 0);
    };

    const currentRevenue = calculateRevenue(currentStart, currentEnd);
    const previousRevenue = calculateRevenue(prevStart, prevEnd);

    const growth =
      previousRevenue === 0
        ? currentRevenue > 0
          ? 100
          : 0
        : ((currentRevenue - previousRevenue) / previousRevenue) * 100;

    return {
      currentRevenue,
      growth,
      periodLabel,
      compareLabel,
    };
  }, [data, timeFilter, selectedDate, selectedProject]);

  // --- Left Column: Project List & Revenue ---
  const projectStats = useMemo(() => {
    // 1. Determine Date Range for the current filter
    let start, end;
    let prevStart, prevEnd;

    if (timeFilter === "day") {
      start = startOfDay(selectedDate);
      end = endOfDay(selectedDate);
      const prevDate = subDays(selectedDate, 1);
      prevStart = startOfDay(prevDate);
      prevEnd = endOfDay(prevDate);
    } else if (timeFilter === "week") {
      start = startOfWeek(selectedDate, { weekStartsOn: 1 });
      end = endOfWeek(selectedDate, { weekStartsOn: 1 });
      const prevDate = subDays(selectedDate, 7);
      prevStart = startOfWeek(prevDate, { weekStartsOn: 1 });
      prevEnd = endOfWeek(prevDate, { weekStartsOn: 1 });
    } else if (timeFilter === "month") {
      start = startOfMonth(selectedDate);
      end = endOfMonth(selectedDate);
      const prevDate = subMonths(selectedDate, 1);
      prevStart = startOfMonth(prevDate);
      prevEnd = endOfMonth(prevDate);
    } else {
      start = startOfYear(selectedDate);
      end = endOfYear(selectedDate);
      const prevDate = subYears(selectedDate, 1);
      prevStart = startOfYear(prevDate);
      prevEnd = endOfYear(prevDate);
    }

    // 2. Group by Project and Calculate Total
    const stats: Record<string, { current: number; previous: number }> = {};
    const allProjects = new Set<string>();

    data.forEach((d) => {
      allProjects.add(d.projectName);
      if (!stats[d.projectName]) {
        stats[d.projectName] = { current: 0, previous: 0 };
      }

      if (d.date >= start && d.date <= end) {
        stats[d.projectName].current += d.amount;
      }
      if (d.date >= prevStart && d.date <= prevEnd) {
        stats[d.projectName].previous += d.amount;
      }
    });

    const projectsWithRevenue = Array.from(allProjects).map((name) => {
      const current = stats[name]?.current || 0;
      const previous = stats[name]?.previous || 0;
      let growth = 0;

      if (previous === 0) {
        growth = current > 0 ? 100 : 0;
      } else {
        growth = ((current - previous) / previous) * 100;
      }

      return {
        name,
        total: current,
        growth,
      };
    });

    // Filter by search
    let filtered = projectsWithRevenue;
    if (searchProject) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchProject.toLowerCase()),
      );
    }

    // Sort by Total Revenue Descending
    return filtered.sort((a, b) => b.total - a.total);
  }, [data, timeFilter, selectedDate, searchProject]);

  // --- Right Column: Filtered Data ---
  const filteredData = useMemo(() => {
    let filtered = data;

    // 1. Time Filter
    let start, end;
    if (timeFilter === "day") {
      start = startOfDay(selectedDate);
      end = endOfDay(selectedDate);
    } else if (timeFilter === "week") {
      start = startOfWeek(selectedDate, { weekStartsOn: 1 });
      end = endOfWeek(selectedDate, { weekStartsOn: 1 });
    } else if (timeFilter === "month") {
      start = startOfMonth(selectedDate);
      end = endOfMonth(selectedDate);
    } else {
      start = startOfYear(selectedDate);
      end = endOfYear(selectedDate);
    }

    filtered = filtered.filter((d) => d.date >= start && d.date <= end);

    // 2. Project Filter
    if (selectedProject) {
      filtered = filtered.filter((d) => d.projectName === selectedProject);
    }

    // Sort Descending Date
    return filtered.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [data, timeFilter, selectedDate, selectedProject]);

  // --- Right Column: Stats (Total, Max, Min, Average) ---
  const filteredStats = useMemo(() => {
    const total = filteredData.reduce((sum, item) => sum + item.amount, 0);

    let max = 0;
    let min = 0;
    let average = 0;
    let unitLabel = "ngày";

    if (timeFilter === "month") {
      unitLabel = "tuần";
      const start = startOfMonth(selectedDate);
      const end = endOfMonth(selectedDate);
      const weeks = eachWeekOfInterval({ start, end }, { weekStartsOn: 1 });

      const weeklyValues = weeks.map((weekStart) => {
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
        return filteredData
          .filter((d) => d.date >= weekStart && d.date <= weekEnd)
          .reduce((sum, item) => sum + item.amount, 0);
      });

      max = weeklyValues.length > 0 ? Math.max(...weeklyValues) : 0;
      min = weeklyValues.length > 0 ? Math.min(...weeklyValues) : 0;
      average = weeklyValues.length > 0 ? total / weeklyValues.length : 0;
    } else if (timeFilter === "year") {
      unitLabel = "tháng";
      const start = startOfYear(selectedDate);
      const end = endOfYear(selectedDate);
      const months = eachMonthOfInterval({ start, end });

      const monthlyValues = months.map((monthStart) => {
        return filteredData
          .filter((d) => isSameMonth(d.date, monthStart))
          .reduce((sum, item) => sum + item.amount, 0);
      });

      max = monthlyValues.length > 0 ? Math.max(...monthlyValues) : 0;
      min = monthlyValues.length > 0 ? Math.min(...monthlyValues) : 0;
      average = monthlyValues.length > 0 ? total / monthlyValues.length : 0;
    } else {
      // Day, Week
      const values = filteredData.map((d) => d.amount);
      max = values.length > 0 ? Math.max(...values) : 0;
      min = values.length > 0 ? Math.min(...values) : 0;

      let daysCount = 1;
      if (timeFilter === "week") daysCount = 7;
      // For Day filter, daysCount is 1.

      average = total / daysCount;
    }

    return { total, max, min, average, unitLabel };
  }, [filteredData, timeFilter, selectedDate]);

  // --- Chart Data ---
  const chartData = useMemo(() => {
    if (timeFilter === "day") {
      return filteredData
        .map((d) => ({
          name: format(d.date, "HH:mm"), // or index
          value: d.amount,
        }))
        .reverse();
    } else if (timeFilter === "week") {
      // Group by Day (Mon-Sun)
      const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
      const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
      const days = eachDayOfInterval({ start, end });

      return days.map((day) => {
        const dayTotal = filteredData
          .filter((d) => isSameDay(d.date, day))
          .reduce((sum, d) => sum + d.amount, 0);
        return {
          name: format(day, "dd/MM", { locale: vi }),
          value: dayTotal,
        };
      });
    } else if (timeFilter === "month") {
      // Month: Group by Week
      const start = startOfMonth(selectedDate);
      const end = endOfMonth(selectedDate);
      const weeks = eachWeekOfInterval({ start, end }, { weekStartsOn: 1 });

      return weeks.map((weekStart, index) => {
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
        const weekTotal = filteredData
          .filter((d) => d.date >= weekStart && d.date <= weekEnd)
          .reduce((sum, d) => sum + d.amount, 0);

        // Label: "Tuần 1", "Tuần 2"... or Date Range "01/02 - 07/02"
        // Let's use "Tuần X" for brevity as requested implicitly by chart context
        return {
          name: `Tuần ${index + 1}`,
          value: weekTotal,
          fullLabel: `${format(weekStart, "dd/MM")} - ${format(weekEnd, "dd/MM")}`, // Optional usage
        };
      });
    } else {
      // Year: Group by Month
      const start = startOfYear(selectedDate);
      const end = endOfYear(selectedDate);
      const months = eachMonthOfInterval({ start, end });

      return months.map((month) => {
        const monthTotal = filteredData
          .filter((d) => isSameMonth(d.date, month))
          .reduce((sum, d) => sum + d.amount, 0);
        return {
          name: format(month, "'T'MM"),
          value: monthTotal,
        };
      });
    }
  }, [filteredData, timeFilter, selectedDate]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);

  const formatLargeCurrency = (val: number) => {
    if (val >= 1_000_000_000) {
      // 1.5 Tỷ, 1 Tỷ
      return (
        (val / 1_000_000_000).toLocaleString("vi-VN", {
          maximumFractionDigits: 1,
        }) + " Tỷ"
      );
    }
    if (val >= 1_000_000) {
      // 1.5 Triệu, 1 Triệu
      return (
        (val / 1_000_000).toLocaleString("vi-VN", {
          maximumFractionDigits: 1,
        }) + " Triệu"
      );
    }
    // Handle hundreds of thousands (e.g. 500k -> 500 Nghìn)
    if (val >= 1_000) {
      return (
        (val / 1_000).toLocaleString("vi-VN", { maximumFractionDigits: 0 }) +
        " Nghìn"
      );
    }
    return formatCurrency(val);
  };

  const navigateDate = (direction: "prev" | "next") => {
    const modifier = direction === "prev" ? -1 : 1;
    if (timeFilter === "day") {
      setSelectedDate((prev) => subDays(prev, -modifier)); // subDays(d, -1) = addDays(1)
    } else if (timeFilter === "week") {
      // add weeks not directly imported, use subDays(7)
      setSelectedDate((prev) => subDays(prev, -modifier * 7));
    } else if (timeFilter === "month") {
      setSelectedDate((prev) => subMonths(prev, -modifier));
    } else {
      setSelectedDate((prev) => subYears(prev, -modifier));
    }
  };

  const getDateLabel = () => {
    if (timeFilter === "day")
      return format(selectedDate, "dd/MM/yyyy", { locale: vi });
    if (timeFilter === "week") {
      const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
      const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
      return `${format(start, "dd/MM")} - ${format(end, "dd/MM/yyyy")}`;
    }
    if (timeFilter === "month")
      return format(selectedDate, "'Tháng' MM, yyyy", { locale: vi });
    return format(selectedDate, "'Năm' yyyy", { locale: vi });
  };

  return (
    <div className="min-h-screen gradient-holographic flex flex-col">
      <PageHeader
        title="Doanh thu"
        icon={<Banknote className="size-6 text-green-600" />}
      />

      <main className="flex-1 container mx-auto px-4 py-4 max-w-7xl flex flex-col gap-4 sm:gap-6">
        {/* --- Date & Time Filters (Moved) --- */}
        <div className="glass-card p-3 rounded-2xl border border-white/40 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-1 bg-white/50 p-1 rounded-lg border w-full sm:w-auto overflow-x-auto">
            {(["day", "week", "month", "year"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeFilter(t)}
                className={cn(
                  "flex-1 sm:flex-none px-3 py-1.5 rounded-md text-base font-medium transition-all whitespace-nowrap",
                  timeFilter === t
                    ? "bg-white shadow-sm text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/50",
                )}
              >
                {t === "day"
                  ? "Ngày"
                  : t === "week"
                    ? "Tuần"
                    : t === "month"
                      ? "Tháng"
                      : "Năm"}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 w-full sm:w-auto justify-between sm:justify-end">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => navigateDate("prev")}
            >
              <ChevronLeft className="size-7" />
            </Button>
            <span className="text-lg font-medium min-w-[100px] text-center">
              {getDateLabel()}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => navigateDate("next")}
            >
              <ChevronRight className="size-7" />
            </Button>
          </div>
        </div>

        {/* --- Hero Section --- */}
        <div className="glass-card p-3 sm:p-4 rounded-2xl border border-white/40 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Tổng doanh số ({heroStats.periodLabel})
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDetails(!showDetails)}
                className="h-6 w-6 text-blue-600 bg-blue-100 hover:bg-blue-200 hover:text-blue-500"
              >
                {showDetails ? (
                  <Minus className="size-7" />
                ) : (
                  <Plus className="size-7" />
                )}
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
              <span className="text-2xl sm:text-lg font-bold text-foreground">
                {formatCurrency(heroStats.currentRevenue)}
              </span>
              <div
                className={cn(
                  "flex items-center text-base font-medium my-1 px-2 py-0.5 rounded-full w-fit",
                  heroStats.growth >= 0
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700",
                )}
              >
                {heroStats.growth >= 0 ? (
                  <TrendingUp className="size-4 mr-1" />
                ) : (
                  <TrendingDown className="size-4 mr-1" />
                )}
                {Math.abs(heroStats.growth).toFixed(1)}%{" "}
                {heroStats.compareLabel}
              </div>
            </div>
          </div>
        </div>

        {/* --- Main Content Split View --- */}
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 h-auto lg:h-[800px]">
          {/* Left Column: Project List (35% or 100%) */}
          <Card
            className={cn(
              "h-[600px] lg:h-full border-none shadow-md bg-white/60 backdrop-blur-md flex flex-col transition-all duration-300 gap-0 py-0",
              showDetails ? "lg:w-[35%]" : "w-full",
            )}
          >
            <div className="p-3 border-b border-gray-100">
              <h3 className="font-semibold text-lg mb-2 flex items-center">
                <List className="size-6 mr-2 text-primary" />
                Danh sách dự án
              </h3>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm..."
                  className="pl-9 bg-white/80 h-10 text-base"
                  value={searchProject}
                  onChange={(e) => setSearchProject(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 relative min-h-0">
              <div className="absolute inset-0 p-2 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-blue-600/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-blue-600">
                <div className="space-y-1 pb-4">
                  <button
                    onClick={() => setSelectedProject(null)}
                    className={cn(
                      "w-full text-left px-3 py-2.5 rounded-lg transition-all text-base font-medium flex items-center justify-between group",
                      selectedProject === null
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "hover:bg-white/80 text-muted-foreground hover:text-foreground hover:translate-x-1",
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border",
                          selectedProject === null
                            ? "bg-white/20 border-white/30 text-white"
                            : "bg-primary/10 border-primary/20 text-primary",
                        )}
                      >
                        <LayoutGrid className="w-4 h-4" />
                      </div>
                      <span className="truncate">Tất cả</span>
                    </span>
                    {selectedProject === null && (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>

                  {projectStats.map((project) => (
                    <button
                      key={project.name}
                      onClick={() => setSelectedProject(project.name)}
                      className={cn(
                        "w-full text-left px-2 py-2 rounded-lg transition-all flex items-center justify-between group",
                        selectedProject === project.name
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "hover:bg-white/80 text-muted-foreground hover:text-foreground hover:translate-x-1",
                      )}
                    >
                      <span className="flex items-center gap-2 overflow-hidden w-full">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border text-sm font-bold",
                            selectedProject === project.name
                              ? "bg-white/20 border-white/30 text-white"
                              : "bg-primary/10 border-primary/20 text-primary",
                          )}
                        >
                          {project.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex items-center justify-between flex-1 overflow-hidden">
                          <span
                            className={cn(
                              "truncate text-lg mr-2",
                              selectedProject === project.name
                                ? "text-white"
                                : "text-blue-700",
                            )}
                          >
                            {project.name}
                          </span>
                          <div className="flex items-center justify-end gap-2 shrink-0">
                            <span
                              className={cn(
                                "text-lg font-bold",
                                selectedProject === project.name
                                  ? "text-primary-foreground/90"
                                  : "text-muted-foreground",
                              )}
                            >
                              {formatLargeCurrency(project.total)}
                            </span>
                            {project.growth !== 0 && (
                              <span
                                className={cn(
                                  "text-xs font-medium flex items-center",
                                  project.growth > 0
                                    ? selectedProject === project.name
                                      ? "text-green-200"
                                      : "text-green-600"
                                    : selectedProject === project.name
                                      ? "text-red-200"
                                      : "text-red-600",
                                )}
                              >
                                {project.growth > 0 ? (
                                  <TrendingUp className="w-3 h-3 mr-0.5" />
                                ) : (
                                  <TrendingDown className="w-3 h-3 mr-0.5" />
                                )}
                                {Math.abs(project.growth).toFixed(0)}%
                              </span>
                            )}
                          </div>
                        </div>
                      </span>
                      {selectedProject === project.name && (
                        <ChevronRight className="w-4 h-4 shrink-0 ml-1" />
                      )}
                    </button>
                  ))}

                  {projectStats.length === 0 && (
                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                      Không tìm thấy dự án
                    </div>
                  )}
                </div>
              </div>
              {/* Scroll Hint Gradient */}
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none rounded-b-xl" />
            </div>
          </Card>

          {/* Right Column: Details & Chart (65%) */}
          {showDetails && (
            <Card className="lg:w-[65%] h-full min-h-[500px] border-none shadow-md bg-white/60 backdrop-blur-md flex flex-col gap-0 py-0">
              {/* Header / Time Filter */}

              <ScrollArea className="flex-1">
                <div className="p-3 sm:p-4 space-y-4">
                  {/* Title & Stats */}
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      {selectedProject
                        ? `Doanh số ${selectedProject}`
                        : "Chi tiết doanh số toàn bộ"}
                      <span className="text-muted-foreground font-normal ml-2 hidden sm:inline text-lg">
                        (
                        {timeFilter === "day"
                          ? "Ngày"
                          : timeFilter === "week"
                            ? "Tuần"
                            : timeFilter === "month"
                              ? "Tháng"
                              : "Năm"}
                        )
                      </span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
                      <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                        <p className="text-base text-blue-600 font-medium uppercase mb-0.5">
                          Tổng doanh thu
                        </p>
                        <p className="text-xl font-bold text-blue-900">
                          {formatLargeCurrency(filteredStats.total)}
                        </p>
                      </div>
                      <div className="bg-purple-50/50 p-3 rounded-xl border border-purple-100">
                        <p className="text-base text-purple-600 font-medium uppercase mb-0.5">
                          Trung bình/{filteredStats.unitLabel}
                        </p>
                        <p className="text-xl font-bold text-purple-900">
                          {formatLargeCurrency(filteredStats.average)}
                        </p>
                      </div>
                      <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                        <p className="text-base text-emerald-600 font-medium uppercase mb-0.5">
                          Cao nhất/{filteredStats.unitLabel}
                        </p>
                        <p className="text-xl font-bold text-emerald-900">
                          {formatLargeCurrency(filteredStats.max)}
                        </p>
                      </div>
                      <div className="bg-orange-50/50 p-3 rounded-xl border border-orange-100">
                        <p className="text-base text-orange-600 font-medium uppercase mb-0.5">
                          Thấp nhất/{filteredStats.unitLabel}
                        </p>
                        <p className="text-xl font-bold text-orange-900">
                          {formatLargeCurrency(filteredStats.min)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="h-[250px] w-full bg-white/40 rounded-xl p-0 border border-white/40">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#E5E7EB"
                        />
                        <XAxis
                          dataKey="name"
                          stroke="#6B7280"
                          fontSize={16}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#6B7280"
                          fontSize={16}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => {
                            if (value >= 1000000000) {
                              return `${(value / 1000000000).toFixed(1)}Tỷ`;
                            }
                            return `${(value / 1000000).toFixed(0)}Tr`;
                          }}
                          width={50}
                        />
                        <Tooltip
                          cursor={{ fill: "#F3F4F6" }}
                          contentStyle={{
                            borderRadius: "8px",
                            border: "none",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                            fontSize: "22px",
                          }}
                          formatter={(value: number) => [formatCurrency(value)]}
                        />
                        <Bar
                          dataKey="value"
                          fill="#3B82F6"
                          radius={[4, 4, 0, 0]}
                          maxBarSize={40}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </ScrollArea>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
