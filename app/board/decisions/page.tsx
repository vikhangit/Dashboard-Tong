'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, Filter, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockDecisions } from '@/lib/board-mock-data';

export default function DecisionsPage() {
  const [filter, setFilter] = useState<'all' | string>('all');

  const filteredDecisions = mockDecisions.filter(decision => {
    if (filter === 'all') return true;
    return decision.status === filter || decision.category === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'decided': return 'bg-green-100 text-green-700';
      case 'implemented': return 'bg-blue-100 text-blue-700';
      case 'under_review': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'medium': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'strategic': 'Chiến lược',
      'financial': 'Tài chính',
      'operational': 'Vận hành',
      'hr': 'Nhân sự',
      'other': 'Khác'
    };
    return labels[category] || category;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'draft': 'Nháp',
      'under_review': 'Đang xem xét',
      'decided': 'Đã quyết định',
      'implemented': 'Đã triển khai'
    };
    return labels[status] || status;
  };

  const getImpactLabel = (impact: string) => {
    const labels: Record<string, string> = {
      'critical': 'Rất cao',
      'high': 'Cao',
      'medium': 'Trung bình',
      'low': 'Thấp'
    };
    return labels[impact] || impact;
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
              <h1 className="text-lg font-bold text-foreground">Quyết định</h1>
              <p className="text-xs text-muted-foreground">Quản lý quyết định chiến lược</p>
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
          
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              className={filter !== 'all' ? 'bg-transparent' : ''}
            >
              Tất cả
            </Button>
            {['under_review', 'decided', 'implemented'].map(status => (
              <Button
                key={status}
                size="sm"
                variant={filter === status ? 'default' : 'outline'}
                onClick={() => setFilter(status)}
                className={filter !== status ? 'bg-transparent' : ''}
              >
                {getStatusLabel(status)}
              </Button>
            ))}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="glass-card p-4 rounded-xl text-center">
            <p className="text-2xl font-bold text-foreground">{mockDecisions.length}</p>
            <p className="text-xs text-muted-foreground">Tổng số</p>
          </div>
          <div className="glass-card p-4 rounded-xl text-center">
            <p className="text-2xl font-bold text-orange-600">{mockDecisions.filter(d => d.status === 'under_review').length}</p>
            <p className="text-xs text-muted-foreground">Đang xem xét</p>
          </div>
          <div className="glass-card p-4 rounded-xl text-center">
            <p className="text-2xl font-bold text-green-600">{mockDecisions.filter(d => d.status === 'decided').length}</p>
            <p className="text-xs text-muted-foreground">Đã quyết định</p>
          </div>
          <div className="glass-card p-4 rounded-xl text-center">
            <p className="text-2xl font-bold text-red-600">{mockDecisions.filter(d => d.impact === 'critical').length}</p>
            <p className="text-xs text-muted-foreground">Tác động cao</p>
          </div>
        </div>

        {/* Decisions List */}
        <div className="space-y-3">
          {filteredDecisions.length === 0 ? (
            <div className="glass-card p-8 rounded-xl text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Không có quyết định nào</p>
            </div>
          ) : (
            filteredDecisions.map((decision) => (
              <div key={decision.id} className="glass-card p-5 rounded-xl">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className={getImpactColor(decision.impact)}>
                        Tác động: {getImpactLabel(decision.impact)}
                      </Badge>
                      <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                        {getCategoryLabel(decision.category)}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{decision.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{decision.description}</p>
                  </div>
                </div>

                {decision.outcomes && decision.outcomes.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Kết quả mong đợi:</p>
                    <ul className="text-xs text-foreground space-y-1">
                      {decision.outcomes.map((outcome, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4 text-muted-foreground">
                    {decision.decidedBy && (
                      <span>Quyết định bởi: {decision.decidedBy}</span>
                    )}
                    <span>{decision.updatedAt.toLocaleDateString('vi-VN')}</span>
                  </div>
                  <Badge variant="secondary" className={getStatusColor(decision.status)}>
                    {getStatusLabel(decision.status)}
                  </Badge>
                </div>

                {decision.stakeholders && decision.stakeholders.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <p className="text-xs text-muted-foreground">
                      Liên quan: {decision.stakeholders.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
