"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  AlertTriangle,
  Lightbulb,
  Pencil,
  MessageSquare,
  Mic,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVoiceRecorder } from "@/hooks/use-voice-recorder";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Incident } from "@/lib/types";
import { cn, formatDateTime } from "@/lib/utils";
import { FormattedText } from "@/components/formatted-text";

const statusConfig = {
  open: {
    label: "Mới",
    color: "text-red-700 bg-red-100",
    activeParams: "bg-red-600 text-white",
  },
  directed: {
    label: "Đã chỉ đạo",
    color: "text-purple-700 bg-purple-100",
    activeParams: "bg-purple-600 text-white",
  },
  in_progress: {
    label: "Đang xử lý",
    color: "text-blue-700 bg-blue-100",
    activeParams: "bg-blue-600 text-white",
  },
  resolved: {
    label: "Đã giải quyết",
    color: "text-green-700 bg-green-100",
    activeParams: "bg-green-600 text-white",
  },
};

const severityConfig = {
  low: { label: "Thấp", color: "text-emerald-800" },
  medium: { label: "Trung bình", color: "text-yellow-600" },
  high: { label: "Cao", color: "text-orange-600" },
  critical: { label: "Nghiêm trọng", color: "text-red-600" },
};

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<"all" | keyof typeof statusConfig>(
    "all",
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [recordingIncidentId, setRecordingIncidentId] = useState<string | null>(
    null,
  );

  const { isRecording, isTranscribing, startRecording, stopRecording } =
    useVoiceRecorder({
      onTranscriptionComplete: (text) => {
        if (recordingIncidentId) {
          setEditContent((prev) =>
            editingId === recordingIncidentId ? prev + " " + text : text,
          );
          setEditingId(recordingIncidentId);
          setRecordingIncidentId(null);
        }
      },
      onError: (err) => {
        console.error("Recording error:", err);
        setRecordingIncidentId(null);
      },
    });

  const filteredIncidents =
    filter === "all" ? incidents : incidents.filter((i) => i.status === filter);

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const startEditing = (incident: Incident) => {
    setEditingId(incident.id);
    setEditContent(incident.directionContent || "");
  };

  const handleSaveDirection = async (id: string) => {
    try {
      const res = await fetch("/api/incidents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          directionContent: editContent,
          status: "directed",
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setIncidents((prev) =>
          prev.map((p) => (p.id === id ? { ...p, ...updated } : p)),
        );
        setEditingId(null);
        setEditContent("");
      } else {
        console.error("Failed to update incident");
      }
    } catch (err) {
      console.error("Error updating incident:", err);
    }
  };

  useEffect(() => {
    async function fetchIncidents() {
      try {
        const response = await fetch("/api/incidents");
        if (!response.ok) throw new Error("Failed to fetch incidents");
        const data = await response.json();
        // Convert date strings back to Date objects
        const parsedData = data.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        }));
        setIncidents(parsedData);
      } catch (err) {
        console.error("Error loading incidents:", err);
        setError("Không thể tải dữ liệu sự cố");
      } finally {
        setLoading(false);
      }
    }

    fetchIncidents();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen gradient-holographic p-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen gradient-holographic p-6 flex justify-center items-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-holographic">
      <header className="glass-card border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground">Sự cố</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-4 px-1 scrollbar-hide snap-x">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            className="whitespace-nowrap rounded-full snap-start"
            size="sm"
          >
            Tất cả
          </Button>
          {(Object.keys(statusConfig) as Array<keyof typeof statusConfig>).map(
            (key) => {
              const config = statusConfig[key];
              const count = incidents.filter((i) => i.status === key).length;
              const isActive = filter === key;
              return (
                <Button
                  key={key}
                  variant="outline"
                  onClick={() => setFilter(key)}
                  className={cn(
                    "whitespace-nowrap rounded-full snap-start border transition-colors",
                    isActive
                      ? cn(
                          config.activeParams,
                          "border-transparent shadow-sm hover:opacity-90",
                        )
                      : cn(
                          config.color,
                          "border-transparent bg-white/70 hover:bg-muted",
                        ),
                  )}
                  size="sm"
                >
                  {config.label}{" "}
                  <span
                    className={cn(
                      "ml-1",
                      isActive ? "text-white/80" : "opacity-70",
                    )}
                  >
                    ({count})
                  </span>
                </Button>
              );
            },
          )}
        </div>

        <div className="space-y-4">
          {filteredIncidents.map((incident) => (
            <Card key={incident.id} className="glass-card p-5">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex flex-col gap-2 mb-2">
                    <div className="flex items-center justify-between gap-2">
                      <Badge
                        className={cn(
                          statusConfig[incident.status]?.color ||
                            "bg-gray-100 text-gray-800",
                          "text-sm px-3 py-1",
                        )}
                      >
                        {statusConfig[incident.status]?.label ||
                          incident.status}
                      </Badge>
                      <div className="flex items-center gap-3">
                        <span className="text-base text-muted-foreground">
                          {formatDateTime(incident.createdAt)}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold">{incident.title}</h3>
                  </div>

                  <FormattedText
                    text={incident.description}
                    className={cn(
                      "text-lg text-muted-foreground mb-3 cursor-pointer",
                      !expandedIds.has(incident.id) && "line-clamp-2",
                    )}
                    onClick={() => toggleExpanded(incident.id)}
                    title="Nhấn để xem chi tiết"
                  />

                  {(editingId === incident.id || incident.directionContent) && (
                    <div className="mt-4">
                      {editingId === incident.id ? (
                        <div className="space-y-2 p-3 bg-muted/30 rounded-lg border border-border/50">
                          <textarea
                            className="w-full p-2 rounded-md border text-base bg-background"
                            rows={3}
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            placeholder="Nhập nội dung chỉ đạo..."
                          />
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingId(null)}
                            >
                              Hủy
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleSaveDirection(incident.id)}
                            >
                              Lưu
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="group relative flex items-start gap-2 text-base text-foreground/90 bg-purple-50 p-3 rounded-md border border-purple-100 pr-8">
                          <Lightbulb className="h-4 w-4 text-purple-600 mt-0.5 shrink-0" />
                          <span className="whitespace-pre-wrap text-purple-900">
                            {incident.directionContent}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 text-muted-foreground/50 hover:text-foreground transition-colors"
                            onClick={() => startEditing(incident)}
                          >
                            <Pencil className="h-3 w-3 text-muted-foreground" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between">
                    <span
                      className={cn(
                        "text-sm font-semibold px-2 py-0.5 rounded-full",
                        severityConfig[incident.severity]?.color,
                      )}
                    >
                      Mức độ: {severityConfig[incident.severity]?.label}
                    </span>
                    {!editingId &&
                      !incident.directionContent &&
                      incident.status !== "resolved" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (
                              isRecording &&
                              recordingIncidentId === incident.id
                            ) {
                              stopRecording();
                            } else {
                              setRecordingIncidentId(incident.id);
                              startRecording();
                            }
                          }}
                          disabled={
                            (isRecording &&
                              recordingIncidentId !== incident.id) ||
                            (isTranscribing &&
                              recordingIncidentId !== incident.id)
                          }
                          className={cn(
                            "gap-1.5 transition-all duration-500 ease-in-out",
                            (isRecording &&
                              recordingIncidentId === incident.id) ||
                              (isTranscribing &&
                                recordingIncidentId === incident.id)
                              ? "w-auto"
                              : "text-purple-600 hover:bg-purple-50",
                            isRecording && recordingIncidentId === incident.id
                              ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 animate-pulse"
                              : isTranscribing &&
                                  recordingIncidentId === incident.id
                                ? "bg-blue-50 text-blue-600 border-blue-200"
                                : "",
                          )}
                        >
                          {isRecording &&
                          recordingIncidentId === incident.id ? (
                            <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                              <div className="h-2 w-2 rounded-full bg-red-600 animate-ping" />
                              <span className="whitespace-nowrap">
                                Đang nghe...
                              </span>
                            </div>
                          ) : isTranscribing &&
                            recordingIncidentId === incident.id ? (
                            <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              <span className="whitespace-nowrap">
                                Đang xử lý...
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 animate-in fade-in zoom-in duration-300">
                              <Mic className="h-3.5 w-3.5" />
                              <span className="whitespace-nowrap">Chỉ đạo</span>
                            </div>
                          )}
                        </Button>
                      )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
