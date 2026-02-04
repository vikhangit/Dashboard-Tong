'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, FolderKanban, PlayCircle, CheckCircle2, PauseCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Project } from '@/lib/types';

const statusConfig = {
  planning: { label: 'Lập kế hoạch', color: 'bg-gray-500', icon: Clock },
  active: { label: 'Đang thực hiện', color: 'bg-blue-500', icon: PlayCircle },
  completed: { label: 'Hoàn thành', color: 'bg-green-500', icon: CheckCircle2 },
  on_hold: { label: 'Tạm dừng', color: 'bg-yellow-500', icon: PauseCircle }
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | Project['status']>('all');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('[v0] Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(p => p.status === filter);

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
            <div>
              <h1 className="text-xl font-bold text-foreground">Dự án</h1>
              <p className="text-sm text-muted-foreground">
                Quản lý và theo dõi tiến độ dự án
              </p>
            </div>
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
            Tất cả ({projects.length})
          </Button>
          {Object.entries(statusConfig).map(([key, config]) => {
            const count = projects.filter(p => p.status === key).length;
            return (
              <Button
                key={key}
                variant={filter === key ? 'default' : 'outline'}
                onClick={() => setFilter(key as Project['status'])}
                className="whitespace-nowrap glass-card"
              >
                {config.label} ({count})
              </Button>
            );
          })}
        </div>

        {/* Projects List */}
        <div className="space-y-4">
          {filteredProjects.length === 0 ? (
            <Card className="glass-card p-12 text-center">
              <FolderKanban className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Không có dự án nào</p>
            </Card>
          ) : (
            filteredProjects.map((project) => {
              const config = statusConfig[project.status];
              const StatusIcon = config.icon;
              
              return (
                <Card key={project.id} className="glass-card p-5 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className={`${config.color} rounded-xl p-2.5 text-white shrink-0`}>
                      <StatusIcon className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-foreground mb-1">
                            {project.name}
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {project.description}
                          </p>
                        </div>
                        <Badge variant="secondary" className="whitespace-nowrap">
                          {config.label}
                        </Badge>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-muted-foreground">Tiến độ</span>
                          <span className="text-xs font-semibold text-foreground">{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          Bắt đầu: {new Date(project.startDate).toLocaleDateString('vi-VN')}
                        </span>
                        {project.endDate && (
                          <>
                            <span>•</span>
                            <span>
                              Kết thúc: {new Date(project.endDate).toLocaleDateString('vi-VN')}
                            </span>
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
