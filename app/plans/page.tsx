'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockPlans } from '@/lib/mock-data';
import { Plan } from '@/lib/types';

const statusConfig = {
  draft: { label: 'Nháp', color: 'text-gray-700 bg-gray-100' },
  active: { label: 'Đang thực hiện', color: 'text-blue-700 bg-blue-100' },
  completed: { label: 'Hoàn thành', color: 'text-green-700 bg-green-100' }
};

export default function PlansPage() {
  const [plans] = useState<Plan[]>(mockPlans);

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
              <h1 className="text-xl font-bold text-foreground">Kế hoạch</h1>
              <p className="text-sm text-muted-foreground">Quản lý kế hoạch công việc</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-4">
          {plans.map((plan) => (
            <Card key={plan.id} className="glass-card p-5">
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl p-2.5 text-white shrink-0">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-base font-semibold">{plan.title}</h3>
                    <Badge className={statusConfig[plan.status].color}>
                      {statusConfig[plan.status].label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{plan.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Bắt đầu: {new Date(plan.startDate).toLocaleDateString('vi-VN')}</span>
                    {plan.endDate && (
                      <>
                        <span>•</span>
                        <span>Kết thúc: {new Date(plan.endDate).toLocaleDateString('vi-VN')}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
