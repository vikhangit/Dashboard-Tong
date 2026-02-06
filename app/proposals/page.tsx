"use client";

import { useEffect, useState } from "react";

import {
  Lightbulb,
  Check,
  X,
  Pencil,
  Mic,
  Loader2,
  FileText,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { useVoiceRecorder } from "@/hooks/use-voice-recorder";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockProposals } from "@/lib/mock-data";
import { Proposal } from "@/lib/types";
import { cn, formatDateTime } from "@/lib/utils";
import { FormattedText } from "@/components/formatted-text";

const statusConfig = {
  submitted: {
    label: "Đã gửi",
    color: "text-yellow-700 bg-yellow-100",
    activeParams: "bg-yellow-600 text-white",
  },
  approved: {
    label: "Đã duyệt",
    color: "text-green-700 bg-green-100",
    activeParams: "bg-green-600 text-white",
  },
  rejected: {
    label: "Từ chối",
    color: "text-red-700 bg-red-100",
    activeParams: "bg-red-600 text-white",
  },
  directed: {
    label: "Đã chỉ đạo",
    color: "text-purple-700 bg-purple-100",
    activeParams: "bg-purple-600 text-white",
  },
  draft: {
    label: "Nháp",
    color: "text-gray-700 bg-gray-100",
    activeParams: "bg-gray-600 text-white",
  },
};

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]); // Initialize empty or load mock if needed, but useEffect will fetch
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<"all" | keyof typeof statusConfig>(
    "all",
  );
  const [recordingProposalId, setRecordingProposalId] = useState<string | null>(
    null,
  );

  const { isRecording, isTranscribing, startRecording, stopRecording } =
    useVoiceRecorder({
      onTranscriptionComplete: (text) => {
        if (recordingProposalId) {
          setEditContent((prev) =>
            editingId === recordingProposalId ? prev + " " + text : text,
          );
          setEditingId(recordingProposalId);
          setRecordingProposalId(null);
        }
      },
      onError: (err) => {
        console.error("Recording error:", err);
        setRecordingProposalId(null);
      },
    });

  const filteredProposals =
    filter === "all" ? proposals : proposals.filter((p) => p.status === filter);

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

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      const res = await fetch("/api/proposals");
      const data = await res.json();
      setProposals(data);
    } catch (error) {
      console.error("Failed to fetch proposals", error);
    } finally {
      setLoading(false);
    }
  };

  const updateProposal = async (id: string, updates: Partial<Proposal>) => {
    try {
      const res = await fetch("/api/proposals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProposals((prev) => prev.map((p) => (p.id === id ? updated : p)));
        return true;
      }
    } catch (error) {
      console.error("Failed to update proposal", error);
    }
    return false;
  };

  const handleApprove = async (id: string) => {
    await updateProposal(id, { status: "approved" });
  };

  const handleReject = async (id: string) => {
    await updateProposal(id, { status: "rejected" });
  };

  const handleSaveDirection = async (id: string) => {
    const success = await updateProposal(id, {
      directionContent: editContent,
      status: "directed",
    });
    if (success) {
      setEditingId(null);
      setEditContent("");
    }
  };

  const startEditing = (proposal: Proposal) => {
    setEditingId(proposal.id);
    setEditContent(proposal.directionContent || "");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-holographic">
        <div className="h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-holographic">
      <PageHeader
        title="Đề xuất"
        icon={<Lightbulb className="size-6 text-yellow-600" />}
      />

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
              const count = proposals.filter((p) => p.status === key).length;
              const isActive = filter === key;
              return (
                <Button
                  key={key}
                  variant="outline"
                  onClick={() => setFilter(key)}
                  className={`whitespace-nowrap rounded-full snap-start border transition-colors ${
                    isActive
                      ? `${config.activeParams} border-transparent shadow-sm hover:opacity-90`
                      : `${config.color} border-transparent bg-white/70 hover:bg-muted`
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
            },
          )}
        </div>

        <div className="space-y-4">
          {filteredProposals.map((proposal) => (
            <Card key={proposal.id} className="glass-card p-5">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex flex-col gap-2 mb-2">
                    <div className="flex items-center justify-between gap-2">
                      <Badge
                        className={cn(
                          statusConfig[proposal.status].color,
                          "text-sm px-3 py-1",
                        )}
                      >
                        {statusConfig[proposal.status].label}
                      </Badge>
                      <span className="text-base text-muted-foreground">
                        {formatDateTime(proposal.createdAt)}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold">{proposal.title}</h3>
                  </div>
                  <FormattedText
                    text={proposal.description}
                    className={cn(
                      "text-lg text-muted-foreground mb-3 cursor-pointer",
                      !expandedIds.has(proposal.id) && "line-clamp-2",
                    )}
                    onClick={() => toggleExpanded(proposal.id)}
                    title="Nhấn để xem chi tiết"
                  />

                  {/* Direction Section - Minimal & Conditional */}
                  {(editingId === proposal.id || proposal.directionContent) && (
                    <div className="mt-4">
                      {editingId === proposal.id ? (
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
                              onClick={() => handleSaveDirection(proposal.id)}
                            >
                              Lưu
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="group relative flex items-start gap-2 text-base text-foreground/90 bg-purple-50 p-3 rounded-md border border-purple-100 pr-8">
                          <Lightbulb className="h-4 w-4 text-purple-600 mt-0.5 shrink-0" />
                          <span className="whitespace-pre-wrap">
                            {proposal.directionContent}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 text-muted-foreground/50 hover:text-foreground transition-colors"
                            onClick={() => startEditing(proposal)}
                          >
                            <Pencil className="h-3 w-3 text-muted-foreground" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Approval Actions */}
                  {proposal.status === "submitted" && (
                    <div className="flex items-center gap-2 pt-4 border-t mt-4 overflow-hidden">
                      <div
                        className={cn(
                          "flex gap-2 transition-all duration-500 ease-in-out origin-left",
                          (isRecording &&
                            recordingProposalId === proposal.id) ||
                            (isTranscribing &&
                              recordingProposalId === proposal.id)
                            ? "w-0 opacity-0 translate-x-[-10px] pointer-events-none"
                            : "w-auto opacity-100 translate-x-0",
                        )}
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApprove(proposal.id)}
                          className="gap-1.5 text-green-600 hover:bg-green-50 shrink-0"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Duyệt
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(proposal.id)}
                          className="gap-1.5 text-red-600 hover:bg-red-50 shrink-0"
                        >
                          <X className="h-3.5 w-3.5" />
                          Từ chối
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (
                            isRecording &&
                            recordingProposalId === proposal.id
                          ) {
                            stopRecording();
                          } else {
                            setRecordingProposalId(proposal.id);
                            startRecording();
                          }
                        }}
                        disabled={
                          (isRecording &&
                            recordingProposalId !== proposal.id) ||
                          (isTranscribing &&
                            recordingProposalId !== proposal.id)
                        }
                        className={cn(
                          "gap-1.5 transition-all duration-500 ease-in-out",
                          (isRecording &&
                            recordingProposalId === proposal.id) ||
                            (isTranscribing &&
                              recordingProposalId === proposal.id)
                            ? "flex-1"
                            : "flex-none",
                          isRecording && recordingProposalId === proposal.id
                            ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 animate-pulse"
                            : isTranscribing &&
                                recordingProposalId === proposal.id
                              ? "bg-blue-50 text-blue-600 border-blue-200"
                              : "text-purple-600 hover:bg-purple-50",
                        )}
                      >
                        {isRecording && recordingProposalId === proposal.id ? (
                          <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                            <div className="h-2 w-2 rounded-full bg-red-600 animate-ping" />
                            <span className="whitespace-nowrap">
                              Đang nghe...
                            </span>
                          </div>
                        ) : isTranscribing &&
                          recordingProposalId === proposal.id ? (
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
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
