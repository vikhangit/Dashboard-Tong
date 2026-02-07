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
}

export interface Plan {
  id: string;
  title: string;
  description: string;
  status: "draft" | "active" | "completed";
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
}

export interface Statistics {
  directives: {
    pending: number;
    in_progress: number;
    completed: number;
    total: number;
  };
  tasks: {
    pending: number;
    in_progress: number;
    completed: number;
    total: number;
  };
  projects: {
    planning: number;
    active: number;
    completed: number;
    on_hold: number;
    total: number;
  };
  proposals: {
    draft: number;
    submitted: number;
    approved: number;
    rejected: number;
    total: number;
  };
  incidents: {
    open: number;
    in_progress: number;
    resolved: number;
    total: number;
  };
  plans: {
    draft: number;
    active: number;
    completed: number;
    total: number;
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
    | "analysis";
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
