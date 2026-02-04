'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Lightbulb, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockProposals } from '@/lib/mock-data';
import { Proposal } from '@/lib/types';

const statusConfig = {
  draft: { label: 'Nháp', color: 'text-gray-700 bg-gray-100' },
  submitted: { label: 'Đã gửi', color: 'text-blue-700 bg-blue-100' },
  approved: { label: 'Đã duyệt', color: 'text-green-700 bg-green-100' },
  rejected: { label: 'Từ chối', color: 'text-red-700 bg-red-100' }
};

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>(mockProposals);

  const handleApprove = async (id: string) => {
    // In production, call API
    setProposals(prev => prev.map(p => 
      p.id === id ? { ...p, status: 'approved' as const } : p
    ));
  };

  const handleReject = async (id: string) => {
    // In production, call API
    setProposals(prev => prev.map(p => 
      p.id === id ? { ...p, status: 'rejected' as const } : p
    ));
  };

  return (
    <div className="min-h-screen gradient-holographic">
      <header className="glass-card border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground">Đề xuất</h1>
              <p className="text-sm text-muted-foreground">Quản lý các đề xuất</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-4">
          {proposals.map((proposal) => (
            <Card key={proposal.id} className="glass-card p-5">
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl p-2.5 text-white shrink-0">
                  <Lightbulb className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-base font-semibold">{proposal.title}</h3>
                    <Badge className={statusConfig[proposal.status].color}>
                      {statusConfig[proposal.status].label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{proposal.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                    <span>
                      {new Date(proposal.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>

                  {/* Approval Actions */}
                  {proposal.status === 'submitted' && (
                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApprove(proposal.id)}
                        className="gap-1.5 text-green-600 hover:bg-green-50"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Phê duyệt
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(proposal.id)}
                        className="gap-1.5 text-red-600 hover:bg-red-50"
                      >
                        <X className="h-3.5 w-3.5" />
                        Từ chối
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
