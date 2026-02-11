import { NextResponse } from "next/server";
import { sheetsService } from "@/lib/sheets-service";
import axios from "axios";
import { Statistics } from "@/lib/types";

export const revalidate = 30;
export const dynamic = "force-static";

const fetchWithTimeout = async (url: string, timeout = 5000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await axios.get(url, { signal: controller.signal });
    return response.data;
  } finally {
    clearTimeout(timeoutId);
  }
};

// Safe wrapper for sheets calls
const safeSheetCall = async <T>(
  fn: () => Promise<T>,
  defaultValue: T,
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    console.error(`[Sheets] Call failed:`, error);
    return defaultValue;
  }
};

export async function GET() {
  const warnings: string[] = [];

  try {
    const results = await Promise.allSettled([
      safeSheetCall(() => sheetsService.getDirectives(), []),
      safeSheetCall(() => sheetsService.getIncidents(), []),
      safeSheetCall(() => sheetsService.getProposals(), []),
      safeSheetCall(() => sheetsService.getPlans(), []),
      fetchWithTimeout(
        "https://api.apecglobal.net/api/v1/tasks/outside?limit=100",
      ),
      fetchWithTimeout(
        "https://api.apecglobal.net/api/v1/projects/outside?limit=100",
      ),
    ]);

    // Helper to safely extract data
    const getData = <T>(index: number, name: string, defaultValue: T): T => {
      const result = results[index];
      if (result.status === "fulfilled") {
        return result.value as T;
      } else {
        console.error(`Error fetching ${name}:`, result.reason);
        warnings.push(name);
        return defaultValue;
      }
    };

    // Use explicit typing to avoid `any` where possible, but API data is messy
    const directives = getData<any[]>(0, "directives", []);
    const incidents = getData<any[]>(1, "incidents", []);
    const proposals = getData<any[]>(2, "proposals", []);
    const plans = getData<any[]>(3, "plans", []);
    const tasksData = getData<any>(4, "tasks", {
      data: { rows: [], paginations: { total: 0 } },
    });
    const projectsData = getData<any>(5, "projects", { data: [] });

    // Ensure array structure before filtering. External APIs might return unexpected structure on error.
    const safeRows = (data: any) =>
      Array.isArray(data?.data?.rows) ? data.data.rows : [];
    const safeProjects = (data: any) =>
      Array.isArray(data?.data) ? data.data : [];

    const tasksRows = safeRows(tasksData);
    const projectsList = safeProjects(projectsData);

    const statistics: Statistics = {
      directives: {
        pending: directives.filter(
          (d) => d.status !== "completed" && d.status !== "in_progress",
        ).length,
        in_progress: directives.filter((d) => d.status === "in_progress")
          .length,
        unseen_completed: directives.filter(
          (d) => d.status === "completed" && !d.seen,
        ).length,
        completed: directives.filter((d) => d.status === "completed").length,
        total: directives.length,
      },
      tasks: {
        in_progress: tasksRows.filter((t: any) => t.status?.id === 2).length,
        completed: tasksRows.filter((t: any) => t.status?.id === 4).length,
        paused: tasksRows.filter((t: any) => t.status?.id === 3).length,
        cancelled: tasksRows.filter((t: any) => t.status?.id === 5).length,
        total: tasksData?.data?.paginations?.total || tasksRows.length || 0,
      },
      projects: {
        planning: projectsList.filter((p: any) => {
          const s = (p.project_status?.name || p.status || "").toLowerCase();
          return s.includes("lập kế hoạch") || s === "planning";
        }).length,
        active: projectsList.filter((p: any) => {
          const s = (p.project_status?.name || p.status || "").toLowerCase();
          return s.includes("đang thực hiện") || s === "active";
        }).length,
        completed: projectsList.filter((p: any) => {
          const s = (p.project_status?.name || p.status || "").toLowerCase();
          return s.includes("hoàn thành") || s === "completed";
        }).length,
        on_hold: projectsList.filter((p: any) => {
          const s = (p.project_status?.name || p.status || "").toLowerCase();
          return s.includes("tạm dừng") || s === "on_hold";
        }).length,
        cancelled: projectsList.filter((p: any) => {
          const s = (p.project_status?.name || p.status || "").toLowerCase();
          return s.includes("hủy") || s === "cancelled";
        }).length,
        total: projectsList.length,
      },
      proposals: {
        submitted: proposals.filter((p) => p.status === "submitted").length,
        approved: proposals.filter((p) => p.status === "approved").length,
        rejected: proposals.filter((p) => p.status === "rejected").length,
        directed: proposals.filter((p) => p.status === "directed").length,
        draft: proposals.filter((p) => p.status === "draft").length,
        total: proposals.length,
      },
      incidents: {
        open: incidents.filter((i) => i.status === "open").length,
        directed: incidents.filter((i) => i.status === "directed").length,
        in_progress: incidents.filter((i) => i.status === "in_progress").length,
        resolved: incidents.filter((i) => i.status === "resolved").length,
        // Count open incidents OR (resolved AND unseen)
        total: incidents.filter((i) => i.status === "open").length,
      },
      plans: {
        active: plans.filter((p) => p.status === "active").length,
        completed: plans.filter((p) => p.status === "completed").length,
        paused: plans.filter((p) => p.status === "paused").length,
        cancelled: plans.filter((p) => p.status === "cancelled").length,
        total: plans.length,
      },
    };

    // Correct project total if pagination exists
    if (projectsData?.paginations?.total) {
      statistics.projects.total = projectsData.paginations.total;
    }

    return NextResponse.json({
      data: statistics,
      warnings,
    });
  } catch (error: any) {
    console.error("[API] Fatal Error fetching statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics", details: error.message },
      { status: 500 },
    );
  }
}
