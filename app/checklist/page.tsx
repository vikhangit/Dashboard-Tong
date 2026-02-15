"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Filter,
  Loader2,
  FolderKanban,
  Clock,
  MoreHorizontal,
  ListTodo,
  ListChecks,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

import { ChecklistItem } from "@/lib/types";
import { AppHeader } from "@/components/app-header";
import { PageHeader } from "@/components/page-header";

const getGroupStats = (items: ChecklistItem[]) => {
  const deadlines = items
    .map((i) => (i.deadline ? new Date(i.deadline).getTime() : 0))
    .filter((d) => d > 0);
  const latestDeadline =
    deadlines.length > 0 ? new Date(Math.max(...deadlines)) : null;

  const avgProgress = Math.round(
    items.reduce((sum, i) => sum + (i.progress || 0), 0) / items.length,
  );

  const count = items.length;

  return { avgProgress, count, latestDeadline };
};

const ORDERED_FIELDS = [
  "Tài chính",
  "Nhân sự",
  "Kinh doanh",
  "Công nghệ",
  "Vận hành",
  "Thương hiệu",
];

export default function ChecklistPage() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [selectedProject, setSelectedProject] = useState<string>("");

  useEffect(() => {
    fetchChecklist();
  }, []);

  const fetchChecklist = async () => {
    try {
      const response = await fetch("/api/checklist");
      const result = await response.json();
      if (result.data) {
        setItems(result.data);
      }
    } catch (error) {
      console.error("Error fetching checklist:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Extract unique projects
  const projects = useMemo(() => {
    const uniqueProjects = Array.from(
      new Set(items.map((item) => item.project)),
    ).filter(Boolean);
    return uniqueProjects.sort();
  }, [items]);

  // Set default project when loaded
  useEffect(() => {
    if (!selectedProject && projects.length > 0) {
      setSelectedProject(projects[0]);
    }
  }, [projects, selectedProject]);

  // Filter items
  const filteredItems = useMemo(() => {
    if (!selectedProject) return [];
    return items.filter((item) => item.project === selectedProject);
  }, [items, selectedProject]);

  // Project-level summary: status, start date, deadline
  const projectSummary = useMemo(() => {
    if (filteredItems.length === 0) return null;

    const allCompleted = filteredItems.every((i) => i.status === "completed");
    const status = allCompleted ? "Hoàn thành" : "Đang chuẩn bị";

    const startDates = filteredItems
      .map((i) => (i.startDate ? new Date(i.startDate).getTime() : 0))
      .filter((d) => d > 0);
    const earliestStart =
      startDates.length > 0 ? new Date(Math.min(...startDates)) : null;

    const deadlines = filteredItems
      .map((i) => (i.deadline ? new Date(i.deadline).getTime() : 0))
      .filter((d) => d > 0);
    const latestDeadline =
      deadlines.length > 0 ? new Date(Math.max(...deadlines)) : null;

    const avgProgress = Math.round(
      filteredItems.reduce((sum, i) => sum + (i.progress || 0), 0) /
        filteredItems.length,
    );

    return { status, earliestStart, latestDeadline, avgProgress };
  }, [filteredItems]);

  // Group by field
  // Group by field and get available fields
  const { groupedItems, displayFields } = useMemo(() => {
    const groups: Record<string, ChecklistItem[]> = {};
    const fieldsSet = new Set<string>();

    filteredItems.forEach((item) => {
      // Use the item's field directly, defaulting to "Khác" if missing
      const field = item.field || "Khác";

      if (!groups[field]) {
        groups[field] = [];
      }
      groups[field].push(item);
      fieldsSet.add(field);
    });

    // Sort fields: ORDERED_FIELDS first, then others alphabetically
    const sortedFields = Array.from(fieldsSet).sort((a, b) => {
      const indexA = ORDERED_FIELDS.findIndex(
        (f) => f.toLowerCase() === a.toLowerCase(),
      );
      const indexB = ORDERED_FIELDS.findIndex(
        (f) => f.toLowerCase() === b.toLowerCase(),
      );

      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });

    return { groupedItems: groups, displayFields: sortedFields };
  }, [filteredItems]);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Hoàn thành";
      default:
        return "Đang chuẩn bị";
    }
  };

  return (
    <div className="min-h-screen gradient-holographic pb-20">
      <PageHeader
        title="Checklist"
        icon={<ListChecks className="size-6 text-indigo-600" />}
      />

      <div className="container mx-auto p-3 max-w-7xl">
        {/* Header & Summary Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-gradient-to-br from-red-900 via-indigo-900/80 to-blue-900 px-3 py-4 rounded-3xl border border-indigo-700 shadow-xl shadow-blue-900/20">
          {/* Project Filter */}
          <div className="flex items-center gap-3 bg-white p-2 pr-5 rounded-2xl border border-slate-400">
            <div className="bg-indigo-50 p-2 rounded-xl text-blue-600">
              <Filter className="size-5 shrink-0" />
            </div>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-full border-0 bg-transparent focus:ring-0 text-slate-800 font-semibold h-auto p-0 hover:bg-transparent shadow-none text-xl tracking-tight">
                <SelectValue placeholder="Chọn dự án" />
              </SelectTrigger>
              <SelectContent align="start" className="min-w-[280px]">
                {projects.map((project) => (
                  <SelectItem
                    key={project}
                    value={project}
                    className="py-3 cursor-pointer focus:bg-blue-50 focus:text-blue-700 font-medium text-slate-700 text-lg"
                  >
                    {project}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Project Summary Info */}
          {projectSummary && (
            <div className="flex flex-col gap-2 min-w-[240px]">
              {/* Row 1: Status & Progress */}
              <div className="flex items-stretch gap-2">
                {/* Status */}
                <div className="bg-white px-3 py-1.5 rounded-2xl border border-slate-400 flex flex-col items-center justify-center flex-[4]">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                    Trạng thái
                  </span>
                  <div
                    className={`flex items-center font-bold ${
                      projectSummary.status === "Hoàn thành"
                        ? "text-green-600"
                        : "text-amber-600"
                    }`}
                  >
                    <span className="text-lg">{projectSummary.status}</span>
                  </div>
                </div>

                {/* Progress */}
                <div className="bg-white px-3 py-1 rounded-2xl border border-slate-400 flex flex-col items-center justify-center flex-[2]">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
                    Tiến độ
                  </span>
                  <span
                    className={`text-lg leading-none font-black ${
                      projectSummary.avgProgress === 100
                        ? "text-green-600"
                        : "text-blue-600"
                    }`}
                  >
                    {projectSummary.avgProgress}%
                  </span>
                </div>
              </div>

              {/* Row 2: Time (Full Width) */}
              <div className="bg-white px-3 py-1.5 rounded-2xl border border-slate-400 flex flex-col items-center w-full">
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-0.5">
                  Thời gian
                </span>
                <div className="flex items-center gap-2 text-base font-bold text-slate-700 w-full justify-center">
                  <span>
                    {projectSummary.earliestStart
                      ? format(projectSummary.earliestStart, "dd/MM/yyyy")
                      : "--/--/----"}
                  </span>
                  <span className="text-slate-600">→</span>
                  <span
                    className={
                      projectSummary.status !== "Hoàn thành"
                        ? "text-red-500"
                        : ""
                    }
                  >
                    {projectSummary.latestDeadline
                      ? format(projectSummary.latestDeadline, "dd/MM/yyyy")
                      : "--/--/----"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Accordion
            type="multiple"
            key={displayFields.join(",")} // Force remount when fields change
            defaultValue={[]}
            className="space-y-2"
          >
            {displayFields.map((field) => (
              <AccordionItem
                key={field}
                value={field}
                className="rounded-xl mb-4 shadow-sm backdrop-blur-sm overflow-hidden border border-slate-300"
              >
                <AccordionTrigger className="hover:no-underline pl-1 pr-4 py-2 bg-white/40 group [&>svg]:hidden transition-all duration-200 rounded-b-none">
                  <div className="flex flex-1 items-center justify-between">
                    <div className="flex items-center gap-1">
                      <ChevronRight className="size-6 text-slate-400 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                      <span className="text-lg font-bold text-blue-900 uppercase tracking-tight">
                        {field}
                      </span>
                    </div>

                    {/* Group Stats */}
                    {groupedItems[field]?.length > 0 ? (
                      (() => {
                        const { avgProgress, count, latestDeadline } =
                          getGroupStats(groupedItems[field]);

                        return (
                          <div className="flex items-center gap-1 text-base font-medium text-slate-600">
                            {/* Progress */}
                            <div className="flex items-center gap-2">
                              <span
                                className={
                                  avgProgress === 100
                                    ? "text-green-600"
                                    : "text-blue-600"
                                }
                              >
                                {avgProgress}%
                              </span>
                            </div>

                            <span className="text-slate-400">/</span>

                            {/* Count */}
                            <div className="flex items-center gap-1 text-slate-800">
                              <span>{count}</span>
                            </div>

                            <span className="text-slate-400">/</span>

                            {/* Deadline */}
                            <div className="flex items-center gap-1.5 text-red-600">
                              {latestDeadline ? (
                                <span>{format(latestDeadline, "dd/MM")}</span>
                              ) : (
                                <span>--/--</span>
                              )}
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <span className="text-sm text-slate-500 font-medium">
                        0 việc
                      </span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-4 pt-2 bg-white/40">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 py-2">
                    {groupedItems[field]?.length === 0 ? (
                      <div className="col-span-full text-center py-8 text-muted-foreground">
                        <FolderKanban className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p className="text-base font-medium">
                          Chưa có công việc nào
                        </p>
                      </div>
                    ) : (
                      groupedItems[field]?.map((item) => (
                        <div
                          key={item.id}
                          className="group relative flex flex-col justify-between rounded-xl bg-white border border-blue-300 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 p-4"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-semibold text-lg text-black-900 line-clamp-2 leading-snug">
                              {item.task}
                            </h4>
                          </div>

                          {/* Project Name (if viewing all) */}
                          {selectedProject === "all" && (
                            <div className="text-base text-blue-600 mb-2 font-medium flex items-center bg-blue-50 w-fit px-2 py-0.5 rounded-md">
                              <FolderKanban className="h-3 w-3 mr-1.5" />
                              {item.project}
                            </div>
                          )}

                          <div className="mt-auto">
                            {/* Progress */}
                            <div className="space-y-2">
                              <div className="flex justify-between items-center text-base text-slate-600">
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                  <span className="text-base font-medium">
                                    {format(
                                      new Date(item.startDate),
                                      "dd/MM/yy",
                                    )}
                                    {" - "}
                                    <span
                                      className={
                                        item.deadline
                                          ? "text-red-600"
                                          : "text-slate-400"
                                      }
                                    >
                                      {item.deadline
                                        ? format(
                                            new Date(item.deadline),
                                            "dd/MM/yy",
                                          )
                                        : "..."}
                                    </span>
                                  </span>
                                </div>
                                <span
                                  className={`font-bold text-base ${
                                    item.progress === 100
                                      ? "text-green-600"
                                      : "text-blue-600"
                                  }`}
                                >
                                  {item.progress}%
                                </span>
                              </div>
                              <Progress
                                value={item.progress}
                                className="h-1.5 bg-slate-100"
                                indicatorClassName={
                                  item.progress === 100
                                    ? "bg-green-500"
                                    : "bg-blue-500"
                                }
                              />
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  );
}
