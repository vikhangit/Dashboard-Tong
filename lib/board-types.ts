export interface Approval {
  id: string;
  title: string;
  description: string;
  type: 'directive' | 'proposal' | 'budget' | 'strategic' | 'operational';
  status: 'pending' | 'approved' | 'rejected' | 'revision_requested';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  submittedBy: string;
  submittedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  dueDate?: Date;
  attachments?: string[];
  comments?: Comment[];
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
}

export interface Decision {
  id: string;
  title: string;
  description: string;
  category: 'strategic' | 'financial' | 'operational' | 'hr' | 'other';
  status: 'draft' | 'under_review' | 'decided' | 'implemented';
  decidedBy?: string;
  decidedAt?: Date;
  impact: 'low' | 'medium' | 'high' | 'critical';
  stakeholders: string[];
  outcomes?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BoardStatistics {
  pendingApprovals: number;
  approvedToday: number;
  decisionsThisWeek: number;
  criticalItems: number;
  directives: {
    active: number;
    completed: number;
    pending: number;
  };
  projects: {
    total: number;
    onTrack: number;
    atRisk: number;
    delayed: number;
  };
  financial: {
    budgetUtilization: number;
    pendingBudgets: number;
    approvedBudgets: number;
  };
}

export interface BoardMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  email: string;
  phone?: string;
  department?: string;
}

export interface DirectInput {
  id: string;
  content: string;
  type: 'directive' | 'decision' | 'approval' | 'comment';
  createdBy: string;
  targetId?: string;
  status: 'draft' | 'submitted' | 'processed';
  createdAt: Date;
  processedAt?: Date;
}
