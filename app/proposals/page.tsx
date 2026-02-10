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
  Link as LinkIcon,
  Send,
  CheckCircle2,
  XCircle,
  MessageSquare,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { useVoiceRecorder } from "@/hooks/use-voice-recorder";
import { Badge } from "@/components/ui/badge";
import { ExpandableText } from "@/components/expandable-text";
import { Proposal } from "@/lib/types";
import { cn, formatDateTime } from "@/lib/utils";
import { AppPagination } from "@/components/app-pagination";
import { AttachmentList } from "@/components/attachment-list";
import { ReloadButton } from "@/components/reload-button";
import { StatusFilter } from "@/components/status-filter";
import { CollapsibleSection } from "@/components/collapsible-section";

const statusConfig = {
  submitted: {
    label: "Đã gửi",
    color: "bg-yellow-600",
    textColor: "text-yellow-700",
    badgeColor: "text-yellow-700 bg-yellow-100",
    icon: Send,
  },
  approved: {
    label: "Đã duyệt",
    color: "bg-green-600",
    textColor: "text-green-700",
    badgeColor: "text-green-700 bg-green-100",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Từ chối",
    color: "bg-red-600",
    textColor: "text-red-700",
    badgeColor: "text-red-700 bg-red-100",
    icon: XCircle,
  },
  directed: {
    label: "Đã chỉ đạo",
    color: "bg-purple-600",
    textColor: "text-purple-700",
    badgeColor: "text-purple-700 bg-purple-100",
    icon: MessageSquare,
  },
  draft: {
    label: "Nháp",
    color: "bg-gray-600",
    textColor: "text-gray-700",
    badgeColor: "text-gray-700 bg-gray-100",
    icon: FileText,
  },
};

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]); // Initialize empty or load mock if needed, but useEffect will fetch
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [filter, setFilter] = useState<"all" | keyof typeof statusConfig>(
    "all",
  );
  const [recordingProposalId, setRecordingProposalId] = useState<string | null>(
    null,
  );
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

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

  // Pagination Logic
  const paginatedProposals = filteredProposals.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit,
  );

  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      total: filteredProposals.length,
      page: 1,
    }));
  }, [filter, proposals.length]);

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
      >
        <ReloadButton onReload={fetchProposals} />
      </PageHeader>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Filters */}
        <StatusFilter
          filter={filter}
          onFilterChange={(value) =>
            setFilter(value as "all" | keyof typeof statusConfig)
          }
          config={statusConfig}
          totalCount={proposals.length}
          counts={proposals.reduce(
            (acc, p) => {
              const status = p.status;
              acc[status] = (acc[status] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>,
          )}
          className="mb-6 flex-wrap"
        />

        <div className="space-y-4">
          {paginatedProposals.map((proposal) => {
            const config =
              statusConfig[proposal.status as keyof typeof statusConfig] ||
              statusConfig.draft;
            const StatusIcon = config.icon;

            return (
              <div
                key={proposal.id}
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

                    <span className="text-base text-muted-foreground">
                      {formatDateTime(proposal.createdAt)}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 mb-3">
                    <h3 className="text-lg font-semibold">{proposal.title}</h3>
                    <ExpandableText
                      text={proposal.description}
                      className="text-lg text-muted-foreground"
                    />
                  </div>

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

                  {proposal.attachment && proposal.attachment.length > 0 && (
                    <CollapsibleSection title="Minh chứng" defaultOpen={true}>
                      <AttachmentList attachments={proposal.attachment} />
                    </CollapsibleSection>
                  )}

                  {/* Approval Actions */}
                  {proposal.status === "submitted" && (
                    <div className="flex flex-col gap-3 pt-4 border-t mt-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApprove(proposal.id)}
                          className="flex-1 gap-1.5 text-green-600 hover:bg-green-50"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Duyệt
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(proposal.id)}
                          className="flex-1 gap-1.5 text-red-600 hover:bg-red-50"
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
                          "w-full gap-1.5 transition-all duration-500 ease-in-out",
                          isRecording && recordingProposalId === proposal.id
                            ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 animate-pulse"
                            : isTranscribing &&
                                recordingProposalId === proposal.id
                              ? "bg-blue-50 text-blue-600 border-blue-200"
                              : "text-purple-600 hover:bg-purple-50",
                        )}
                      >
                        {isRecording && recordingProposalId === proposal.id ? (
                          <div className="flex items-center justify-center gap-2 animate-in fade-in zoom-in duration-300">
                            <div className="h-2 w-2 rounded-full bg-red-600 animate-ping" />
                            <span className="whitespace-nowrap">
                              Đang nghe...
                            </span>
                          </div>
                        ) : isTranscribing &&
                          recordingProposalId === proposal.id ? (
                          <div className="flex items-center justify-center gap-2 animate-in fade-in zoom-in duration-300">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span className="whitespace-nowrap">
                              Đang xử lý...
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1.5 animate-in fade-in zoom-in duration-300">
                            <Mic className="h-3.5 w-3.5" />
                            <span className="whitespace-nowrap">Chỉ đạo</span>
                          </div>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {pagination.total > 0 && (
          <div className="mt-6">
            <AppPagination
              page={pagination.page}
              total={pagination.total}
              limit={pagination.limit}
              onChange={(newPage) =>
                setPagination((prev) => ({ ...prev, page: newPage }))
              }
              itemName="đề xuất"
              currentCount={paginatedProposals.length}
            />
          </div>
        )}
      </div>
    </div>
  );
}
