'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, XCircle, Clock, AlertCircle, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockApprovals } from '@/lib/board-mock-data';
import { Approval } from '@/lib/board-types';

export default function ApprovalsPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | string>('all');

  const filteredApprovals = mockApprovals.filter(approval => {
    if (filter !== 'all' && approval.status !== filter) return false;
    if (typeFilter !== 'all' && approval.type !== typeFilter) return false;
    return true;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'medium': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'pending': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'directive': 'Chỉ đạo',
      'proposal': 'Đề xuất',
      'budget': 'Ngân sách',
      'strategic': 'Chiến lược',
      'operational': 'Vận hành'
    };
    return labels[type] || type;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'pending': 'Chờ duyệt',
      'approved': 'Đã duyệt',
      'rejected': 'Từ chối',
      'revision_requested': 'Yêu cầu chỉnh sửa'
    };
    return labels[status] || status;
  };

  return (
    <div className="min-h-screen gradient-holographic pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-card border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/board">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-foreground">Phê duyệt</h1>
              <p className="text-xs text-muted-foreground">Quản lý yêu cầu phê duyệt</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Filters */}
        <div className="glass-card p-4 rounded-xl mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Bộ lọc</span>
          </div>
          
          <div className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
                className={filter !== 'all' ? 'bg-transparent' : ''}
              >
                Tất cả
              </Button>
              <Button
                size="sm"
                variant={filter === 'pending' ? 'default' : 'outline'}
                onClick={() => setFilter('pending')}
                className={filter !== 'pending' ? 'bg-transparent' : ''}
              >
                <Clock className="h-3 w-3 mr-1" />
                Chờ duyệt
              </Button>
              <Button
                size="sm"
                variant={filter === 'approved' ? 'default' : 'outline'}
                onClick={() => setFilter('approved')}
                className={filter !== 'approved' ? 'bg-transparent' : ''}
              >
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Đã duyệt
              </Button>
              <Button
                size="sm"
                variant={filter === 'rejected' ? 'default' : 'outline'}
                onClick={() => setFilter('rejected')}
                className={filter !== 'rejected' ? 'bg-transparent' : ''}
              >
                <XCircle className="h-3 w-3 mr-1" />
                Từ chối
              </Button>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant={typeFilter === 'all' ? 'secondary' : 'outline'}
                onClick={() => setTypeFilter('all')}
                className={typeFilter !== 'all' ? 'bg-transparent' : ''}
              >
                Tất cả loại
              </Button>
              {['budget', 'strategic', 'operational', 'directive', 'proposal'].map(type => (
                <Button
                  key={type}
                  size="sm"
                  variant={typeFilter === type ? 'secondary' : 'outline'}
                  onClick={() => setTypeFilter(type)}
                  className={typeFilter !== type ? 'bg-transparent' : ''}
                >
                  {getTypeLabel(type)}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="glass-card p-4 rounded-xl text-center">
            <p className="text-2xl font-bold text-foreground">{mockApprovals.length}</p>
            <p className="text-xs text-muted-foreground">Tổng số</p>
          </div>
          <div className="glass-card p-4 rounded-xl text-center">
            <p className="text-2xl font-bold text-orange-600">{mockApprovals.filter(a => a.status === 'pending').length}</p>
            <p className="text-xs text-muted-foreground">Chờ duyệt</p>
          </div>
          <div className="glass-card p-4 rounded-xl text-center">
            <p className="text-2xl font-bold text-green-600">{mockApprovals.filter(a => a.status === 'approved').length}</p>
            <p className="text-xs text-muted-foreground">Đã duyệt</p>
          </div>
          <div className="glass-card p-4 rounded-xl text-center">
            <p className="text-2xl font-bold text-red-600">{mockApprovals.filter(a => a.priority === 'urgent' || a.priority === 'high').length}</p>
            <p className="text-xs text-muted-foreground">Ưu tiên cao</p>
          </div>
        </div>

        {/* Approvals List */}
        <div className="space-y-3">
          {filteredApprovals.length === 0 ? (
            <div className="glass-card p-8 rounded-xl text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Không có yêu cầu phê duyệt nào</p>
            </div>
          ) : (
            filteredApprovals.map((approval) => (
              <Link key={approval.id} href={`/board/approvals/${approval.id}`}>
                <div className="glass-card p-5 rounded-xl hover:bg-white/80 transition-all cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className={getPriorityColor(approval.priority)}>
                          {approval.priority === 'urgent' ? 'Khẩn cấp' : approval.priority === 'high' ? 'Cao' : approval.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                        </Badge>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          {getTypeLabel(approval.type)}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">{approval.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{approval.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <span>Từ: {approval.submittedBy}</span>
                      <span>{approval.submittedAt.toLocaleDateString('vi-VN')}</span>
                      {approval.dueDate && (
                        <span className="text-orange-600">
                          Hạn: {approval.dueDate.toLocaleDateString('vi-VN')}
                        </span>
                      )}
                    </div>
                    <Badge variant="secondary" className={getStatusColor(approval.status)}>
                      {getStatusLabel(approval.status)}
                    </Badge>
                  </div>

                  {approval.comments && approval.comments.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <p className="text-xs text-muted-foreground">
                        {approval.comments.length} bình luận
                      </p>
                    </div>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
