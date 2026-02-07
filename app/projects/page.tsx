"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Project, ProjectApiResponse } from "@/lib/types";
import axios from "axios";
import {
  FolderKanban,
  Search,
  Clock,
  PlayCircle,
  CheckCircle2,
  PauseCircle,
  AlertCircle,
  Users,
  Calendar,
  Building,
} from "lucide-react";
import { format } from "date-fns";

const statusConfig: Record<
  string,
  { label: string; color: string; icon: any; textColor: string }
> = {
  planning: {
    label: "Kế hoạch",
    color: "bg-gray-500",
    icon: Clock,
    textColor: "text-gray-700",
  },
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
  on_hold: {
    label: "Tạm dừng",
    color: "bg-yellow-500",
    icon: PauseCircle,
    textColor: "text-yellow-700",
  },
  cancelled: {
    label: "Đã hủy",
    color: "bg-red-500",
    icon: AlertCircle,
    textColor: "text-red-700",
  },
};

const statusOptions = [
  { value: "all", label: "Tất cả" },
  { value: "planning", label: "Kế hoạch" },
  { value: "active", label: "Đang thực hiện" },
  { value: "completed", label: "Hoàn thành" },
  { value: "on_hold", label: "Tạm dừng" },
  { value: "cancelled", label: "Đã hủy" },
];

const getStatusConfig = (status: string, projectStatus?: { name: string }) => {
  // If project_status exists, map its name to a standard status key
  let displayStatus = status;

  if (projectStatus?.name) {
    const statusName = projectStatus.name.toLowerCase();
    if (statusName.includes("lập kế hoạch")) displayStatus = "planning";
    else if (statusName.includes("đang thực hiện")) displayStatus = "active";
    else if (statusName.includes("hoàn thành")) displayStatus = "completed";
    else if (statusName.includes("tạm dừng")) displayStatus = "on_hold";
    else if (statusName.includes("hủy")) displayStatus = "cancelled";
  }

  return (
    statusConfig[displayStatus] || {
      label: projectStatus?.name || displayStatus,
      color: "bg-gray-400",
      icon: AlertCircle,
      textColor: "text-gray-600",
    }
  );
};

export default function ProjectsPage() {
  const router = useRouter();
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [projects, setProjects] = useState<Project[]>([]); // Displayed projects (paginated)
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
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Initial fetch of all projects
  useEffect(() => {
    fetchProjects();
  }, []);

  // Filter and pagination logic
  useEffect(() => {
    let result = [...allProjects];

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter((project) => {
        // Map project status to our filter keys
        let projectStatusKey = "planning"; // Default if no status

        if (project.project_status?.name) {
          const statusName = project.project_status.name.toLowerCase();
          if (statusName.includes("đang thực hiện"))
            projectStatusKey = "active";
          else if (statusName.includes("hoàn thành"))
            projectStatusKey = "completed";
          else if (statusName.includes("tạm dừng"))
            projectStatusKey = "on_hold";
          else if (statusName.includes("hủy")) projectStatusKey = "cancelled";
          else if (statusName.includes("lập kế hoạch"))
            projectStatusKey = "planning";
        } else {
          // Fallback: If project_status is null/undefined, treat as planning
          projectStatusKey = "planning";
        }

        return projectStatusKey === statusFilter;
      });
    }

    // Filter by search
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query),
      );
    }

    // Filter by department
    if (departmentFilter !== "all") {
      result = result.filter((project) =>
        project.departments?.some(
          (dept) => dept.id.toString() === departmentFilter,
        ),
      );
    }

    // Update total for pagination
    const total = result.length;
    const totalPages = Math.ceil(total / pagination.limit);

    // Slice for pagination
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    const paginatedProjects = result.slice(startIndex, endIndex);

    setProjects(paginatedProjects);
    setPagination((prev) => ({
      ...prev,
      total,
      total_pages: totalPages,
      // Reset to page 1 if current page is out of bounds (except when loading/initial)
      page: prev.page > totalPages && totalPages > 0 ? 1 : prev.page,
    }));
  }, [
    allProjects,
    statusFilter,
    departmentFilter,
    debouncedSearch,
    pagination.page,
    pagination.limit,
  ]);

  // Extract unique departments
  const uniqueDepartments = Array.from(
    new Map(
      allProjects.flatMap((p) => p.departments || []).map((d) => [d.id, d]),
    ).values(),
  );

  const fetchProjects = async () => {
    try {
      setLoading(true);
      // Fetch ALL projects at once
      const response = await axios.get<ProjectApiResponse>(
        "https://apec-global-backend.vercel.app/api/v1/projects/outside",
        {
          params: {
            limit: 1000, // Fetch big limit to get all
          },
        },
      );

      if (response.data && response.data.data) {
        setAllProjects(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-holographic">
      <PageHeader
        title="Dự án"
        icon={<FolderKanban className="size-6 text-blue-600" />}
      />

      <div className="container mx-auto px-4 py-6 max-w-3xl">
        {/* Search */}
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-600 z-10" />
          <Input
            placeholder="Tìm kiếm dự án..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white backdrop-blur-sm border-muted/40"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x mb-3">
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

        {/* Department Filter */}
        <div className="mb-6">
          <Select
            value={departmentFilter}
            onValueChange={(value) => {
              setDepartmentFilter(value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
          >
            <SelectTrigger className="w-full sm:w-[250px] bg-white backdrop-blur-sm border-muted/40">
              <SelectValue placeholder="Chọn phòng ban" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả phòng ban</SelectItem>
              {uniqueDepartments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id.toString()}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Projects List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Đang tải dữ liệu...</p>
            </div>
          ) : projects.length === 0 ? (
            <Card className="glass-card p-12 text-center">
              <FolderKanban className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Không có dự án nào</p>
            </Card>
          ) : (
            projects.map((project) => {
              const config = getStatusConfig(
                project.status,
                project.project_status,
              );
              const StatusIcon = config.icon || AlertCircle;

              return (
                <div
                  key={project.id}
                  onClick={() => router.push(`/projects/${project.id}`)}
                  className="group relative bg-card hover:bg-accent/5 transition-all duration-300 border rounded-xl overflow-hidden shadow-sm hover:shadow-md cursor-pointer"
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
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {config.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-medium">
                        # {project.id}
                      </span>
                    </div>

                    <h3 className="text-lg font-medium text-foreground leading-snug mb-2 line-clamp-2">
                      {project.name}
                    </h3>

                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {project.description}
                    </p>

                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <span>
                        {project.start_date
                          ? format(new Date(project.start_date), "dd/MM/yyyy")
                          : "N/A"}
                      </span>
                      {project.end_date && (
                        <>
                          <span>-</span>
                          <span>
                            {format(new Date(project.end_date), "dd/MM/yyyy")}
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2 mb-4">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-orange-500" />
                        <span>{project.members?.length || 0} thành viên</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Building className="w-4 h-4 text-indigo-500" />
                        <span>
                          {project.departments?.length || 0} phòng ban
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden flex-1">
                        <div
                          className={`h-full ${project.progress === 100 ? "bg-green-500" : "bg-primary"}`}
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span
                        className={`text-sm font-medium min-w-[30px] text-right ${project.progress === 100 ? "text-green-600" : "text-blue-600"}`}
                      >
                        {project.progress}%
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

                  const length = Math.min(maxVisible, endPage - startPage + 1);

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
              Hiển thị {projects.length} / {pagination.total} dự án
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
