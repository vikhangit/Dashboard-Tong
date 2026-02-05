import { Directive, Task, Project, Proposal, Incident, Plan, Statistics } from './types';

export const mockDirectives: Directive[] = [
  {
    id: '1',
    content: 'Hoàn thành báo cáo tháng 1',
    status: 'completed',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    assignedTo: 'Nguyễn Văn A',
    deadline: new Date('2024-01-25'),
    actionContent: 'Đã hoàn thành báo cáo, gửi qua email cho giám đốc.'
  },
  {
    id: '2',
    content: 'Chuẩn bị kế hoạch quý 2',
    status: 'in_progress',
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18'),
    assignedTo: 'Trần Thị B',
    deadline: new Date('2024-01-30')
  },
  {
    id: '3',
    content: 'Xem xét đề xuất dự án mới',
    status: 'pending',
    createdAt: new Date('2024-01-22'),
    updatedAt: new Date('2024-01-22'),
    deadline: new Date('2024-02-05')
  }
];

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Phát triển tính năng mới',
    description: 'Tính năng voice recording cho dashboard',
    status: 'in_progress',
    priority: 'high',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-20'),
    dueDate: new Date('2024-02-01')
  },
  {
    id: '2',
    title: 'Kiểm tra bảo mật hệ thống',
    description: 'Audit toàn bộ hệ thống',
    status: 'pending',
    priority: 'medium',
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12'),
    dueDate: new Date('2024-02-15')
  },
  {
    id: '3',
    title: 'Cập nhật tài liệu',
    description: 'Cập nhật tài liệu API',
    status: 'completed',
    priority: 'low',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-18')
  }
];

export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Nền tảng quản lý công việc',
    description: 'Xây dựng hệ thống quản lý công việc tích hợp AI',
    status: 'active',
    progress: 65,
    startDate: new Date('2024-01-01'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-22')
  },
  {
    id: '2',
    name: 'Ứng dụng mobile',
    description: 'Phát triển ứng dụng di động',
    status: 'planning',
    progress: 15,
    startDate: new Date('2024-02-01'),
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-22')
  },
  {
    id: '3',
    name: 'Hệ thống CRM',
    description: 'Nâng cấp hệ thống CRM hiện tại',
    status: 'completed',
    progress: 100,
    startDate: new Date('2023-11-01'),
    endDate: new Date('2024-01-10'),
    createdAt: new Date('2023-11-01'),
    updatedAt: new Date('2024-01-10')
  }
];

export const mockProposals: Proposal[] = [
  {
    id: '1',
    title: 'Đề xuất nâng cấp server',
    description: 'Tăng cường cấu hình server để xử lý tải cao hơn',
    status: 'approved',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    title: 'Đề xuất tuyển dụng',
    description: 'Tuyển thêm 2 nhân viên phát triển',
    status: 'submitted',
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18')
  }
];

export const mockIncidents: Incident[] = [
  {
    id: '1',
    title: 'Lỗi đăng nhập',
    description: 'Người dùng không thể đăng nhập vào hệ thống',
    severity: 'high',
    status: 'resolved',
    createdAt: new Date('2024-01-20'),
    resolvedAt: new Date('2024-01-20')
  },
  {
    id: '2',
    title: 'Tốc độ tải chậm',
    description: 'Dashboard load chậm trong giờ cao điểm',
    severity: 'medium',
    status: 'in_progress',
    createdAt: new Date('2024-01-21')
  }
];

export const mockPlans: Plan[] = [
  {
    id: '1',
    title: 'Kế hoạch Q2 2024',
    description: 'Kế hoạch phát triển quý 2 năm 2024',
    status: 'active',
    startDate: new Date('2024-04-01'),
    endDate: new Date('2024-06-30'),
    createdAt: new Date('2024-01-15')
  },
  {
    id: '2',
    title: 'Kế hoạch đào tạo',
    description: 'Đào tạo nhân viên về công nghệ mới',
    status: 'draft',
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-05-31'),
    createdAt: new Date('2024-01-18')
  }
];

export function calculateStatistics(): Statistics {
  return {
    directives: {
      pending: mockDirectives.filter(d => d.status === 'pending').length,
      in_progress: mockDirectives.filter(d => d.status === 'in_progress').length,
      completed: mockDirectives.filter(d => d.status === 'completed').length,
      total: mockDirectives.length
    },
    tasks: {
      pending: mockTasks.filter(t => t.status === 'pending').length,
      in_progress: mockTasks.filter(t => t.status === 'in_progress').length,
      completed: mockTasks.filter(t => t.status === 'completed').length,
      total: mockTasks.length
    },
    projects: {
      planning: mockProjects.filter(p => p.status === 'planning').length,
      active: mockProjects.filter(p => p.status === 'active').length,
      completed: mockProjects.filter(p => p.status === 'completed').length,
      on_hold: mockProjects.filter(p => p.status === 'on_hold').length,
      total: mockProjects.length
    },
    proposals: {
      draft: mockProposals.filter(p => p.status === 'draft').length,
      submitted: mockProposals.filter(p => p.status === 'submitted').length,
      approved: mockProposals.filter(p => p.status === 'approved').length,
      rejected: mockProposals.filter(p => p.status === 'rejected').length,
      total: mockProposals.length
    },
    incidents: {
      open: mockIncidents.filter(i => i.status === 'open').length,
      in_progress: mockIncidents.filter(i => i.status === 'in_progress').length,
      resolved: mockIncidents.filter(i => i.status === 'resolved').length,
      closed: mockIncidents.filter(i => i.status === 'closed').length,
      total: mockIncidents.length
    },
    plans: {
      draft: mockPlans.filter(p => p.status === 'draft').length,
      active: mockPlans.filter(p => p.status === 'active').length,
      completed: mockPlans.filter(p => p.status === 'completed').length,
      total: mockPlans.length
    }
  };
}
