'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Clock, FileText, Plus, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Directive } from '@/lib/types';

const statusConfig = {
  da_chi_dao: { label: 'Đã chỉ đạo', color: 'bg-blue-500', icon: FileText },
  da_tiep_nhan: { label: 'Đã tiếp nhận', color: 'bg-yellow-500', icon: Clock },
  da_hoan_thanh: { label: 'Đã hoàn thành', color: 'bg-green-500', icon: CheckCircle2 }
};

export default function DirectivesPage() {
  const [directives, setDirectives] = useState<Directive[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | Directive['status']>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newDirective, setNewDirective] = useState({ content: '', assignedTo: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDirectives();
  }, []);

  const fetchDirectives = async () => {
    try {
      const response = await fetch('/api/directives');
      const data = await response.json();
      setDirectives(data);
    } catch (error) {
      console.error('[v0] Error fetching directives:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDirectives = filter === 'all' 
    ? directives 
    : directives.filter(d => d.status === filter);

  const handleAddDirective = async () => {
    if (!newDirective.content.trim()) return;
    
    setSubmitting(true);
    try {
      const response = await fetch('/api/directives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newDirective.content,
          assignedTo: newDirective.assignedTo || undefined,
          status: 'da_chi_dao'
        })
      });
      
      if (response.ok) {
        await fetchDirectives();
        setNewDirective({ content: '', assignedTo: '' });
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error('[v0] Error adding directive:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: Directive['status']) => {
    try {
      const response = await fetch('/api/directives', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      
      if (response.ok) {
        await fetchDirectives();
      }
    } catch (error) {
      console.error('[v0] Error updating directive:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-holographic">
        <div className="h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-holographic">
      {/* Header */}
      <header className="glass-card border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">Chỉ đạo công việc</h1>
              <p className="text-sm text-muted-foreground">
                Quản lý và theo dõi các chỉ đạo
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Thêm chỉ đạo
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Thêm chỉ đạo mới</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="content">Nội dung chỉ đạo</Label>
                    <Textarea
                      id="content"
                      placeholder="Nhập nội dung chỉ đạo..."
                      value={newDirective.content}
                      onChange={(e) => setNewDirective({ ...newDirective, content: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assignedTo">Người thực hiện</Label>
                    <Input
                      id="assignedTo"
                      placeholder="Tên người thực hiện"
                      value={newDirective.assignedTo}
                      onChange={(e) => setNewDirective({ ...newDirective, assignedTo: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Hủy
                    </Button>
                    <Button onClick={handleAddDirective} disabled={submitting || !newDirective.content.trim()}>
                      {submitting ? 'Đang lưu...' : 'Thêm chỉ đạo'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            className="whitespace-nowrap glass-card"
          >
            Tất cả ({directives.length})
          </Button>
          {Object.entries(statusConfig).map(([key, config]) => {
            const count = directives.filter(d => d.status === key).length;
            return (
              <Button
                key={key}
                variant={filter === key ? 'default' : 'outline'}
                onClick={() => setFilter(key as Directive['status'])}
                className="whitespace-nowrap glass-card"
              >
                {config.label} ({count})
              </Button>
            );
          })}
        </div>

        {/* Directives List */}
        <div className="space-y-4">
          {filteredDirectives.length === 0 ? (
            <Card className="glass-card p-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Không có chỉ đạo nào</p>
            </Card>
          ) : (
            filteredDirectives.map((directive) => {
              const config = statusConfig[directive.status];
              const StatusIcon = config.icon;
              
              return (
                <Card key={directive.id} className="glass-card p-5 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className={`${config.color} rounded-xl p-2.5 text-white shrink-0`}>
                      <StatusIcon className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <p className="text-base font-medium text-foreground leading-relaxed">
                          {directive.content}
                        </p>
                        <Badge variant="secondary" className="whitespace-nowrap">
                          {config.label}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                        <span>
                          {new Date(directive.createdAt).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {directive.assignedTo && (
                          <>
                            <span>•</span>
                            <span>Người thực hiện: {directive.assignedTo}</span>
                          </>
                        )}
                      </div>


                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
