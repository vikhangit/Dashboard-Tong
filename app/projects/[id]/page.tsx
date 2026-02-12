"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Project } from "@/lib/types";
import axios from "axios";
import {
  FolderKanban,
  Clock,
  PlayCircle,
  CheckCircle2,
  PauseCircle,
  AlertCircle,
  Calendar,
  ArrowLeft,
  Mail,
  Phone,
  Briefcase,
  Building,
  FileText,
  Globe,
  Code2,
  Users,
  Target,
  Zap,
  Shield,
  Award,
  Download,
} from "lucide-react";
import { format } from "date-fns";

const statusConfig: Record<
  string,
  { label: string; color: string; icon: any; textColor: string }
> = {
  planning: {
    label: "Lập kế hoạch",
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

const getStatusConfig = (status: string, projectStatus?: { name: string }) => {
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

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProjectDetail();
    }
  }, [id]);

  const fetchProjectDetail = async () => {
    try {
      setLoading(true);
      const response = await axios.get<{ data: Project }>(
        `https://api.apecglobal.net/api/v1/projects/outside`,
        {
          params: { id },
        },
      );

      if (response.data && response.data.data) {
        setProject(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching project detail:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-white p-6 text-center">
        <h2 className="text-xl font-bold text-muted-foreground">
          Không tìm thấy dự án
        </h2>
        <Button onClick={() => router.push("/projects")} className="mt-4">
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  const config = getStatusConfig(project.status, project.project_status);
  const StatusIcon = config.icon || AlertCircle;

  return (
    <div className="min-h-screen bg-white text-foreground">
      {/* Back Button specific to this page */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/projects")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-6" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold truncate">{project.name}</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-5xl space-y-8">
        {/* Header Info Section - seamless */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex items-center justify-between gap-3 mb-3">
                <Badge
                  variant="secondary"
                  className={`font-normal ${config.color} text-white px-2.5 py-0.5 rounded-full`}
                >
                  <StatusIcon className="w-3.5 h-3.5 mr-1.5" />
                  {config.label}
                </Badge>
                <div className="flex gap-2 text-sm text-muted-foreground">
                  <span># {project.id}</span>
                  {project.key_project && (
                    <>
                      <span>•</span>
                      <span className="text-amber-500 font-medium flex items-center gap-1">
                        <Award className="w-3 h-3" /> Key Project
                      </span>
                    </>
                  )}
                  {project.is_featured && (
                    <>
                      <span>•</span>
                      <span className="text-purple-500 font-medium flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Featured
                      </span>
                    </>
                  )}
                </div>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 leading-tight">
                {project.name}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span>
                    {project.start_date
                      ? format(new Date(project.start_date), "dd/MM/yyyy")
                      : "N/A"}
                  </span>
                  <span>-</span>
                  <span>
                    {project.end_date
                      ? format(new Date(project.end_date), "dd/MM/yyyy")
                      : "N/A"}
                  </span>
                </div>
                {/* {project.company_id && (
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-blue-600" />
                    <span>Company ID: {project.company_id}</span>
                  </div>
                )} */}
              </div>
            </div>

            <div className="w-full md:w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tiến độ</span>
                <span className="font-semibold">{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-2" />
            </div>
          </div>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full bg-muted/50 p-1 rounded-xl h-auto flex flex-wrap gap-1">
            <TabsTrigger
              value="overview"
              className="flex-1 min-w-[100px] rounded-lg py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground hover:bg-white/50"
            >
              Tổng quan
            </TabsTrigger>
            <TabsTrigger
              value="details"
              className="flex-1 min-w-[100px] rounded-lg py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground hover:bg-white/50"
            >
              Chi tiết
            </TabsTrigger>
            {project.documents && project.documents.length > 0 && (
              <TabsTrigger
                value="documents"
                className="flex-1 min-w-[100px] rounded-lg py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground hover:bg-white/50"
              >
                Tài liệu ({project.documents.length})
              </TabsTrigger>
            )}
            <TabsTrigger
              value="departments"
              className="flex-1 min-w-[100px] rounded-lg py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground hover:bg-white/50"
            >
              Phòng ban ({project.departments?.length || 0})
            </TabsTrigger>
            <TabsTrigger
              value="members"
              className="flex-1 min-w-[100px] rounded-lg py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground hover:bg-white/50"
            >
              Thành viên ({project.members?.length || 0})
            </TabsTrigger>
          </TabsList>

          {/* Overview Content */}
          <TabsContent
            value="overview"
            className="mt-4 space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300"
          >
            {/* Description */}
            <section className="bg-card/50 rounded-xl p-4 border shadow-sm">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-3 text-foreground/90">
                <FolderKanban className="w-5 h-5 text-blue-500" />
                Mô tả dự án
              </h3>
              <div className="text-base text-foreground/80 leading-relaxed whitespace-pre-wrap">
                {project.description || "Chưa có mô tả cho dự án này."}
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Manager & Budget Info */}
              <section className="bg-card/50 rounded-xl p-4 border shadow-sm h-full">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-foreground/90">
                  <Briefcase className="w-5 h-5 text-orange-500" />
                  Thông tin quản lý
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-border/40">
                    <span className="text-muted-foreground">Quản lý (ID)</span>
                    <span className="font-medium">{project.manager_id}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/40">
                    <span className="text-muted-foreground">Ưu tiên</span>
                    <span className="capitalize badge bg-primary/10 text-primary px-2 py-0.5 rounded">
                      {project.priority}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/40">
                    <span className="text-muted-foreground">Ngân sách</span>
                    <span className="font-medium">
                      {project.budget
                        ? Number(project.budget).toLocaleString()
                        : 0}{" "}
                      VNĐ
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/40">
                    <span className="text-muted-foreground">Đã chi</span>
                    <span className="font-medium">
                      {project.spent
                        ? Number(project.spent).toLocaleString()
                        : 0}{" "}
                      VNĐ
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/40">
                    <span className="text-muted-foreground">Team Size</span>
                    <span className="font-medium">
                      {project.team_size || 0}
                    </span>
                  </div>
                </div>
              </section>

              {/* Column 2: Client & Technical Info - Split into 2 cards */}
              <div className="space-y-6">
                {/* Client Info */}
                <section className="bg-card/50 rounded-xl p-4 border shadow-sm">
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-foreground/90">
                    <Globe className="w-5 h-5 text-green-500" />
                    Thông tin khách hàng
                  </h3>
                  <div className="space-y-3 text-sm">
                    {project.client_name ? (
                      <div className="flex justify-between py-2 border-b border-border/40">
                        <span className="text-muted-foreground">
                          Khách hàng
                        </span>
                        <span className="font-medium">
                          {project.client_name}
                        </span>
                      </div>
                    ) : (
                      <div className="py-2 text-muted-foreground italic">
                        Chưa có thông tin khách hàng
                      </div>
                    )}
                    {project.client_contact && (
                      <div className="flex justify-between py-2 border-b border-border/40">
                        <span className="text-muted-foreground">Liên hệ</span>
                        <span className="font-medium">
                          {project.client_contact}
                        </span>
                      </div>
                    )}
                  </div>
                </section>

                {/* Technical Info */}
                <section className="bg-card/50 rounded-xl p-4 border shadow-sm">
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-foreground/90">
                    <Code2 className="w-5 h-5 text-blue-500" />
                    Thông tin kỹ thuật
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="py-2">
                      <div className="flex flex-wrap gap-1.5">
                        {project.technologies ? (
                          project.technologies.split(",").map((tech, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="text-xs bg-background/50"
                            >
                              <Code2 className="w-3 h-3 mr-1 text-blue-500" />{" "}
                              {tech.trim()}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-xs italic">
                            Chưa cập nhật công nghệ
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </TabsContent>

          {/* Details Content */}
          <TabsContent
            value="details"
            className="mt-4 space-y-4 animate-in fade-in-50 slide-in-from-bottom-2 duration-300"
          >
            <div className="grid grid-cols-1 gap-4">
              {[
                {
                  title: "Tính năng (Features)",
                  content: project.features,
                  icon: Target,
                  color: "text-blue-500",
                },
                {
                  title: "Thách thức (Challenges)",
                  content: project.challenges,
                  icon: Shield,
                  color: "text-red-500",
                },
                {
                  title: "Giải pháp (Solutions)",
                  content: project.solutions,
                  icon: Zap,
                  color: "text-yellow-500",
                },
                {
                  title: "Kết quả (Results)",
                  content: project.results,
                  icon: Award,
                  color: "text-green-500",
                },
                {
                  title: "Testimonials",
                  content: project.testimonials,
                  icon: Users,
                  color: "text-purple-500",
                },
              ].map((item, idx) =>
                item.content ? (
                  <div
                    key={idx}
                    className="bg-card/50 rounded-xl p-4 border shadow-sm"
                  >
                    <h3 className="text-md font-semibold flex items-center gap-2 mb-2 text-foreground/90">
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                      {item.title}
                    </h3>
                    <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap pl-6">
                      {item.content}
                    </div>
                  </div>
                ) : null,
              )}

              {!project.features &&
                !project.challenges &&
                !project.solutions &&
                !project.results &&
                !project.testimonials && (
                  <div className="text-center py-8 text-muted-foreground">
                    Chưa có thông tin chi tiết.
                  </div>
                )}
            </div>
          </TabsContent>

          {/* Departments Content */}
          <TabsContent
            value="departments"
            className="mt-4 animate-in fade-in-50 slide-in-from-bottom-2 duration-300"
          >
            <div className="bg-card/50 rounded-xl p-4 border shadow-sm">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-foreground/90">
                <Building className="w-5 h-5 text-indigo-500" />
                Phòng ban tham gia ({project.departments?.length || 0})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {project.departments && project.departments.length > 0 ? (
                  project.departments.map((dept) => (
                    <div
                      key={dept.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border/50 hover:bg-accent/5 transition-colors shadow-sm"
                    >
                      <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0 border border-indigo-100">
                        {dept.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium">{dept.name}</span>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-sm text-muted-foreground py-12 text-center">
                    Chưa có thông tin phòng ban.
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Members Content */}
          <TabsContent
            value="members"
            className="mt-4 animate-in fade-in-50 slide-in-from-bottom-2 duration-300"
          >
            <div className="bg-card/50 rounded-xl p-4 border shadow-sm">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-foreground/90">
                <Users className="w-5 h-5 text-pink-500" />
                Thành viên ({project.members?.length || 0})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {project.members && project.members.length > 0 ? (
                  project.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border/50 hover:bg-accent/5 transition-colors shadow-sm"
                    >
                      <div className="h-10 w-10 rounded-full bg-pink-50 flex items-center justify-center text-pink-600 font-bold text-sm shrink-0 border border-pink-100">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">
                          {member.name}
                        </h4>
                        <div className="flex flex-col mt-0.5 space-y-0.5">
                          {member.email && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                              <Mail className="w-3 h-3" />
                              {member.email}
                            </div>
                          )}
                          {member.phone && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                              <Phone className="w-3 h-3" />
                              {member.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center text-muted-foreground text-sm">
                    Không có thành viên nào trong dự án này.
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Documents Content */}
          <TabsContent
            value="documents"
            className="mt-4 animate-in fade-in-50 slide-in-from-bottom-2 duration-300"
          >
            <div className="bg-card/50 rounded-xl p-4 border shadow-sm">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-foreground/90">
                <FileText className="w-5 h-5 text-teal-500" />
                Tài liệu dự án
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {project.documents &&
                  project.documents.map((doc) => (
                    <a
                      key={doc.id}
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start gap-3 p-3 rounded-xl border border-border/60 bg-background hover:bg-accent/5 hover:border-primary/30 transition-all hover:shadow-sm"
                    >
                      <div className="bg-teal-50 p-2 rounded-lg text-teal-600 group-hover:scale-110 transition-transform">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                          {doc.name}
                        </h4>
                        <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Download className="w-3 h-3" /> Tải xuống
                        </span>
                      </div>
                    </a>
                  ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer Meta */}
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-4 border-t">
          <span>
            Tạo lúc: {format(new Date(project.created_at), "dd/MM/yyyy HH:mm")}
          </span>
          <span>
            Cập nhật: {format(new Date(project.updated_at), "dd/MM/yyyy HH:mm")}
          </span>
        </div>
      </div>
    </div>
  );
}
