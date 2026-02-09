"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AppPagination } from "@/components/app-pagination";
import { Plan } from "@/lib/types";
import { FileIconComponent } from "@/components/file-icon";
import { ExpandableText } from "@/components/expandable-text";
import axios from "axios";
import {
  Calendar,
  Search,
  Clock,
  PlayCircle,
  CheckCircle2,
  Paperclip,
  PauseCircle,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";

const statusConfig: Record<
  string,
  { label: string; color: string; icon: any; textColor: string }
> = {
  active: {
    label: "Đang thực hiện",
    color: "bg-blue-500",
    icon: PlayCircle,
    textColor: "text-blue-700",
  },
  completed: {
    label: "Hoàn thành",
    color: "bg-green-500",
    icon: CheckCircle2,
    textColor: "text-green-700",
  },
  paused: {
    label: "Tạm dừng",
    color: "bg-yellow-500",
    icon: PauseCircle,
    textColor: "text-yellow-700",
  },
  cancelled: {
    label: "Hủy",
    color: "bg-red-500",
    icon: XCircle,
    textColor: "text-red-700",
  },
};

const statusOptions = [
  { value: "all", label: "Tất cả" },
  { value: "active", label: "Đang thực hiện" },
  { value: "completed", label: "Hoàn thành" },
  { value: "paused", label: "Tạm dừng" },
  { value: "cancelled", label: "Hủy" },
];

export default function PlansPage() {
  const router = useRouter();
  const [allPlans, setAllPlans] = useState<Plan[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]); // Displayed plans (paginated)
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0,
  });
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Initial fetch of all plans
  useEffect(() => {
    fetchPlans();
  }, []);

  // Filter and pagination logic
  useEffect(() => {
    let result = [...allPlans];

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter((plan) => plan.status === statusFilter);
    }

    // Filter by search
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query),
      );
    }

    // Update total for pagination
    const total = result.length;
    const totalPages = Math.ceil(total / pagination.limit);

    // Slice for pagination
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    const paginatedPlans = result.slice(startIndex, endIndex);

    setPlans(paginatedPlans);
    setPagination((prev) => ({
      ...prev,
      total,
      total_pages: totalPages,
      // Reset to page 1 if current page is out of bounds (except when loading/initial)
      page: prev.page > totalPages && totalPages > 0 ? 1 : prev.page,
    }));
  }, [
    allPlans,
    statusFilter,
    debouncedSearch,
    pagination.page,
    pagination.limit,
  ]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/plans");
      if (response.data && response.data.success) {
        setAllPlans(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-holographic">
      <PageHeader
        title="Kế hoạch"
        icon={<Calendar className="size-6 text-blue-600" />}
      />

      <div className="container mx-auto px-4 py-6 max-w-3xl">
        {/* Search */}
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-foreground/50 z-10" />
          <Input
            placeholder="Tìm kiếm kế hoạch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white backdrop-blur-sm border-muted/40"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x mb-6">
          {statusOptions.map((option) => {
            const isActive = statusFilter === option.value;
            const config =
              option.value === "all" ? null : statusConfig[option.value];

            return (
              <button
                key={option.value}
                onClick={() => {
                  setStatusFilter(option.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 snap-start border ${
                  isActive
                    ? config
                      ? `${config.color} text-white border-transparent shadow-md`
                      : "bg-primary text-primary-foreground border-primary shadow-md"
                    : config
                      ? `${config.textColor} border-current/20 bg-white/90 hover:bg-accent hover:text-accent-foreground`
                      : "bg-background border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        {/* Plans List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Đang tải dữ liệu...</p>
            </div>
          ) : plans.length === 0 ? (
            <Card className="glass-card p-12 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Không có kế hoạch nào</p>
            </Card>
          ) : (
            plans.map((plan) => {
              const config = statusConfig[plan.status] || statusConfig.draft;
              const StatusIcon = config.icon;

              return (
                <Card
                  key={plan.id}
                  className="group relative bg-card hover:bg-accent/5 transition-all duration-300 border overflow-hidden shadow-sm hover:shadow-md"
                >
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1 ${config.color}`}
                  />

                  <div className="px-4">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <Badge
                        variant="secondary"
                        className={`font-normal ${config.color} text-white px-2 py-0.5 h-6 text-xs`}
                      >
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {config.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-medium">
                        {format(new Date(plan.createdAt), "dd/MM/yyyy")}
                      </span>
                    </div>

                    <h3 className="text-lg font-medium text-foreground leading-snug mb-2">
                      {plan.title}
                    </h3>

                    <div className="mb-4">
                      <ExpandableText text={plan.description || ""} />
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-base text-muted-foreground mt-auto">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span>
                          {format(new Date(plan.startDate), "dd/MM/yyyy")}
                        </span>
                        {plan.endDate && (
                          <>
                            <span>-</span>
                            <span>
                              {format(new Date(plan.endDate), "dd/MM/yyyy")}
                            </span>
                          </>
                        )}
                      </div>

                      {plan.attachments && plan.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2 w-full">
                          {plan.attachments.map((link, index) => (
                            <a
                              key={index}
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-xs bg-secondary/30 hover:bg-secondary px-2 py-1.5 rounded-md transition-colors text-foreground border border-transparent hover:border-border"
                              title={link}
                            >
                              <div className="w-5 h-5">
                                <FileIconComponent url={link} />
                              </div>
                              <span className="truncate max-w-[300px] font-medium text-blue-600 hover:text-blue-800 hover:underline">
                                {link}
                              </span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {pagination.total > 0 && (
          <div className="mt-6">
            <AppPagination
              page={pagination.page}
              total={pagination.total}
              limit={pagination.limit}
              onChange={(newPage) =>
                setPagination((prev) => ({ ...prev, page: newPage }))
              }
              itemName="kế hoạch"
              currentCount={plans.length}
            />
          </div>
        )}
      </div>
    </div>
  );
}
