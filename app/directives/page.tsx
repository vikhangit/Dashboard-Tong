"use client";

import { useEffect, useState, useRef } from "react";
import { PageHeader } from "@/components/page-header";
import {
  CheckCircle2,
  Clock,
  FileText,
  Plus,
  Check,
  X,
  Calendar,
  User,
  Mic,
  Loader2,
  ClipboardList,
  ChevronDown,
  ChevronUp,
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
import { useVoiceRecorder } from "@/hooks/use-voice-recorder";

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

function DirectiveContent({ content }: { content: string }) {
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (textRef.current) {
      setIsOverflowing(
        textRef.current.scrollHeight > textRef.current.clientHeight,
      );
    }
  }, [content]);

  return (
    <div className="mb-3">
      <p
        ref={textRef}
        onClick={() => (isOverflowing || expanded) && setExpanded(!expanded)}
        className={`text-xl text-foreground leading-relaxed font-medium transition-all ${
          expanded ? "" : "line-clamp-3"
        } ${isOverflowing || expanded ? "cursor-pointer" : ""}`}
      >
        {content}
      </p>
      {(isOverflowing || expanded) && (
        <Button
          variant="link"
          className="p-0 h-auto font-semibold text-blue-600 hover:text-blue-700 mt-1"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
        >
          {expanded ? "Thu gọn" : "Xem thêm"}
        </Button>
      )}
    </div>
  );
}

function ActionContent({ content }: { content: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-3 text-sm border border-border/100 rounded-lg overflow-hidden">
      <div
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-4 font-medium bg-slate-100 text-blue-700 font-bold uppercase tracking-wider flex items-center justify-between cursor-pointer hover:bg-slate-200 transition-colors"
      >
        <span>Chi tiết xử lý</span>
        {isOpen ? (
          <ChevronUp className="size-6" />
        ) : (
          <ChevronDown className="size-6" />
        )}
      </div>

      {isOpen && (
        <div
          className="p-4 bg-white border-t animate-in slide-in-from-top-2 duration-200 cursor-pointer"
          onClick={() => setIsOpen(false)}
        >
          <p className="text-foreground/90 whitespace-pre-wrap text-lg">
            {content}
          </p>
        </div>
      )}
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
  });
  const [submitting, setSubmitting] = useState(false);
  const { isRecording, isTranscribing, startRecording, stopRecording } =
    useVoiceRecorder({
      onTranscriptionComplete: (text) => {
        setNewDirective((prev) => ({
          ...prev,
          content: prev.content ? `${prev.content} ${text}` : text,
        }));
        setIsDialogOpen(true);
      },
      onError: (err) => console.error("Recording error:", err),
    });

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
          status: "pending",
        }),
      });

      if (response.ok) {
        await fetchDirectives();
        setNewDirective({ content: "" });
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
      <PageHeader
        title="Chỉ đạo công việc"
        icon={<ClipboardList className="size-6 text-purple-600" />}
      >
        <Button
          size="sm"
          onClick={isRecording ? stopRecording : startRecording}
          className={`gap-2 rounded-full shadow-lg transition-all duration-300 ${
            isRecording
              ? "bg-red-500 hover:bg-red-600 animate-pulse text-white shadow-red-500/20"
              : isTranscribing
                ? "bg-blue-500 cursor-wait"
                : "shadow-primary/20"
          }`}
        >
          {isRecording ? (
            <>
              <div className="h-2 w-2 rounded-full bg-white animate-ping mr-1" />
              Đang nghe...
            </>
          ) : isTranscribing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang xử lý...
            </>
          ) : (
            <>
              <Mic className="h-4 w-4" />
              <span className="hidden sm:inline">Chỉ đạo</span>
            </>
          )}
        </Button>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
      </PageHeader>

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
                          className={`font-normal ${config.color} text-sm text-white px-2 py-0.5 h-7`}
                        >
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {config.label}
                        </Badge>
                      </div>
                      <span className="text-base text-muted-foreground flex items-center gap-1">
                        {formatShortDateTime(directive.createdAt)}
                      </span>
                    </div>

                    <DirectiveContent content={directive.content} />

                    {directive.actionContent && (
                      <ActionContent content={directive.actionContent} />
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-gray-400">
                      {directive.assignedTo && (
                        <span className="flex items-center gap-1 font-medium text-foreground/80 text-base">
                          <User className="w-3.5 h-3.5" />
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
