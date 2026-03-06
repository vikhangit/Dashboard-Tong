// ─── Permission Types ───────────────────────────────────────────

export type Permission =
  | "directives.view"
  | "directives.create"
  | "directives.update_status"
  | "tasks.view"
  | "projects.view"
  | "proposals.view"
  | "proposals.approve"
  | "proposals.reject"
  | "proposals.direct"
  | "incidents.view"
  | "incidents.direct"
  | "plans.view"
  | "revenue.view"
  | "checklist.view"
  | "analysis.view"
  | "tools.view"
  | "chat.view";

// ─── All Permissions ────────────────────────────────────────────

export const ALL_PERMISSIONS: Permission[] = [
  "directives.view",
  "directives.create",
  "directives.update_status",
  "tasks.view",
  "projects.view",
  "proposals.view",
  "proposals.approve",
  "proposals.reject",
  "proposals.direct",
  "incidents.view",
  "incidents.direct",
  "plans.view",
  "revenue.view",
  "checklist.view",
  "analysis.view",
  "tools.view",
  "chat.view",
];

// ─── Vietnamese Labels ──────────────────────────────────────────

export const PERMISSION_LABELS: Record<Permission, string> = {
  "directives.view": "Xem",
  "directives.create": "Tạo",
  "directives.update_status": "Check seen",
  "tasks.view": "Xem",
  "projects.view": "Xem",
  "proposals.view": "Xem",
  "proposals.approve": "Duyệt",
  "proposals.reject": "Từ chối",
  "proposals.direct": "Chỉ đạo",
  "incidents.view": "Xem",
  "incidents.direct": "Chỉ đạo",
  "plans.view": "Xem",
  "revenue.view": "Xem",
  "checklist.view": "Xem",
  "analysis.view": "Xem",
  "tools.view": "Xem",
  "chat.view": "Chat",
};

// ─── Group permissions by module for Settings UI ────────────────

export const PERMISSION_GROUPS: {
  module: string;
  permissions: Permission[];
}[] = [
  {
    module: "Chỉ đạo",
    permissions: [
      "directives.view",
      "directives.create",
      "directives.update_status",
    ],
  },
  { module: "Công việc", permissions: ["tasks.view"] },
  { module: "Dự án", permissions: ["projects.view"] },
  {
    module: "Đề xuất",
    permissions: [
      "proposals.view",
      "proposals.approve",
      "proposals.reject",
      "proposals.direct",
    ],
  },
  {
    module: "Sự cố",
    permissions: ["incidents.view", "incidents.direct"],
  },
  { module: "Kế hoạch", permissions: ["plans.view"] },
  { module: "Doanh thu", permissions: ["revenue.view"] },
  { module: "Checklist", permissions: ["checklist.view"] },
  { module: "Phân tích", permissions: ["analysis.view"] },
  { module: "Tools", permissions: ["tools.view"] },
  { module: "AI Chat", permissions: ["chat.view"] },
];

// ─── Helpers ────────────────────────────────────────────────────

export function hasPermission(
  userPermissions: Permission[],
  permission: Permission,
): boolean {
  return userPermissions.includes(permission);
}
