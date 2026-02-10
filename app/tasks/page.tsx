"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Briefcase, Search, Calendar, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppPagination } from "@/components/app-pagination";
import { StatusFilter } from "@/components/status-filter";
import axios from "axios";
import { Task, ApiResponse } from "@/lib/types";
import { format } from "date-fns";
import { ReloadButton } from "@/components/reload-button";

export default function TasksPage() {
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [displayedTasks, setDisplayedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;
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

  // Fetch all tasks on mount and when search changes
  useEffect(() => {
    fetchAllTasks();
  }, [debouncedSearch]);

  // Apply filters when allTasks or filters change
  useEffect(() => {
    applyFilters();
  }, [allTasks, statusFilter, projectFilter, assigneeFilter]);

  // Apply pagination when filteredTasks or currentPage changes
  useEffect(() => {
    applyPagination();
  }, [filteredTasks, currentPage]);

  const fetchAllTasks = async (showLoading: boolean = true) => {
    try {
      if (showLoading) setLoading(true);
      const output = await axios.get<ApiResponse<Task>>(
        "https://api.apecglobal.net/api/v1/tasks/outside",
        {
          params: {
            page: 1,
            limit: 9999, // Fetch all tasks
            ...(debouncedSearch && { search: debouncedSearch }),
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

  const applyFilters = () => {
    let filtered = [...allTasks];

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

    setFilteredTasks(filtered);
    setCurrentPage(1); // Reset to page 1 when filters change
  };

  const applyPagination = () => {
    const startIndex = (currentPage - 1) * limit;
    const endIndex = startIndex + limit;
    setDisplayedTasks(filteredTasks.slice(startIndex, endIndex));
  };

  const statusConfig: Record<
    string,
    { label: string; color: string; textColor: string; icon?: any }
  > = {
    "2": {
      label: "Đang thực hiện",
      color: "bg-yellow-500",
      textColor: "text-yellow-700",
    },
    "3": {
      label: "Tạm dừng",
      color: "bg-gray-500",
      textColor: "text-gray-700",
    },
    "4": {
      label: "Hoàn thành",
      color: "bg-green-600",
      textColor: "text-green-700",
    },
    "5": { label: "Hủy", color: "bg-red-500", textColor: "text-red-700" },
  };

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
      >
        <ReloadButton onReload={() => fetchAllTasks(false)} />
      </PageHeader>

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
          <StatusFilter
            filter={statusFilter}
            onFilterChange={setStatusFilter}
            config={statusConfig}
            totalCount={allTasks.length}
            counts={allTasks.reduce(
              (acc, task) => {
                const status = String(task.status.id);
                acc[status] = (acc[status] || 0) + 1;
                return acc;
              },
              {} as Record<string, number>,
            )}
            className="flex-wrap"
          />

          {/* Project & Assignee Filters */}
          <div className="grid grid-cols-1 gap-3">
            <Select value={projectFilter} onValueChange={setProjectFilter}>
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

            <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
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
              const config = statusConfig[String(task.status.id)] || {
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
        {filteredTasks.length > 0 && (
          <div className="mt-6">
            <AppPagination
              page={currentPage}
              total={filteredTasks.length}
              limit={limit}
              onChange={setCurrentPage}
              itemName="công việc"
              currentCount={displayedTasks.length}
            />
          </div>
        )}
      </div>
    </div>
  );
}
