import { Approval, Decision, BoardStatistics, BoardMember, DirectInput } from './board-types';

export const mockApprovals: Approval[] = [
  {
    id: '1',
    title: 'Phê duyệt ngân sách Q2 2024',
    description: 'Đề xuất ngân sách vận hành cho quý 2 năm 2024, bao gồm chi phí nhân sự, marketing và phát triển sản phẩm',
    type: 'budget',
    status: 'pending',
    priority: 'high',
    submittedBy: 'Nguyễn Văn A',
    submittedAt: new Date('2024-01-20'),
    dueDate: new Date('2024-01-30'),
    comments: [
      {
        id: '1',
        userId: 'user-1',
        userName: 'Trần Thị B',
        content: 'Cần xem xét lại chi phí marketing',
        createdAt: new Date('2024-01-21')
      }
    ]
  },
  {
    id: '2',
    title: 'Chỉ đạo chiến lược mở rộng thị trường',
    description: 'Kế hoạch mở rộng sang 3 tỉnh miền Trung trong Q2-Q3/2024',
    type: 'strategic',
    status: 'pending',
    priority: 'urgent',
    submittedBy: 'Lê Văn C',
    submittedAt: new Date('2024-01-22'),
    dueDate: new Date('2024-01-25')
  },
  {
    id: '3',
    title: 'Phê duyệt tuyển dụng 10 nhân viên mới',
    description: 'Kế hoạch tuyển dụng cho bộ phận công nghệ và kinh doanh',
    type: 'operational',
    status: 'approved',
    priority: 'medium',
    submittedBy: 'Phạm Thị D',
    submittedAt: new Date('2024-01-15'),
    approvedBy: 'Ban Giám Đốc',
    approvedAt: new Date('2024-01-18')
  }
];

export const mockDecisions: Decision[] = [
  {
    id: '1',
    title: 'Quyết định đầu tư công nghệ AI',
    description: 'Đầu tư 5 tỷ VNĐ vào nghiên cứu và phát triển công nghệ AI cho sản phẩm',
    category: 'strategic',
    status: 'decided',
    decidedBy: 'Hội đồng quản trị',
    decidedAt: new Date('2024-01-18'),
    impact: 'critical',
    stakeholders: ['Phòng R&D', 'Phòng Tài chính', 'Phòng Kinh doanh'],
    outcomes: ['Tăng cường năng lực cạnh tranh', 'Cải thiện trải nghiệm người dùng'],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18')
  },
  {
    id: '2',
    title: 'Thay đổi cơ cấu tổ chức',
    description: 'Tái cơ cấu bộ máy quản lý để tăng hiệu quả',
    category: 'operational',
    status: 'under_review',
    impact: 'high',
    stakeholders: ['Toàn bộ nhân viên', 'Ban lãnh đạo'],
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-22')
  }
];

export const mockBoardMembers: BoardMember[] = [
  {
    id: '1',
    name: 'Nguyễn Văn An',
    role: 'Chủ tịch Hội đồng quản trị',
    email: 'an.nguyen@company.com',
    phone: '0901234567',
    department: 'Ban lãnh đạo'
  },
  {
    id: '2',
    name: 'Trần Thị Bình',
    role: 'Tổng Giám đốc',
    email: 'binh.tran@company.com',
    phone: '0902345678',
    department: 'Ban lãnh đạo'
  },
  {
    id: '3',
    name: 'Lê Văn Cường',
    role: 'Phó Tổng Giám đốc',
    email: 'cuong.le@company.com',
    phone: '0903456789',
    department: 'Ban lãnh đạo'
  }
];

export const mockDirectInputs: DirectInput[] = [
  {
    id: '1',
    content: 'Chỉ đạo hoàn thành báo cáo tài chính Q1 trước ngày 31/01',
    type: 'directive',
    createdBy: 'Nguyễn Văn An',
    status: 'processed',
    createdAt: new Date('2024-01-15'),
    processedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    content: 'Phê duyệt kế hoạch marketing cho chiến dịch tết',
    type: 'approval',
    createdBy: 'Trần Thị Bình',
    targetId: 'approval-001',
    status: 'submitted',
    createdAt: new Date('2024-01-22')
  }
];

export function calculateBoardStatistics(): BoardStatistics {
  return {
    pendingApprovals: mockApprovals.filter(a => a.status === 'pending').length,
    approvedToday: mockApprovals.filter(a => {
      if (!a.approvedAt) return false;
      const today = new Date();
      return a.approvedAt.toDateString() === today.toDateString();
    }).length,
    decisionsThisWeek: mockDecisions.filter(d => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return d.updatedAt >= weekAgo;
    }).length,
    criticalItems: mockApprovals.filter(a => a.priority === 'urgent' || a.priority === 'high').length,
    directives: {
      active: mockDirectInputs.filter(d => d.type === 'directive' && d.status === 'processed').length,
      completed: mockDirectInputs.filter(d => d.type === 'directive' && d.status === 'processed').length,
      pending: mockDirectInputs.filter(d => d.type === 'directive' && d.status === 'submitted').length
    },
    projects: {
      total: 12,
      onTrack: 7,
      atRisk: 3,
      delayed: 2
    },
    financial: {
      budgetUtilization: 68,
      pendingBudgets: mockApprovals.filter(a => a.type === 'budget' && a.status === 'pending').length,
      approvedBudgets: mockApprovals.filter(a => a.type === 'budget' && a.status === 'approved').length
    }
  };
}
