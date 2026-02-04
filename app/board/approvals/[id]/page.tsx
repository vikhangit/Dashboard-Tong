'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, XCircle, MessageSquare, Send, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { mockApprovals } from '@/lib/board-mock-data';

export default function ApprovalDetailPage({ params }: { params: { id: string } }) {
  const approval = mockApprovals.find(a => a.id === params.id);
  const [comment, setComment] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [actionType, setActionType] = useState<'approved' | 'rejected' | null>(null);

  if (!approval) {
    return (
      <div className="min-h-screen gradient-holographic flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-foreground">Không tìm thấy yêu cầu phê duyệt</p>
          <Link href="/board/approvals">
            <Button className="mt-4">Quay lại</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleAction = async (action: 'approve' | 'reject') => {
    setActionType(action === 'approve' ? 'approved' : 'rejected');
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      window.history.back();
    }, 2000);
  };

  const handleAddComment = () => {
    if (!comment.trim()) return;
    console.log('[v0] Adding comment:', comment);
    setComment('');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'medium': return 'bg-blue-100 text-blue-700';
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

  return (
    <div className="min-h-screen gradient-holographic pb-32">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-card border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/board/approvals">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-base font-bold text-foreground">Chi tiết phê duyệt</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-3xl">
        {showSuccess && (
          <div className="glass-card p-4 rounded-xl mb-6 animate-in fade-in slide-in-from-top">
            <div className="flex items-center gap-3">
              {actionType === 'approved' ? (
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600" />
              )}
              <p className="font-medium text-foreground">
                {actionType === 'approved' ? 'Đã phê duyệt thành công!' : 'Đã từ chối yêu cầu!'}
              </p>
            </div>
          </div>
        )}

        {/* Approval Info */}
        <div className="glass-card p-6 rounded-2xl mb-6">
          <div className="flex items-start gap-3 mb-4">
            <Badge variant="secondary" className={getPriorityColor(approval.priority)}>
              {approval.priority === 'urgent' ? 'Khẩn cấp' : approval.priority === 'high' ? 'Cao' : 'Trung bình'}
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              {getTypeLabel(approval.type)}
            </Badge>
          </div>

          <h2 className="text-xl font-bold text-foreground mb-4">{approval.title}</h2>
          
          <div className="space-y-4 mb-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Mô tả</p>
              <p className="text-sm text-foreground leading-relaxed">{approval.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Người gửi</p>
                <p className="text-sm text-foreground">{approval.submittedBy}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Ngày gửi</p>
                <p className="text-sm text-foreground">{approval.submittedAt.toLocaleDateString('vi-VN')}</p>
              </div>
            </div>

            {approval.dueDate && (
              <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
                <Clock className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-xs font-medium text-orange-900">Hạn xử lý</p>
                  <p className="text-sm font-semibold text-orange-700">
                    {approval.dueDate.toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>
            )}

            {approval.approvedBy && approval.approvedAt && (
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-xs font-medium text-green-900">Đã phê duyệt</p>
                  <p className="text-sm font-semibold text-green-700">
                    {approval.approvedBy} - {approval.approvedAt.toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {approval.status === 'pending' && (
            <div className="flex gap-3">
              <Button
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                onClick={() => handleAction('approve')}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Phê duyệt
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-red-300 text-red-700 hover:bg-red-50 bg-transparent"
                onClick={() => handleAction('reject')}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Từ chối
              </Button>
            </div>
          )}
        </div>

        {/* Comments Section */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Bình luận</h3>
            {approval.comments && (
              <Badge variant="secondary" className="ml-auto">
                {approval.comments.length}
              </Badge>
            )}
          </div>

          {/* Existing Comments */}
          {approval.comments && approval.comments.length > 0 && (
            <div className="space-y-3 mb-4">
              {approval.comments.map((c) => (
                <div key={c.id} className="glass-card p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                      <span className="text-xs font-semibold text-white">
                        {c.userName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{c.userName}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.createdAt.toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{c.content}</p>
                </div>
              ))}
            </div>
          )}

          {/* Add Comment */}
          <div className="space-y-3">
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Thêm bình luận của bạn..."
              className="min-h-[100px] glass-card"
            />
            <Button
              onClick={handleAddComment}
              disabled={!comment.trim()}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              Gửi bình luận
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
