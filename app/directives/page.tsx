"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileText,
  Plus,
  Check,
  X,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Directive } from "@/lib/types";
import {
  formatShortDateTime,
  formatDate,
  formatFullDateTime,
} from "@/lib/utils";

const statusConfig = {
  pending: {
    label: "Đã chỉ đạo",
    color: "bg-yellow-500",
    textColor: "text-yellow-700",
    icon: FileText,
  },
  in_progress: {
    label: "Đã tiếp nhận",
    color: "bg-blue-600",
    textColor: "text-blue-700",
    icon: Clock,
  },
  completed: {
    label: "Đã hoàn thành",
    color: "bg-green-600",
    textColor: "text-green-700",
    icon: CheckCircle2,
  },
};

function ActionContent({ content }: { content: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        setExpanded(!expanded);
      }}
      className="mb-3 text-sm border border-border/100 cursor-pointer hover:bg-muted/50 transition-colors rounded-lg overflow-hidden"
    >
      <span className="p-4 font-medium bg-slate-100 text-blue-700 block mb-1 text-sm font-bold uppercase tracking-wider flex items-center justify-between">
        Chi tiết xử lý
      </span>
      <p
        className={`text-foreground/90 whitespace-pre-wrap text-lg py-2 px-4 ${
          expanded ? "" : "line-clamp-2"
        }`}
      >
        {content}
      </p>
    </div>
  );
}

export default function DirectivesPage() {
  const [directives, setDirectives] = useState<Directive[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | Directive["status"]>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newDirective, setNewDirective] = useState({
    content: "",
    assignedTo: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDirectives();
  }, []);

  const fetchDirectives = async () => {
    try {
      const response = await fetch("/api/directives");
      const data = await response.json();
      setDirectives(data);
    } catch (error) {
      console.error("[v0] Error fetching directives:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDirectives =
    filter === "all"
      ? directives
      : directives.filter((d) => d.status === filter);

  const handleAddDirective = async () => {
    if (!newDirective.content.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/directives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newDirective.content,
          assignedTo: newDirective.assignedTo || undefined,
          status: "pending",
        }),
      });

      if (response.ok) {
        await fetchDirectives();
        setNewDirective({ content: "", assignedTo: "" });
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error("[v0] Error adding directive:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (
    id: string,
    status: Directive["status"],
  ) => {
    try {
      const response = await fetch("/api/directives", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      if (response.ok) {
        await fetchDirectives();
      }
    } catch (error) {
      console.error("[v0] Error updating directive:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-holographic">
        <div className="h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background/50">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-background/80 border-b shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-muted/50 -ml-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-semibold leading-tight">
                Chỉ đạo công việc
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="gap-2 rounded-full shadow-lg shadow-primary/20"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Thêm mới</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Thêm chỉ đạo mới</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="content">Nội dung chỉ đạo</Label>
                    <Textarea
                      id="content"
                      placeholder="Nhập nội dung chỉ đạo..."
                      value={newDirective.content}
                      onChange={(e) =>
                        setNewDirective({
                          ...newDirective,
                          content: e.target.value,
                        })
                      }
                      rows={4}
                      className="resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assignedTo">Người thực hiện</Label>
                    <Input
                      id="assignedTo"
                      placeholder="Tên người thực hiện"
                      value={newDirective.assignedTo}
                      onChange={(e) =>
                        setNewDirective({
                          ...newDirective,
                          assignedTo: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="flex gap-2 justify-end pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Hủy
                    </Button>
                    <Button
                      onClick={handleAddDirective}
                      disabled={submitting || !newDirective.content.trim()}
                    >
                      {submitting ? "Đang lưu..." : "Thêm chỉ đạo"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-4 px-4 scrollbar-hide snap-x">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            className="whitespace-nowrap rounded-full snap-start"
            size="sm"
          >
            Tất cả
          </Button>
          {Object.entries(statusConfig).map(([key, config]) => {
            const count = directives.filter((d) => d.status === key).length;
            const isActive = filter === key;
            return (
              <Button
                key={key}
                variant="outline"
                onClick={() => setFilter(key as Directive["status"])}
                className={`whitespace-nowrap rounded-full snap-start border transition-colors ${
                  isActive
                    ? `${config.color} text-white hover:opacity-90 border-transparent shadow-sm`
                    : `${config.textColor} border-current/20 bg-background hover:bg-accent hover:text-accent-foreground`
                }`}
                size="sm"
              >
                {config.label}{" "}
                <span
                  className={`ml-1 ${isActive ? "text-white/80" : "opacity-70"}`}
                >
                  ({count})
                </span>
              </Button>
            );
          })}
        </div>

        {/* Directives List */}
        <div className="space-y-3">
          {filteredDirectives.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
                <FileText className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground">Không có chỉ đạo nào</p>
            </div>
          ) : (
            filteredDirectives.map((directive) => {
              const config =
                statusConfig[directive.status] || statusConfig.pending;
              const StatusIcon = config.icon;

              return (
                <div
                  key={directive.id}
                  className="group relative bg-card hover:bg-accent/5 transition-colors border rounded-xl overflow-hidden shadow-sm"
                >
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1 ${config.color}`}
                  />

                  <div className="p-4 pl-5">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className={`font-normal ${config.color} text-sm text-white px-2 py-0.5 h-6`}
                        >
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {config.label}
                        </Badge>
                      </div>
                      <span className="text-base text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatShortDateTime(directive.createdAt)}
                      </span>
                    </div>

                    <p className="text-xl text-foreground leading-relaxed mb-3 font-medium">
                      {directive.content}
                    </p>

                    {directive.actionContent && (
                      <ActionContent content={directive.actionContent} />
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-border/50 text-xs text-muted-foreground">
                      {directive.assignedTo && (
                        <span className="flex items-center gap-1 font-medium text-foreground/80 text-base">
                          <span className="w-1 h-1 rounded-full bg-border" />
                          {directive.assignedTo}
                        </span>
                      )}
                      {directive.deadline && (
                        <span className="flex items-center gap-1 text-red-500 font-medium text-base">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(directive.deadline)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
