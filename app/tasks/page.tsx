'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Circle, Clock, CheckCircle2, AlertCircle, Plus, Play, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Task } from '@/lib/types';

const statusConfig = {
  pending: { label: 'Chờ xử lý', color: 'bg-gray-500', icon: Circle },
  in_progress: { label: 'Đang thực hiện', color: 'bg-blue-500', icon: Clock },
  completed: { label: 'Hoàn thành', color: 'bg-green-500', icon: CheckCircle2 }
};

const priorityConfig = {
  low: { label: 'Thấp', color: 'text-gray-600 bg-gray-100' },
  medium: { label: 'Trung bình', color: 'text-yellow-700 bg-yellow-100' },
  high: { label: 'Cao', color: 'text-red-700 bg-red-100' }
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | Task['status']>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', dueDate: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('[v0] Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = filter === 'all' 
    ? tasks 
    : tasks.filter(t => t.status === filter);

  const handleAddTask = async () => {
    if (!newTask.title.trim()) return;
    
    setSubmitting(true);
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTask,
          status: 'pending',
          dueDate: newTask.dueDate || undefined
        })
      });
      
      if (response.ok) {
        await fetchTasks();
        setNewTask({ title: '', description: '', priority: 'medium', dueDate: '' });
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error('[v0] Error adding task:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: Task['status']) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      
      if (response.ok) {
        await fetchTasks();
      }
    } catch (error) {
      console.error('[v0] Error updating task:', error);
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
              <h1 className="text-xl font-bold text-foreground">Công việc</h1>
              <p className="text-sm text-muted-foreground">
                Danh sách và theo dõi công việc
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Thêm công việc mới</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Tiêu đề</Label>
                    <Input
                      id="title"
                      placeholder="Nhập tiêu đề công việc..."
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Mô tả</Label>
                    <Textarea
                      id="description"
                      placeholder="Nhập mô tả công việc..."
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="priority">Độ ưu tiên</Label>
                      <Select
                        value={newTask.priority}
                        onValueChange={(value) => setNewTask({ ...newTask, priority: value as Task['priority'] })}
                      >
                        <SelectTrigger id="priority">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Thấp</SelectItem>
                          <SelectItem value="medium">Trung bình</SelectItem>
                          <SelectItem value="high">Cao</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dueDate">Hạn hoàn thành</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={newTask.dueDate}
                        onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Hủy
                    </Button>
                    <Button onClick={handleAddTask} disabled={submitting || !newTask.title.trim()}>
                      {submitting ? 'Đang lưu...' : 'Thêm công việc'}
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
            className="whitespace-nowrap"
          >
            Tất cả ({tasks.length})
          </Button>
          {Object.entries(statusConfig).map(([key, config]) => {
            const count = tasks.filter(t => t.status === key).length;
            return (
              <Button
                key={key}
                variant={filter === key ? 'default' : 'outline'}
                onClick={() => setFilter(key as Task['status'])}
                className="whitespace-nowrap"
              >
                {config.label} ({count})
              </Button>
            );
          })}
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <Card className="glass-card p-12 text-center">
              <Circle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Không có công việc nào</p>
            </Card>
          ) : (
            filteredTasks.map((task) => {
              const config = statusConfig[task.status];
              const priorityStyle = priorityConfig[task.priority];
              const StatusIcon = config.icon;
              const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
              
              return (
                <Card key={task.id} className="glass-card p-5 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className={`${config.color} rounded-xl p-2.5 text-white shrink-0`}>
                      <StatusIcon className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-foreground mb-1">
                            {task.title}
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {task.description}
                          </p>
                        </div>
                        <Badge variant="secondary" className="whitespace-nowrap">
                          {config.label}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-3 flex-wrap mb-3">
                        <Badge className={priorityStyle.color}>
                          {priorityStyle.label}
                        </Badge>
                        
                        {task.dueDate && (
                          <div className={`flex items-center gap-1.5 text-xs ${isOverdue ? 'text-red-600' : 'text-muted-foreground'}`}>
                            {isOverdue && <AlertCircle className="h-3.5 w-3.5" />}
                            <span>
                              Hạn: {new Date(task.dueDate).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2 border-t">
                        {task.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStatus(task.id, 'in_progress')}
                            className="gap-1.5"
                          >
                            <Play className="h-3.5 w-3.5" />
                            Bắt đầu thực hiện
                          </Button>
                        )}
                        {task.status === 'in_progress' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStatus(task.id, 'completed')}
                            className="gap-1.5"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Hoàn thành
                          </Button>
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
