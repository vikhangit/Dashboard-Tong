"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import {
  Briefcase,
  Calendar,
  User,
  AlertCircle,
  CheckCircle2,
  Clock,
  Target,
  ArrowLeft,
  ListTodo,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import axios from "axios";
import { ApiResponse, TaskDetail } from "@/lib/types";
import { format } from "date-fns";
import { ReloadButton } from "@/components/reload-button";
import { toast } from "sonner";
import { CollapsibleSection } from "@/components/collapsible-section";
import { ExpandableText } from "@/components/expandable-text";

const statusConfig: Record<
  string,
  { label: string; color: string; textColor: string; icon: any }
> = {
  "2": {
    label: "Đang thực hiện",
    color: "bg-yellow-500",
    textColor: "text-yellow-700",
    icon: Clock,
  },
  "3": {
    label: "Tạm dừng",
    color: "bg-gray-500",
    textColor: "text-gray-700",
    icon: AlertCircle,
  },
  "4": {
    label: "Hoàn thành",
    color: "bg-green-600",
    textColor: "text-green-700",
    icon: CheckCircle2,
  },
  "5": {
    label: "Hủy",
    color: "bg-red-500",
    textColor: "text-red-700",
    icon: AlertCircle,
  },
};

function InfoItem({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  children,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: React.ReactNode;
  value?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 mb-2">
      <div
        className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center shrink-0`}
      >
        {icon}
      </div>
      <div>
        <p className={`text-base font-medium ${iconColor}`}>{label}</p>
        {value !== undefined ? (
          <p className="text-[19px] font-medium">{value}</p>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

export default function TaskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params?.id as string;
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedAssignments, setExpandedAssignments] = useState<
    Record<string, boolean>
  >({});

  const fetchTaskDetails = async (showLoading: boolean = true) => {
    if (!taskId) return;
    try {
      if (showLoading) setLoading(true);
      const response = await axios.get<{
        success: boolean;
        message: string;
        statusCode: number;
        data: TaskDetail;
      }>(`https://api.apecglobal.net/api/v1/tasks/outside?id=${taskId}`);

      if (response.data.success) {
        setTask(response.data.data);
      } else {
        toast.error("Không thể tải thông tin công việc");
      }
    } catch (error) {
      console.error("Error fetching task details:", error);
      toast.error("Đã xảy ra lỗi khi tải thông tin công việc");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskDetails();
  }, [taskId]);

  if (loading) {
    return (
      <div className="min-h-screen gradient-holographic flex flex-col items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4" />
        <p className="text-muted-foreground">Đang tải chi tiết công việc...</p>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen gradient-holographic flex flex-col items-center justify-center space-y-4">
        <AlertCircle className="w-12 h-12 text-muted-foreground" />
        <p className="text-xl font-medium text-foreground">
          Không tìm thấy công việc
        </p>
        <Button onClick={() => router.back()} variant="outline">
          Quay lại
        </Button>
      </div>
    );
  }

  const currentStatusConfig = statusConfig[String(task.status.id)] || {
    label: task.status.name,
    color: "bg-gray-400",
    textColor: "text-gray-600",
    icon: Clock,
  };
  const StatusIcon = currentStatusConfig.icon;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <PageHeader
        title="Chi Tiết Công Việc"
        icon={<Briefcase className="size-6 text-blue-600" />}
        backHref="/tasks"
      >
        <ReloadButton onReload={() => fetchTaskDetails(false)} />
      </PageHeader>

      <div className="container mx-auto px-2 md:px-4 py-2 md:py-4 max-w-4xl space-y-2 md:space-y-4">
        {/* Main Task Info Card */}
        <Card className="overflow-hidden border-none bg-white/80 pt-4 md:pt-5 pb-2 gap-2 md:gap-3">
          <CardHeader className="px-4 pb-0 md:pb-0">
            <div className="flex items-start">
              <div className="flex-1">
                <div className="flex justify-between items-center gap-2 mb-2 md:mb-3">
                  <Badge
                    variant="secondary"
                    className={`font-medium ${currentStatusConfig.color} text-white px-2 py-0.5 md:px-2.5 md:py-1 text-sm border-0 flex items-center gap-1.5`}
                  >
                    <StatusIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    {currentStatusConfig.label}
                  </Badge>
                  <span className="text-sm font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 md:px-2.5 md:py-1 rounded-full">
                    #{task.id}
                  </span>
                </div>
                <CardTitle className="text-xl font-bold leading-tight text-foreground">
                  {task.name}
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4 px-3 md:px-4 pb-3 md:pb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4 bg-muted/30 p-2 md:p-3 rounded-xl border border-muted/50">
              <div className="space-y-2 md:space-y-3">
                <InfoItem
                  icon={<Briefcase className="h-5 w-5 text-blue-600" />}
                  iconBg="bg-blue-100"
                  iconColor="text-blue-600"
                  label="Dự án"
                  value={task.project?.name || "Không thuộc dự án nào"}
                />

                <InfoItem
                  icon={<User className="h-5 w-5 text-green-600" />}
                  iconBg="bg-green-100"
                  iconColor="text-green-600"
                  label="Người điều phối"
                >
                  <div className="flex items-center gap-2 mt-0.5">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={task.assignee?.avatar || ""} />
                      <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                        {task.assignee?.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-[19px] font-medium">
                      {task.assignee?.name || "Chưa giao"}
                    </span>
                  </div>
                </InfoItem>
              </div>

              <div className="space-y-2 md:space-y-3">
                <InfoItem
                  icon={<Calendar className="h-5 w-5 text-orange-600" />}
                  iconBg="bg-orange-100"
                  iconColor="text-orange-600"
                  label="Thời gian thực hiện"
                  value={`${format(
                    new Date(task.date_start),
                    "dd/MM/yyyy",
                  )} - ${format(new Date(task.date_end), "dd/MM/yyyy")}`}
                />

                {task.kpi_item && (
                  <InfoItem
                    icon={<Target className="h-5 w-5 text-purple-600" />}
                    iconBg="bg-purple-100"
                    iconColor="text-purple-600"
                    label={`Mục tiêu KPI (${task.target_type?.name})`}
                    value={task.kpi_item.name}
                  />
                )}
              </div>
            </div>

            {/* Overall Progress */}
            <div className="space-y-1.5 bg-card border rounded-xl p-3 md:p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <ListTodo className="w-4 h-4 text-primary" />
                  Tiến độ tổng thể
                </h3>
                <span className="font-bold text-xl text-primary">
                  {Math.round(Number(task.process))}%
                </span>
              </div>
              <Progress
                value={Number(task.process)}
                className="h-3 shadow-inner bg-secondary/30"
                indicatorClassName={`${Number(task.process) === 100 ? "bg-green-500" : "bg-primary"}`}
              />
            </div>

            {task.description && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Mô tả chi tiết
                </h3>
                <div className="text-sm text-muted-foreground bg-muted/40 p-4 rounded-lg">
                  {task.description}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assignments Section */}
        <div className="space-y-2 md:space-y-3 pt-2">
          <h2 className="text-lg md:text-xl font-bold flex items-center gap-2 pl-1">
            <User className="h-5 w-5 text-primary" />
            Nhân sự tham gia ({task.employee_assignments?.length || 0})
          </h2>

          <div className="grid grid-cols-1 gap-2 md:gap-3">
            {task.employee_assignments?.map((assignment) => {
              const hasSubtasks =
                assignment.subtasks && assignment.subtasks.length > 0;

              return (
                <Card
                  key={assignment.id}
                  className="overflow-hidden shadow-sm hover:shadow-md transition-shadow p-0 mb-3 border border-green-800 bg-gradient-to-r from-blue-100 to-green-100"
                >
                  <div
                    className={`px-3 py-2 md:px-4 md:py-3 flex flex-col md:flex-row gap-2 md:gap-4 items-start md:items-center ${
                      hasSubtasks
                        ? "cursor-pointer hover:bg-slate-50 transition-colors group"
                        : ""
                    }`}
                    onClick={() => {
                      if (hasSubtasks) {
                        setExpandedAssignments((prev) => ({
                          ...prev,
                          [String(assignment.id)]: !prev[String(assignment.id)],
                        }));
                      }
                    }}
                  >
                    {/* Employee Info */}
                    <div className="flex items-center gap-3 md:gap-4 flex-1 w-full min-w-0">
                      <Avatar className="h-10 w-10 border-2 border-primary/10">
                        <AvatarImage src={assignment.employee?.avatar || ""} />
                        <AvatarFallback className="bg-white text-primary text-lg md:text-lg font-medium">
                          {assignment.employee?.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-between md:justify-start gap-2">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-semibold text-lg truncate">
                              {assignment.employee?.name}{" "}
                              {hasSubtasks && (
                                <span className="text-blue-600">
                                  ({assignment.subtasks!.length})
                                </span>
                              )}
                            </h3>
                          </div>
                        </div>
                        {/* Assignment Progress */}
                        <div className="flex items-center gap-3">
                          <Progress
                            value={assignment.process}
                            className="h-1.5 md:h-2 w-full md:w-32 shadow-inner"
                            indicatorClassName={
                              assignment.process === 100
                                ? "bg-green-500"
                                : "bg-primary/80"
                            }
                          />
                          <span className="text-lg font-semibold text-muted-foreground w-14 text-right">
                            {Math.round(Number(assignment.process))}%
                          </span>
                        </div>
                      </div>

                      {/* {hasSubtasks && (
                        <div className="flex items-center justify-center font-semibold text-blue-700 opacity-90 group-hover:opacity-100 pl-2">
                          {expandedAssignments[String(assignment.id)] ? (
                            <ChevronUp className="size-6" />
                          ) : (
                            <ChevronDown className="size-6" />
                          )}
                        </div>
                      )} */}
                    </div>

                    {Boolean(
                      assignment.completed_date || assignment.checked,
                    ) && (
                      <div className="flex flex-row md:flex-nowrap items-center gap-3 text-base text-muted-foreground md:border-l md:pl-5 md:ml-2 w-full md:w-auto pt-2 lg:pt-0 border-t md:border-t-0 mt-1 md:mt-0">
                        {assignment.completed_date && (
                          <div className="flex items-center gap-1.5 whitespace-nowrap">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                            Hoàn thành:{" "}
                            {format(
                              new Date(assignment.completed_date),
                              "dd/MM/yyyy",
                            )}
                          </div>
                        )}
                        {assignment.checked && (
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200"
                          >
                            Đã duyệt
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Subtasks */}
                  {hasSubtasks &&
                    expandedAssignments[String(assignment.id)] && (
                      <div className="bg-white border-t border-green-700 p-4 animate-in slide-in-from-top-2 duration-200 -mt-7">
                        <div className="divide-y divide-slate-500">
                          {assignment.subtasks!.map((subtask) => (
                            <div
                              key={subtask.id}
                              className="py-3 hover:bg-muted/10 transition-colors first:pt-0 last:pb-0"
                            >
                              <div className="flex justify-between items-center gap-4 mb-2">
                                <Badge
                                  variant="secondary"
                                  className={`text-sm px-2.5 py-0.5 border-0 shrink-0 text-white ${
                                    statusConfig[String(subtask.status.id)]
                                      ?.color || "bg-gray-400"
                                  }`}
                                >
                                  {subtask.status.name}
                                </Badge>

                                <div className="flex items-center gap-3 flex-1 max-w-[150px]">
                                  <Progress
                                    value={subtask.process}
                                    className="h-2.5 shadow-none flex-1"
                                    indicatorClassName={
                                      subtask.process === 100
                                        ? "bg-green-500"
                                        : "bg-blue-500"
                                    }
                                  />
                                  <span
                                    className={`text-lg font-bold min-w-[40px] text-right ${
                                      subtask.process === 100
                                        ? "text-green-500"
                                        : "text-blue-500"
                                    }`}
                                  >
                                    {Math.round(Number(subtask.process))}%
                                  </span>
                                </div>
                              </div>

                              <ExpandableText
                                text={subtask.name}
                                className="text-lg text-foreground "
                                maxLines={3}
                              />

                              {/* {subtask.description && (
                                <ExpandableText
                                  text={subtask.description}
                                  className="text-lg mt-1.5"
                                  maxLines={2}
                                />
                              )} */}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </Card>
              );
            })}

            {(!task.employee_assignments ||
              task.employee_assignments.length === 0) && (
              <div className="text-center py-6 md:py-8 bg-white/50 rounded-xl border border-dashed">
                <User className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Chưa có nhân sự nào được phân công
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
