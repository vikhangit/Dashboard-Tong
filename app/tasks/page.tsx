"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Briefcase, Search, Calendar, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import axios from "axios";
import { Task, ApiResponse } from "@/lib/types";
import { format } from "date-fns";

// Remove old configs if not needed, or keep for reference if they are used elsewhere (though we replaced them).
// const statusConfig = ...
// const priorityConfig = ...

export default function TasksPage() {
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [displayedTasks, setDisplayedTasks] = useState<Task[]>([]);
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
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchTasks();
  }, []); // Only run once on mount

  useEffect(() => {
    filterAndPaginateTasks();
  }, [
    allTasks,
    debouncedSearch,
    statusFilter,
    projectFilter,
    assigneeFilter,
    pagination.page,
  ]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const output = await axios.get<ApiResponse<Task>>(
        "https://api.apecglobal.net/api/v1/tasks/outside",
        {
          params: {
            page: 1,
            limit: 1000, // Fetch a large number to get "all" tasks for client-side filtering
          },
        },
      );

      if (output.data.success) {
        setAllTasks(output.data.data.rows);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndPaginateTasks = () => {
    let filtered = [...allTasks];

    // Filter by search
    if (debouncedSearch) {
      const lowerSearch = debouncedSearch.toLowerCase();
      filtered = filtered.filter((task) =>
        task.name.toLowerCase().includes(lowerSearch),
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (task) => task.status.id === Number(statusFilter),
      );
    }

    // Filter by project
    if (projectFilter !== "all") {
      filtered = filtered.filter(
        (task) => task.project?.id === Number(projectFilter),
      );
    }

    // Filter by assignee
    if (assigneeFilter !== "all") {
      filtered = filtered.filter(
        (task) => task.assignee?.id === Number(assigneeFilter),
      );
    }

    // Pagination
    const total = filtered.length;
    const total_pages = Math.ceil(total / pagination.limit);
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    const paginated = filtered.slice(startIndex, endIndex);

    setPagination((prev) => ({
      ...prev,
      total,
      total_pages,
    }));
    setDisplayedTasks(paginated);
  };

  const statusConfig: Record<
    number,
    { label: string; color: string; textColor: string; icon?: any }
  > = {
    1: { label: "Mới tạo", color: "bg-blue-500", textColor: "text-blue-700" },
    2: {
      label: "Đang thực hiện",
      color: "bg-yellow-500",
      textColor: "text-yellow-700",
    },
    3: { label: "Tạm dừng", color: "bg-gray-500", textColor: "text-gray-700" },
    4: {
      label: "Hoàn thành",
      color: "bg-green-600",
      textColor: "text-green-700",
    },
    5: { label: "Hủy", color: "bg-red-500", textColor: "text-red-700" },
  };

  const statusOptions = [
    { value: "all", label: "Tất cả" },
    { value: "2", label: "Đang thực hiện" },
    { value: "4", label: "Hoàn thành" },
    { value: "3", label: "Tạm dừng" },
    { value: "5", label: "Hủy" },
  ];

  // Extract unique projects and assignees
  const uniqueProjects = Array.from(
    new Map(
      allTasks.filter((t) => t.project).map((t) => [t.project.id, t.project]),
    ).values(),
  );

  const uniqueAssignees = Array.from(
    new Map(
      allTasks
        .filter((t) => t.assignee)
        .map((t) => [t.assignee.id, t.assignee]),
    ).values(),
  );

  return (
    <div className="min-h-screen gradient-holographic">
      {/* Header */}
      <PageHeader
        title="Công việc"
        icon={<Briefcase className="size-6 text-blue-600" />}
      />

      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        {/* Filters and Search */}
        {/* Search */}
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-600 z-10" />
          <Input
            placeholder="Tìm kiếm công việc..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white backdrop-blur-sm border-muted/40"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 mb-6">
          {/* Status Filter (Horizontal Scroll) */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x">
            {statusOptions.map((option) => {
              const isActive = statusFilter === option.value;
              const config =
                option.value === "all"
                  ? null
                  : statusConfig[Number(option.value)];

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

          {/* Project & Assignee Filters */}
          <div className="grid grid-cols-1 gap-3">
            <Select
              value={projectFilter}
              onValueChange={(value) => {
                setProjectFilter(value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
            >
              <SelectTrigger className="bg-white/90 backdrop-blur-sm border-gray-200 text-gray-700 hover:bg-gray-100/80 transition-colors !h-auto py-2">
                <div className="flex items-start gap-2 max-w-full text-left">
                  <Briefcase className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
                  <span className="whitespace-normal break-words flex-1 leading-snug">
                    <SelectValue placeholder="Dự án" />
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectItem
                  value="all"
                  className="rounded-t-sm rounded-b-none py-3 border-b-2 border-gray-300 last:border-0 cursor-pointer"
                >
                  <div className="whitespace-normal break-words text-left max-w-[calc(100vw-4rem)] sm:max-w-xs">
                    Tất cả dự án
                  </div>
                </SelectItem>
                {uniqueProjects.map((project) => (
                  <SelectItem
                    key={project.id}
                    value={String(project.id)}
                    className="rounded-none last:rounded-b-sm py-3 border-b-2 border-gray-300 last:border-0 cursor-pointer"
                  >
                    <div className="whitespace-normal break-words text-left max-w-[calc(100vw-4rem)] sm:max-w-xs">
                      {project.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={assigneeFilter}
              onValueChange={(value) => {
                setAssigneeFilter(value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
            >
              <SelectTrigger className="bg-white/90 backdrop-blur-sm border-gray-200 text-gray-700 hover:bg-gray-100/80 transition-colors !h-auto py-2">
                <div className="flex items-start gap-2 max-w-full text-left">
                  <User className="w-4 h-4 shrink-0 mt-0.5 text-green-600" />
                  <span className="whitespace-normal break-words flex-1 leading-snug">
                    <SelectValue placeholder="Người thực hiện" />
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectItem
                  value="all"
                  className="rounded-t-sm rounded-b-none py-3 border-b-2 border-gray-300 last:border-0 cursor-pointer"
                >
                  <div className="whitespace-normal break-words text-left max-w-[calc(100vw-4rem)] sm:max-w-xs">
                    Tất cả nhân sự
                  </div>
                </SelectItem>
                {uniqueAssignees.map((assignee) => (
                  <SelectItem
                    key={assignee.id}
                    value={String(assignee.id)}
                    className="rounded-none last:rounded-b-sm py-3 border-b-2 border-gray-300 last:border-0 cursor-pointer"
                  >
                    <div className="whitespace-normal break-words text-left max-w-[calc(100vw-4rem)] sm:max-w-xs">
                      {assignee.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12">
              <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Đang tải dữ liệu...</p>
            </div>
          ) : displayedTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
                <Briefcase className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground">
                Không tìm thấy công việc nào
              </p>
            </div>
          ) : (
            displayedTasks.map((task) => {
              const config = statusConfig[task.status.id] || {
                label: task.status.name,
                color: "bg-gray-400",
                textColor: "text-gray-600",
              };

              return (
                <div
                  key={task.id}
                  className="group relative bg-card hover:bg-accent/5 transition-all duration-300 border rounded-xl overflow-hidden shadow-sm hover:shadow-md"
                >
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1 ${config.color}`}
                  />

                  <div className="p-4 pl-5">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <Badge
                        variant="secondary"
                        className={`font-normal ${config.color} text-white px-2 py-0.5 h-6 text-xs`}
                      >
                        {config.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-medium">
                        {" "}
                        # {task.id}{" "}
                      </span>
                    </div>

                    <h3 className="text-lg font-medium text-foreground leading-snug mb-3 line-clamp-2">
                      {task.name}
                    </h3>

                    <div className="flex flex-col gap-2 text-base mb-3">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-blue-500 shrink-0" />
                        <span className="truncate">
                          {task.project?.name || "Chưa có dự án"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-green-600 shrink-0" />
                        <span className="truncate">
                          {task.assignee?.name || "Chưa giao"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-orange-500 shrink-0" />
                        <span className="text-base">
                          {format(new Date(task.date_start), "dd/MM/yyyy")} -{" "}
                          {format(new Date(task.date_end), "dd/MM/yyyy")}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden flex-1">
                        <div
                          className={`h-full ${Number(task.process) === 100 ? "bg-green-500" : "bg-primary"}`}
                          style={{ width: `${task.process}%` }}
                        />
                      </div>
                      <span
                        className={`text-base font-medium min-w-[30px] text-right ${Number(task.process) === 100 ? "text-green-600" : "text-blue-600"}`}
                      >
                        {Number(task.process)}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/80 text-sm text-muted-foreground">
                      <span>
                        Tạo lúc:{" "}
                        {format(new Date(task.created_at), "HH:mm dd/MM/yyyy")}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {pagination.total > 0 && (
          <div className="mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    className={
                      pagination.page <= 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                    onClick={() => {
                      if (pagination.page > 1) {
                        setPagination((prev) => ({
                          ...prev,
                          page: prev.page - 1,
                        }));
                      }
                    }}
                  />
                </PaginationItem>

                {(() => {
                  const total = pagination.total_pages;
                  const current = pagination.page;
                  const maxVisible = 5;

                  let startPage = Math.max(1, current - 2);
                  const endPage = Math.min(total, startPage + maxVisible - 1);

                  if (endPage - startPage + 1 < maxVisible) {
                    startPage = Math.max(1, endPage - maxVisible + 1);
                  }

                  const length = Math.min(maxVisible, total);

                  return Array.from({ length }, (_, i) => startPage + i).map(
                    (pageNum) => (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          isActive={pagination.page === pageNum}
                          onClick={() =>
                            setPagination((prev) => ({
                              ...prev,
                              page: pageNum,
                            }))
                          }
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    ),
                  );
                })()}

                <PaginationItem>
                  <PaginationNext
                    className={
                      pagination.page >= pagination.total_pages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                    onClick={() => {
                      if (pagination.page < pagination.total_pages) {
                        setPagination((prev) => ({
                          ...prev,
                          page: prev.page + 1,
                        }));
                      }
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
            <div className="text-center text-xs text-muted-foreground mt-2">
              Hiển thị {displayedTasks.length} / {pagination.total} công việc
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
