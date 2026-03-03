export interface Directive {
  id: string;
  content: string;
  audioUrl?: string;
  status: "pending" | "in_progress" | "completed";
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string;
  deadline?: Date;
  actionContent?: string;
  attachment?: string[];
  seen?: boolean;
}

export interface Task {
  id: string;
  name: string;
  process: string;
  date_start: string;
  date_end: string;
  created_at: string;
  status: {
    id: number;
    name: string;
  };
  project: {
    id: number;
    name: string;
  };
  assignee: {
    id: number;
    name: string;
    avatar: string | null;
  };
}

export interface TaskDetailSubtask {
  id: number;
  name: string;
  description: string | null;
  target_value: number;
  value: number;
  process: number;
  status: {
    id: number;
    name: string;
  };
}

export interface TaskDetailEmployeeAssignment {
  id: number;
  completed_date: string | null;
  prove: string | null;
  checked: boolean;
  process: number;
  employee: {
    id: number;
    name: string;
    avatar: string | null;
  };
  status: {
    id: number;
    name: string;
  };
  subtasks: TaskDetailSubtask[] | null;
}

export interface EmployeeTask {
  id: string;
  completed_date: string | null;
  prove: string | null;
  checked: boolean;
  value: string;
  target_value: string;
  process: string;
  status: {
    id: number;
    name: string;
  };
  task: {
    id: number;
    name: string;
    description: string | null;
    date_start?: string;
    date_end?: string;
  };
  project?: {
    id: number;
    name: string;
  };
  created_at?: string;
  employee: {
    id: number;
    name: string;
    avatar: string | null;
  };
  subtasks: TaskDetailSubtask[];
}

export interface TaskDetail extends Task {
  description: string | null;
  type: {
    id: number;
    name: string;
  };
  priority: {
    id: number;
    name: string;
  };
  target_type: {
    id: number;
    name: string;
  };
  kpi_item: {
    id: number;
    name: string;
  } | null;
  employee_assignments: TaskDetailEmployeeAssignment[];
}

export interface ProjectMember {
  id: number;
  name: string;
  email: string;
  phone: string | null;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  project_status?: {
    id: number;
    name: string;
  };
  priority: string;
  progress: number;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
  latest_updated?: string;
  manager_id: number;
  members: ProjectMember[];
  budget: string;
  spent: string;
  company_id?: number;

  // New fields from API response
  client_name?: string | null;
  client_contact?: string | null;
  technologies?: string | null;
  team_size?: number;
  key_project?: boolean;
  active?: boolean;
  is_featured?: boolean;
  image_url?: string | null;
  slug?: string | null;

  // JSON/Rich text fields (might be null or string)
  gallery?: string | null;
  features?: string | null;
  challenges?: string | null;
  solutions?: string | null;
  results?: string | null;
  testimonials?: string | null;

  departments?: {
    id: number;
    name: string;
  }[];

  documents?: {
    id: number;
    name: string;
    file_url: string;
  }[];
}

export interface ProjectApiResponse {
  data: Project[];
  paginations: {
    total: number;
    limit: number;
    page: number;
    total_page: number;
  };
}

export interface Proposal {
  id: string;
  title: string;
  description: string;
  directionContent?: string;
  status: "draft" | "submitted" | "approved" | "rejected" | "directed";
  createdAt: Date;
  updatedAt: Date;
  attachment?: string[];
}

export interface Incident {
  id: string;
  title: string; // Sự cố
  description: string; // Chi tiết
  severity: "low" | "medium" | "high" | "critical"; // Mức độ
  status: "open" | "directed" | "in_progress" | "resolved"; // Trạng thái
  createdAt: Date; // Thời gian tạo
  updatedAt: Date; // Thời gian cập nhật
  directionContent?: string; // Chỉ đạo
  attachment?: string[];
  seen?: boolean;
}

export interface Plan {
  id: string;
  title: string;
  description: string;
  status: "active" | "completed" | "paused" | "cancelled";
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  attachments?: string[]; // Links to files
}

export interface Revenue {
  id: string;
  createdAt: Date; // Thời gian tạo
  projectName: string; // Dự án
  date: Date; // Ngày
  amount: number; // Doanh số (VNĐ)
}

export interface Statistics {
  directives: {
    pending: number;
    in_progress: number;
    completed: number;
    unseen_completed: number;
    total: number;
  };
  tasks: {
    in_progress: number;
    completed: number;
    paused: number;
    cancelled: number;
    total: number;
  };
  projects: {
    planning: number;
    active: number;
    completed: number;
    on_hold: number;
    cancelled: number;
    total: number;
  };
  proposals: {
    submitted: number;
    approved: number;
    rejected: number;
    directed: number;
    draft: number;
    total: number;
  };
  incidents: {
    open: number;
    directed: number;
    in_progress: number;
    resolved: number;
    total: number;
  };
  plans: {
    active: number;
    completed: number;
    paused: number;
    cancelled: number;
    total: number;
  };
  revenue: {
    total: number;
    lastMonth: number;
    thisMonth: number;
  };
}

export interface DashboardConfig {
  id: string;
  cards: DashboardCard[];
  sheetConfig?: {
    spreadsheetId: string;
    ranges: Record<string, string>;
  };
}

export interface DashboardCard {
  id: string;
  title: string;
  icon: string;
  type:
    | "directives"
    | "tasks"
    | "projects"
    | "proposals"
    | "incidents"
    | "plans"
    | "analysis"
    | "revenue";
  enabled: boolean;
  order: number;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date | string; // Allow string for serialization
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  data: {
    rows: T[];
    paginations: {
      total: number;
      limit: number;
      page: number;
      total_pages: number;
    };
  };
}

export interface Tool {
  id: string;
  logo: string;
  name: string;
  url: string;
}

export interface ChecklistItem {
  id: string;
  status: "preparing" | "completed";
  project: string;
  field: string;
  task: string;
  startDate: Date;
  deadline?: Date;
  progress: number;
}
