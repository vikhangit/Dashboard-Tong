'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockIncidents } from '@/lib/mock-data';
import { Incident } from '@/lib/types';

const statusConfig = {
  open: { label: 'Mở', color: 'text-red-700 bg-red-100' },
  in_progress: { label: 'Đang xử lý', color: 'text-blue-700 bg-blue-100' },
  resolved: { label: 'Đã giải quyết', color: 'text-green-700 bg-green-100' },
  closed: { label: 'Đã đóng', color: 'text-gray-700 bg-gray-100' }
};

const severityConfig = {
  low: { label: 'Thấp', color: 'text-gray-600' },
  medium: { label: 'Trung bình', color: 'text-yellow-600' },
  high: { label: 'Cao', color: 'text-orange-600' },
  critical: { label: 'Nghiêm trọng', color: 'text-red-600' }
};

export default function IncidentsPage() {
  const [incidents] = useState<Incident[]>(mockIncidents);

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
              <h1 className="text-xl font-bold text-foreground">Sự cố</h1>
              <p className="text-sm text-muted-foreground">Theo dõi và xử lý sự cố</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-4">
          {incidents.map((incident) => (
            <Card key={incident.id} className="glass-card p-5">
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-xl p-2.5 text-white shrink-0">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-base font-semibold">{incident.title}</h3>
                    <Badge className={statusConfig[incident.status].color}>
                      {statusConfig[incident.status].label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{incident.description}</p>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold ${severityConfig[incident.severity].color}`}>
                      Mức độ: {severityConfig[incident.severity].label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(incident.createdAt).toLocaleDateString('vi-VN')}
                    </span>
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
