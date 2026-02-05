export interface Directive {
  id: string;
  content: string;
  audioUrl?: string;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string;
  deadline?: Date;
  actionContent?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  projectId?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'completed' | 'on_hold';
  progress: number;
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Proposal {
  id: string;
  title: string;
  description: string;
  directionContent?: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'directed';
  createdAt: Date;
  updatedAt: Date;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: Date;
  resolvedAt?: Date;
}

export interface Plan {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'completed';
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
    closed: number;
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
  type: 'directives' | 'tasks' | 'projects' | 'proposals' | 'incidents' | 'plans' | 'analysis';
  enabled: boolean;
  order: number;
}
