import { NextResponse } from "next/server";
import { sheetsService } from "@/lib/sheets-service";
import { Directive, Incident, Proposal } from "@/lib/types";

export const revalidate = 60; // 1 minute cache

export async function GET() {
  try {
    const [directives, incidents, proposals] = await Promise.all([
      sheetsService.getDirectives(),
      sheetsService.getIncidents(),
      sheetsService.getProposals(),
    ]);

    const notifications: any[] = [];

    // 1. Unseen Completed Directives
    const unseenDirectives = directives.filter(
      (d) => d.status === "completed" && !d.seen,
    );
    unseenDirectives.forEach((d) => {
      notifications.push({
        id: `dir-${d.id}`,
        type: "directive",
        title: "Chỉ đạo đã hoàn thành",
        message: d.content,
        timestamp: d.updatedAt || d.createdAt,
        link: "/directives",
        isRead: false,
      });
    });

    // 2. Open Incidents Only
    const activeIncidents = incidents.filter((i) => i.status === "open");
    activeIncidents.forEach((i) => {
      notifications.push({
        id: `inc-${i.id}`,
        type: "incident",
        title: "Sự cố mới",
        message: i.title,
        timestamp: i.updatedAt || i.createdAt,
        link: "/incidents",
        isRead: false,
      });
    });

    // 3. Submitted Proposals (Need Review)
    const submittedProposals = proposals.filter(
      (p) => p.status === "submitted",
    );
    submittedProposals.forEach((p) => {
      notifications.push({
        id: `prop-${p.id}`,
        type: "proposal",
        title: "Đề xuất mới chờ duyệt",
        message: p.title,
        timestamp: p.createdAt,
        link: "/proposals",
        isRead: false,
      });
    });

    // Sort by timestamp desc
    notifications.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    return NextResponse.json({ data: notifications });
  } catch (error) {
    console.error("[Notifications API] Error:", error);
    return NextResponse.json({ data: [] }, { status: 500 });
  }
}
