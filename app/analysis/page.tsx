"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Statistics } from "@/lib/types";

export default function AnalysisPage() {
  const [statistics, setStatistics] = useState<Statistics | null>(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await fetch("/api/statistics");
      const result = await response.json();

      if (result.data) {
        setStatistics(result.data);
      }

      if (result.warnings && result.warnings.length > 0) {
        console.warn("Some data sources failed:", result.warnings);
        // Optional: Show toast or alert
      }
    } catch (error) {
      console.error("[v0] Error fetching statistics:", error);
    }
  };

  if (!statistics) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-holographic">
        <div className="h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const completionRate = {
    directives:
      statistics.directives.total > 0
        ? Math.round(
            (statistics.directives.completed / statistics.directives.total) *
              100,
          )
        : 0,
    tasks:
      statistics.tasks.total > 0
        ? Math.round(
            (statistics.tasks.completed / statistics.tasks.total) * 100,
          )
        : 0,
    projects:
      statistics.projects.total > 0
        ? Math.round(
            (statistics.projects.completed / statistics.projects.total) * 100,
          )
        : 0,
  };

  const overallCompletion = Math.round(
    (completionRate.directives +
      completionRate.tasks +
      completionRate.projects) /
      3,
  );

  return (
    <div className="min-h-screen gradient-holographic">
      <header className="glass-card border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground">Phân tích</h1>
              <p className="text-sm text-muted-foreground">
                Thống kê và phân tích dữ liệu
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Overall Stats */}
        <Card className="glass-card p-6 mb-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-purple-400 via-blue-400 to-green-400 mb-4">
              <div className="flex flex-col items-center text-white">
                <TrendingUp className="h-8 w-8 mb-2" />
                <span className="text-3xl font-bold">{overallCompletion}%</span>
              </div>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              Tỷ lệ hoàn thành tổng thể
            </h2>
            <p className="text-sm text-muted-foreground">
              Trung bình các công việc đã hoàn thành
            </p>
          </div>
        </Card>

        {/* Detailed Analytics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
          <Card className="glass-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-2 text-white">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">Chỉ đạo</h3>
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">
              {completionRate.directives}%
            </div>
            <p className="text-xs text-muted-foreground">
              {statistics.directives.completed}/{statistics.directives.total}{" "}
              hoàn thành
            </p>
          </Card>

          <Card className="glass-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-2 text-white">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">Công việc</h3>
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">
              {completionRate.tasks}%
            </div>
            <p className="text-xs text-muted-foreground">
              {statistics.tasks.completed}/{statistics.tasks.total} hoàn thành
            </p>
          </Card>

          <Card className="glass-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-2 text-white">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">Dự án</h3>
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">
              {completionRate.projects}%
            </div>
            <p className="text-xs text-muted-foreground">
              {statistics.projects.completed}/{statistics.projects.total} hoàn
              thành
            </p>
          </Card>
        </div>

        {/* Detailed Breakdown */}
        <Card className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">Chi tiết thống kê</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Tổng chỉ đạo</span>
                <span className="font-semibold">
                  {statistics.directives.total}
                </span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Tổng công việc</span>
                <span className="font-semibold">{statistics.tasks.total}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Tổng dự án</span>
                <span className="font-semibold">
                  {statistics.projects.total}
                </span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Tổng đề xuất</span>
                <span className="font-semibold">
                  {statistics.proposals.total}
                </span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Tổng sự cố</span>
                <span className="font-semibold">
                  {statistics.incidents.total}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tổng kế hoạch</span>
                <span className="font-semibold">{statistics.plans.total}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
