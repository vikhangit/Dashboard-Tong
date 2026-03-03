"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Briefcase, Search, Calendar, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppPagination } from "@/components/app-pagination";
import { StatusFilter } from "@/components/status-filter";
import axios from "axios";
import { Task, EmployeeTask, ApiResponse } from "@/lib/types";
import { format } from "date-fns";
import { ReloadButton } from "@/components/reload-button";

const statusConfig: Record<
  string,
  { label: string; color: string; textColor: string; icon?: any }
> = {
  "2": {
    label: "Đang TH",
    color: "bg-yellow-500",
    textColor: "text-yellow-700",
  },
  "3": {
    label: "T.Dừng",
    color: "bg-gray-500",
    textColor: "text-gray-700",
  },
  "4": {
    label: "H.Thành",
    color: "bg-green-600",
    textColor: "text-green-700",
  },
  "5": { label: "Hủy", color: "bg-red-500", textColor: "text-red-700" },
};

// ─── Shared Task Card ───────────────────────────────────────────

function SharedTaskCard({
  href,
  taskId,
  taskName,
  statusId,
  statusName,
  projectName,
  assigneeName,
  assigneeAvatar,
  dateStart,
  dateEnd,
  processNum,
  createdAt,
  subtasksCount,
}: {
  href: string;
  taskId: number | string;
  taskName: string;
  statusId: number | string;
  statusName: string;
  projectName?: string;
  assigneeName: string;
  assigneeAvatar?: string | null;
  dateStart?: string;
  dateEnd?: string;
  processNum: number;
  createdAt?: string;
  subtasksCount?: number;
}) {
  const config = statusConfig[String(statusId)] || {
    label: statusName,
    color: "bg-gray-400",
    textColor: "text-gray-600",
  };

  const roundedProcess = Math.round(Number(processNum));

  return (
    <Link
      href={href}
      className="block group relative bg-card hover:bg-accent/5 transition-all duration-300 border rounded-xl overflow-hidden shadow-sm hover:shadow-md mb-5"
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${config.color}`} />
      <div className="px-4 py-3 pl-5">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className={`font-normal ${config.color} text-white px-2 py-1 h-7 text-sm`}
            >
              {config.label}
            </Badge>
            {subtasksCount !== undefined && subtasksCount > 0 && (
              <Badge
                variant="outline"
                className="font-normal px-2 py-1 h-7 text-[14px] gap-1 text-blue-500"
              >
                {subtasksCount} việc
              </Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            # {taskId}
          </span>
        </div>

        <h3 className="text-lg font-medium text-foreground leading-snug mb-1 line-clamp-2">
          {taskName}
        </h3>

        <div className="flex flex-col gap-0 text-base">
          <div className="flex items-center gap-2">
            <Briefcase className="size-5 text-blue-500 shrink-0" />
            <span className="truncate">{projectName || "Chưa có dự án"}</span>
          </div>
          <div className="flex items-center gap-2 -ml-0.5">
            <Avatar className="size-6 shrink-0">
              <AvatarImage src={assigneeAvatar || ""} alt={assigneeName} />
              <AvatarFallback className="text-[10px] bg-green-50 text-green-700 border border-green-700">
                {assigneeName?.slice(0, 1).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <span className="truncate">{assigneeName || "Chưa giao"}</span>
          </div>
          {dateStart && dateEnd && (
            <div className="flex items-center gap-2">
              <Calendar className="size-5 text-orange-500 shrink-0" />
              <span className="text-base">
                {format(new Date(dateStart), "dd/MM/yyyy")} -{" "}
                {format(new Date(dateEnd), "dd/MM/yyyy")}
              </span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-2 mt-1">
          <div className="h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden flex-1">
            <div
              className={`h-full ${roundedProcess >= 100 ? "bg-green-500" : "bg-primary"}`}
              style={{ width: `${Math.min(roundedProcess, 100)}%` }}
            />
          </div>
          <span
            className={`text-base font-medium min-w-[30px] text-right ${roundedProcess >= 100 ? "text-green-600" : "text-blue-600"}`}
          >
            {roundedProcess}%
          </span>
        </div>

        {createdAt && (
          <div className="flex items-center justify-between pt-2 mt-2 border-t border-border/80 text-sm text-muted-foreground">
            <span>
              Tạo lúc: {format(new Date(createdAt), "HH:mm dd/MM/yyyy")}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

// ─── Tab "Đã giao" (existing tasks) ─────────────────────────────

function CreatedTaskCard({ task }: { task: Task }) {
  return (
    <SharedTaskCard
      href={`/tasks/${task.id}`}
      taskId={task.id}
      taskName={task.name}
      statusId={task.status.id}
      statusName={task.status.name}
      projectName={task.project?.name}
      assigneeName={task.assignee?.name || ""}
      assigneeAvatar={task.assignee?.avatar}
      dateStart={task.date_start}
      dateEnd={task.date_end}
      processNum={Number(task.process || 0)}
      createdAt={task.created_at}
    />
  );
}

// ─── Tab "Được giao" (employee tasks) ───────────────────────────

function EmployeeTaskCard({ item }: { item: EmployeeTask }) {
  return (
    <SharedTaskCard
      href={`/tasks/${item.task.id}?employeeId=${item.employee.id}`}
      taskId={item.task.id}
      taskName={item.task.name}
      statusId={item.status.id}
      statusName={item.status.name}
      projectName={item.project?.name}
      assigneeName={item.employee?.name || ""}
      assigneeAvatar={item.employee?.avatar}
      dateStart={item.task.date_start}
      dateEnd={item.task.date_end}
      processNum={Number(item.process || 0)}
      createdAt={item.created_at}
      subtasksCount={item.subtasks?.length || 0}
    />
  );
}

// ─── Shared Tasks Tab ──────────────────────────────────────────

interface SharedTasksTabProps<T> {
  endpoint: string;
  renderItem: (item: T) => React.ReactNode;
  getAssignee: (
    item: T,
  ) => { id: number | string; name: string } | null | undefined;
  assigneeRoleLabel: string;
  assigneeRolePlaceholder: string;
}

function SharedTasksTab<
  T extends {
    id: string | number;
    status: { id: number | string; name: string };
    project?: { id: number | string; name: string } | null;
  },
>({
  endpoint,
  renderItem,
  getAssignee,
  assigneeRoleLabel,
  assigneeRolePlaceholder,
}: SharedTasksTabProps<T>) {
  const [allItems, setAllItems] = useState<T[]>([]);
  const [filteredItems, setFilteredItems] = useState<T[]>([]);
  const [displayedItems, setDisplayedItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchItems();
  }, [debouncedSearch]);

  useEffect(() => {
    let filtered = [...allItems];
    if (statusFilter !== "all")
      filtered = filtered.filter((t) => String(t.status.id) === statusFilter);
    if (projectFilter !== "all")
      filtered = filtered.filter(
        (t) => String(t.project?.id) === projectFilter,
      );
    if (assigneeFilter !== "all")
      filtered = filtered.filter(
        (t) => String(getAssignee(t)?.id) === assigneeFilter,
      );

    setFilteredItems(filtered);
    setCurrentPage(1);
  }, [allItems, statusFilter, projectFilter, assigneeFilter]);

  useEffect(() => {
    const start = (currentPage - 1) * limit;
    setDisplayedItems(filteredItems.slice(start, start + limit));
  }, [filteredItems, currentPage]);

  const fetchItems = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const res = await axios.get<ApiResponse<T>>(
        `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
        {
          params: {
            page: 1,
            limit: 9999,
            ...(debouncedSearch && { search: debouncedSearch }),
          },
        },
      );
      if (res.data.success) setAllItems(res.data.data.rows);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const uniqueProjects = Array.from(
    new Map(
      allItems
        .filter((t) => t.project)
        .map((t) => [String(t.project!.id), t.project!]),
    ).values(),
  );

  const uniqueAssignees = Array.from(
    new Map(
      allItems
        .map((t) => getAssignee(t))
        .filter((a): a is NonNullable<ReturnType<typeof getAssignee>> => !!a)
        .map((a) => [String(a.id), a]),
    ).values(),
  );

  return (
    <div>
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-600 z-10" />
        <Input
          placeholder="Tìm nhân sự, công việc..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-white backdrop-blur-sm border-muted/40"
        />
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <StatusFilter
          filter={statusFilter}
          onFilterChange={setStatusFilter}
          config={statusConfig}
          order={["4", "5", "2", "3"]}
          totalCount={allItems.length}
          counts={allItems.reduce(
            (acc, item) => {
              const s = String(item.status.id);
              acc[s] = (acc[s] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>,
          )}
          className="flex-wrap"
        />

        <div className="grid grid-cols-2 gap-3">
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-full bg-white/90 backdrop-blur-sm border-gray-200 text-gray-700 hover:bg-gray-100/80 transition-colors h-10">
              <div className="flex items-center gap-2 flex-1 text-left min-w-0 w-full">
                <Briefcase className="w-4 h-4 shrink-0 text-blue-600" />
                <span className="truncate flex-1 text-sm pr-0">
                  <SelectValue placeholder="Dự án" />
                </span>
              </div>
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              <SelectItem
                value="all"
                className="rounded-t-sm rounded-b-none py-3 border-b-2 border-gray-300 last:border-0 cursor-pointer"
              >
                <div className="truncate text-left max-w-[calc(100vw-4rem)] sm:max-w-xs">
                  Dự án
                </div>
              </SelectItem>
              {uniqueProjects.map((project) => (
                <SelectItem
                  key={String(project.id)}
                  value={String(project.id)}
                  className="rounded-none last:rounded-b-sm py-3 border-b-2 border-gray-300 last:border-0 cursor-pointer"
                >
                  <div className="truncate text-left max-w-[calc(100vw-4rem)] sm:max-w-xs">
                    {project.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
            <SelectTrigger className="w-full bg-white/90 backdrop-blur-sm border-gray-200 text-gray-700 hover:bg-gray-100/80 transition-colors h-10">
              <div className="flex items-center gap-2 flex-1 text-left min-w-0 w-full">
                <User className="w-4 h-4 shrink-0 text-green-600" />
                <span className="truncate flex-1 text-sm">
                  <SelectValue placeholder={assigneeRoleLabel} />
                </span>
              </div>
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              <SelectItem
                value="all"
                className="rounded-t-sm rounded-b-none py-3 border-b-2 border-gray-300 last:border-0 cursor-pointer"
              >
                <div className="truncate text-left max-w-[calc(100vw-4rem)] sm:max-w-xs">
                  {assigneeRolePlaceholder}
                </div>
              </SelectItem>
              {uniqueAssignees.map((assignee) => (
                <SelectItem
                  key={String(assignee.id)}
                  value={String(assignee.id)}
                  className="rounded-none last:rounded-b-sm py-3 border-b-2 border-gray-300 last:border-0 cursor-pointer"
                >
                  <div className="truncate text-left max-w-[calc(100vw-4rem)] sm:max-w-xs">
                    {assignee.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Đang tải dữ liệu...</p>
          </div>
        ) : displayedItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
              <Briefcase className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground">
              Không tìm thấy công việc nào
            </p>
          </div>
        ) : (
          displayedItems.map((item) => renderItem(item))
        )}
      </div>

      {filteredItems.length > 0 && (
        <div className="mt-6">
          <AppPagination
            page={currentPage}
            total={filteredItems.length}
            limit={limit}
            onChange={setCurrentPage}
            itemName="công việc"
            currentCount={displayedItems.length}
          />
        </div>
      )}
    </div>
  );
}

// ─── Created Tasks Tab (Đã giao) ────────────────────────────────

function CreatedTasksTab() {
  return (
    <SharedTasksTab<Task>
      endpoint="/api/v1/tasks/outside"
      renderItem={(task) => <CreatedTaskCard key={task.id} task={task} />}
      getAssignee={(task) => task.assignee}
      assigneeRoleLabel="Nhân sự"
      assigneeRolePlaceholder="Nhân sự"
    />
  );
}

// ─── Assigned Tasks Tab (Được giao) ──────────────────────────────

function AssignedTasksTab() {
  return (
    <SharedTasksTab<EmployeeTask>
      endpoint="/api/v1/tasks/employees/outside"
      renderItem={(item) => <EmployeeTaskCard key={item.id} item={item} />}
      getAssignee={(item) => item.employee}
      assigneeRoleLabel="Nhân sự"
      assigneeRolePlaceholder="Nhân sự"
    />
  );
}

// ─── Main Page ───────────────────────────────────────────────────

export default function TasksPage() {
  const [activeTab, setActiveTab] = useState("assigned");

  return (
    <div className="min-h-screen gradient-holographic">
      <PageHeader
        title="Công việc"
        icon={<Briefcase className="size-6 text-blue-600" />}
      />

      <div className="container mx-auto px-4 py-3 max-w-3xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-1">
            <TabsList className="w-full sm:w-[400px] bg-gradient-to-r from-slate-900 to-slate-800 p-1 rounded-md h-10 flex gap-1 border border-slate-700/50 shadow-lg mx-auto">
              <TabsTrigger
                value="assigned"
                className="flex-1 rounded-sm text-sm font-medium transition-all duration-300 text-slate-300 hover:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4" />
                Nhân viên
              </TabsTrigger>
              <TabsTrigger
                value="created"
                className="flex-1 rounded-sm text-sm font-medium transition-all duration-300 text-slate-300 hover:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md flex items-center justify-center gap-2"
              >
                <Briefcase className="w-4 h-4" />
                Quản lý
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="assigned" className="mt-0">
            <AssignedTasksTab />
          </TabsContent>

          <TabsContent value="created" className="mt-0">
            <CreatedTasksTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
