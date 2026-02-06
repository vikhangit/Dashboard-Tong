"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ClipboardList,
  Briefcase,
  FolderKanban,
  Lightbulb,
  AlertTriangle,
  Calendar,
  BarChart3,
  UserPlus,
  Bell,
  Menu,
  Bot,
  Users,
  ChevronUp,
  LayoutGrid,
  MessageSquare,
  X,
  Send,
  Trash2,
  Loader2,
} from "lucide-react";
import { VoiceRecorder } from "@/components/voice-recorder";
import { StatsCard } from "@/components/stats-card";
import { DashboardShortcut } from "@/components/dashboard-shortcut";
import { AppHeader } from "@/components/app-header";
import { BottomNav } from "@/components/bottom-nav";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"; // Assuming Textarea exists, otherwise I'll use textarea tag
import { Statistics } from "@/lib/types";

export default function HomePage() {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  const [notificationCount, setNotificationCount] = useState(0);
  const [lastTranscript, setLastTranscript] = useState<string>("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShowDashboard(true); // Always show on desktop
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await fetch("/api/statistics");
      const data = await response.json();
      setStatistics(data);

      // Calculate notification count (pending tasks + new directives)
      const pendingCount = data.tasks.pending + data.directives.pending;
      setNotificationCount(pendingCount);
    } catch (error) {
      console.error("[v0] Error fetching statistics:", error);
    }
  };

  const [isTranscribing, setIsTranscribing] = useState(false);

  const handleRecordingComplete = async (
    transcript: string,
    audioBlob?: Blob,
  ) => {
    if (audioBlob) {
      setIsTranscribing(true);
      try {
        const formData = new FormData();
        formData.append("file", audioBlob);

        const res = await fetch("/api/transcribe", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (data.text) {
          setLastTranscript((prev) =>
            prev ? `${prev} ${data.text}` : data.text,
          );
        }
      } catch (err) {
        console.error("Transcription failed", err);
      } finally {
        setIsTranscribing(false);
      }
    } else if (transcript) {
      setLastTranscript((prev) =>
        prev ? `${prev} ${transcript}` : transcript,
      );
    }
  };

  const handleCancelDirective = () => {
    setLastTranscript("");
  };

  const handleSendDirective = async () => {
    if (!lastTranscript.trim() || isSending) return;

    setIsSending(true);
    try {
      // 1. Save locally
      const saveRes = await fetch("/api/directives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: lastTranscript }),
      });

      // 2. Send to N8N
      // Don't await strictly if we want speed, but here we wait to ensure success
      fetch("/api/integrations/n8n", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: lastTranscript,
          timestamp: new Date().toISOString(),
        }),
      }).catch((err) => console.error("N8N send failed", err));

      if (saveRes.ok) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        setLastTranscript(""); // Clear after sending
        fetchStatistics();
      }
    } catch (error) {
      console.error("Error sending directive:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleSwipeUp = () => {
    if (isMobile) {
      setShowDashboard(true);
    }
  };

  const handleSwipeDown = () => {
    if (isMobile) {
      setShowDashboard(false);
    }
  };

  if (!statistics) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-holographic">
        <div className="h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  // Mobile Minimalist View
  if (isMobile && !showDashboard) {
    return (
      <div className="min-h-screen gradient-holographic flex flex-col relative">
        {/* Minimal Header */}
        <AppHeader />

        {/* Dashboard Category Tiles - 2 rows x 4 columns */}
        <div className="px-4 pt-3 pb-2 z-0">
          <div className="grid grid-cols-3 gap-2">
            {/* Row 1 */}

            <DashboardShortcut
              href="/directives"
              icon={ClipboardList}
              label="Chỉ đạo"
              iconColor="text-purple-600"
              // count={statistics.directives.pending}
            />

            <DashboardShortcut
              href="/tasks"
              icon={Briefcase}
              label="Công việc"
              iconColor="text-blue-600"
              /* count={statistics.tasks.pending} */
            />

            <DashboardShortcut
              href="/projects"
              icon={FolderKanban}
              label="Dự án"
              iconColor="text-green-600"
              /* count={statistics.projects.planning} */
            />

            {/* Row 2 */}
            <DashboardShortcut
              href="/proposals"
              icon={Lightbulb}
              label="Đề xuất"
              iconColor="text-yellow-600"
              // count={statistics.proposals.submitted}
            />

            <DashboardShortcut
              href="/incidents"
              icon={AlertTriangle}
              label="Sự cố"
              iconColor="text-red-600"
              // count={statistics.incidents.open}
            />

            <DashboardShortcut
              href="/plans"
              icon={Calendar}
              label="Kế hoạch"
              iconColor="text-teal-600"
              /* count={statistics.plans.draft} */
            />

            <DashboardShortcut
              href="/analysis"
              icon={BarChart3}
              label="Phân tích"
              iconColor="text-violet-600"
            />
          </div>
        </div>

        {/* Main Content - Voice Only - Fixed Layout Overlay */}
        {/* We use a fixed container overlaying the content, positioned above the bottom nav */}
        {/* Assuming BottomNav is roughly 60-80px. using bottom-20 (5rem/80px) to be safe or checking BottomNav */}
        <div className="fixed inset-x-0 bottom-[80px] top-[280px] flex flex-col justify-end items-center pointer-events-none z-10 px-4 pb-4">
          <div className="w-full max-w-sm flex flex-col items-center gap-4 pointer-events-auto">
            {/* Label */}
            {!lastTranscript && !showSuccess && (
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide text-center animate-in fade-in slide-in-from-bottom-2">
                Chỉ đạo công việc
              </h2>
            )}

            {/* Success Message */}
            {showSuccess && (
              <div className="glass-card p-3 rounded-xl animate-in fade-in slide-in-from-bottom-4 shadow-lg">
                <p className="text-sm font-medium text-green-700">
                  Đã ghi nhận chỉ đạo thành công!
                </p>
              </div>
            )}

            {/* Transcript Editor */}
            {lastTranscript && (
              <div className="w-full animate-in fade-in slide-in-from-bottom-2 relative group shadow-lg rounded-xl">
                <Textarea
                  value={lastTranscript}
                  onChange={(e) => setLastTranscript(e.target.value)}
                  className="min-h-[100px] p-3 pr-10 rounded-xl bg-white/90 border-white/40 shadow-sm text-base text-foreground resize-none focus:ring-1 focus:ring-primary/50 backdrop-blur-sm"
                  placeholder="Nội dung chỉ đạo..."
                />

                {/* Clear Button */}
                <Button
                  onClick={handleCancelDirective}
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-full"
                  title="Xóa nội dung"
                >
                  <X className="h-4 w-4" />
                </Button>

                {/* Send Button */}
                <div className="absolute bottom-2 right-2">
                  <Button
                    onClick={handleSendDirective}
                    disabled={isSending}
                    size="sm"
                    className="h-7 px-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 shadow-sm rounded-full text-xs"
                  >
                    {isSending ? (
                      <>
                        Đang gửi...{" "}
                        <Loader2 className="ml-1 h-3 w-3 animate-spin" />
                      </>
                    ) : (
                      <>
                        Gửi <Send className="ml-1 h-3 w-3" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Voice Recorder - Always at the bottom of the stack */}
            <div className="mt-2">
              <VoiceRecorder
                onRecordingComplete={handleRecordingComplete}
                isParentProcessing={isTranscribing}
              />
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <BottomNav
          showDashboard={showDashboard}
          setShowDashboard={setShowDashboard}
        />
      </div>
    );
  }

  // Full Dashboard View (Desktop or Mobile after swipe up)
  return (
    <div className="min-h-screen gradient-holographic pb-20">
      {/* Header */}
      <AppHeader />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Voice Recording Section - Only on Desktop */}
        {!isMobile && (
          <div className="text-center mb-12">
            {!lastTranscript && (
              <h2 className="text-sm font-medium text-muted-foreground mb-6 uppercase tracking-wide">
                Chỉ đạo công việc
              </h2>
            )}

            {/* Transcript Editor - Compact & Above Recorder (Desktop) */}
            {lastTranscript && !isTranscribing && (
              <div className="mb-6 max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-2 relative">
                <Textarea
                  value={lastTranscript}
                  onChange={(e) => setLastTranscript(e.target.value)}
                  className="min-h-[100px] p-4 pr-12 rounded-xl bg-white/60 border-white/40 shadow-sm text-lg text-foreground resize-none focus:ring-1 focus:ring-primary/50 backdrop-blur-sm"
                  placeholder="Nội dung chỉ đạo..."
                />

                {/* Clear Button */}
                <Button
                  onClick={handleCancelDirective}
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                >
                  <X className="h-4 w-4" />
                </Button>

                {/* Send Button */}
                <div className="absolute bottom-3 right-3">
                  <Button
                    onClick={handleSendDirective}
                    disabled={isSending}
                    className="h-8 px-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 shadow-sm rounded-full text-xs font-medium"
                  >
                    {isSending ? (
                      <>
                        Đang gửi...{" "}
                        <Loader2 className="ml-1 h-3 w-3 animate-spin" />
                      </>
                    ) : (
                      <>
                        Gửi chỉ đạo <Send className="ml-1 h-3 w-3" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-center mb-8 relative">
              {/* Added relative here just in case, but desktop flow is less critical for fix as per user requirements for mobile 'pushing' */}
              <VoiceRecorder
                onRecordingComplete={handleRecordingComplete}
                isParentProcessing={isTranscribing}
              />
            </div>

            {showSuccess && (
              <div className="glass-card p-4 rounded-xl max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 mb-8">
                <p className="text-sm font-medium text-green-700">
                  Đã ghi nhận chỉ đạo thành công!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Statistics Grid */}
        <div
          className={`grid gap-4 ${isMobile ? "grid-cols-1" : "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"}`}
        >
          {/* Quick Actions */}
          <div className="glass-card px-4 py-2 rounded-2xl">
            <h3 className="text-lg font-semibold mb-2 text-foreground">
              Hành động nhanh
            </h3>
            <div className="grid gap-2 grid-cols-1">
              <Link href="/directives" className="w-full">
                <Button
                  variant="outline"
                  className="w-full justify-start glass-card hover:bg-white/80 bg-transparent"
                >
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Xem tất cả chỉ đạo
                </Button>
              </Link>
              <Link href="/tasks" className="w-full">
                <Button
                  variant="outline"
                  className="w-full justify-start glass-card hover:bg-white/80 bg-transparent"
                >
                  <Briefcase className="mr-2 h-4 w-4" />
                  Quản lý công việc
                </Button>
              </Link>
              <Link href="/projects" className="w-full">
                <Button
                  variant="outline"
                  className="w-full justify-start glass-card hover:bg-white/80 bg-transparent"
                >
                  <FolderKanban className="mr-2 h-4 w-4" />
                  Quản lý dự án
                </Button>
              </Link>
            </div>
          </div>

          <StatsCard
            title="Chỉ đạo"
            icon={ClipboardList}
            iconBgColor="bg-gradient-to-br from-purple-500 to-indigo-600"
            href="/directives"
            stats={[
              { label: "Đã chỉ đạo", value: statistics.directives.pending },
              {
                label: "Đã tiếp nhận",
                value: statistics.directives.in_progress,
              },
              {
                label: "Đã hoàn thành",
                value: statistics.directives.completed,
              },
            ]}
          />

          <StatsCard
            title="Công việc"
            icon={Briefcase}
            iconBgColor="bg-gradient-to-br from-blue-500 to-cyan-600"
            href="/tasks"
            stats={[
              { label: "Chờ xử lý", value: statistics.tasks.pending },
              { label: "Đang thực hiện", value: statistics.tasks.in_progress },
              { label: "Hoàn thành", value: statistics.tasks.completed },
            ]}
          />

          <StatsCard
            title="Dự án"
            icon={FolderKanban}
            iconBgColor="bg-gradient-to-br from-green-500 to-emerald-600"
            href="/projects"
            stats={[
              { label: "Lập kế hoạch", value: statistics.projects.planning },
              { label: "Đang thực hiện", value: statistics.projects.active },
              { label: "Hoàn thành", value: statistics.projects.completed },
            ]}
          />

          <StatsCard
            title="Đề xuất"
            icon={Lightbulb}
            iconBgColor="bg-gradient-to-br from-yellow-500 to-orange-600"
            href="/proposals"
            stats={[
              { label: "Nháp", value: statistics.proposals.draft },
              { label: "Đã gửi", value: statistics.proposals.submitted },
              { label: "Đã duyệt", value: statistics.proposals.approved },
            ]}
          />

          <StatsCard
            title="Sự cố"
            icon={AlertTriangle}
            iconBgColor="bg-gradient-to-br from-red-500 to-pink-600"
            href="/incidents"
            stats={[
              { label: "Mới", value: statistics.incidents.open },
              { label: "Đang xử lý", value: statistics.incidents.in_progress },
              { label: "Đã giải quyết", value: statistics.incidents.resolved },
            ]}
          />

          <StatsCard
            title="Kế hoạch"
            icon={Calendar}
            iconBgColor="bg-gradient-to-br from-teal-500 to-cyan-600"
            href="/plans"
            stats={[
              { label: "Nháp", value: statistics.plans.draft },
              { label: "Đang thực hiện", value: statistics.plans.active },
              { label: "Hoàn thành", value: statistics.plans.completed },
            ]}
          />

          <StatsCard
            title="Phân tích"
            icon={BarChart3}
            iconBgColor="bg-gradient-to-br from-violet-500 to-purple-600"
            href="/analysis"
            stats={[
              {
                label: "Tổng số dữ liệu",
                value: statistics.directives.total + statistics.tasks.total,
              },
              {
                label: "Hoàn thành",
                value:
                  statistics.directives.completed + statistics.tasks.completed,
              },
            ]}
          />
        </div>

        {/* Bottom Navigation - Mobile Only */}
        {isMobile && (
          <BottomNav
            showDashboard={showDashboard}
            setShowDashboard={setShowDashboard}
          />
        )}
      </div>
    </div>
  );
}
