'use client';

import Link from "next/link"
import { useEffect, useState } from 'react';
import { 
  ClipboardList, 
  Briefcase, 
  FolderKanban, 
  Lightbulb, 
  AlertTriangle, 
  Calendar,
  BarChart3,
  UserPlus,
  Bell,
  Menu,
  Bot,
  Users,
  ChevronUp,
  LayoutGrid,
  MessageSquare
} from 'lucide-react';
import { VoiceRecorder } from '@/components/voice-recorder';
import { StatsCard } from '@/components/stats-card';
import { AIChatInterface } from '@/components/ai-chat-interface';
import { Button } from '@/components/ui/button';
import { Statistics } from '@/lib/types';

export default function HomePage() {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [currentView, setCurrentView] = useState<'voice' | 'chat'>('voice');
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShowDashboard(true); // Always show on desktop
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await fetch('/api/statistics');
      const data = await response.json();
      setStatistics(data);
      
      // Calculate notification count (pending tasks + new directives)
      const pendingCount = data.tasks.pending + data.directives.da_chi_dao;
      setNotificationCount(pendingCount);
    } catch (error) {
      console.error('[v0] Error fetching statistics:', error);
    }
  };

  const handleRecordingComplete = async (transcript: string, audioBlob?: Blob) => {
    try {
      const response = await fetch('/api/directives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: transcript })
      });

      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        fetchStatistics();
      }
    } catch (error) {
      console.error('[v0] Error saving directive:', error);
    }
  };

  const handleSwipeUp = () => {
    if (isMobile) {
      setShowDashboard(true);
    }
  };

  const handleSwipeDown = () => {
    if (isMobile) {
      setShowDashboard(false);
    }
  };

  if (!statistics) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-holographic">
        <div className="h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  // Mobile Minimalist View
  if (isMobile && !showDashboard) {
    return (
      <div className="min-h-screen gradient-holographic flex flex-col">
        {/* Minimal Header */}
        <header className="glass-card border-b">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 p-2">
                  <Bot className="h-full w-full text-white" />
                  <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-cyan-400 border-2 border-white" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-primary">LEVEL</div>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 relative">
                  <Bell className="h-4 w-4" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
                </Button>
                <Link href="/admin">
                  <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                    <Menu className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Category Tiles - 2 rows x 4 columns */}
        <div className="px-4 pt-3 pb-2 bg-gradient-to-br from-purple-50/80 to-blue-50/80">
          <div className="grid grid-cols-4 gap-2">
            {/* Row 1 */}
            <Link href="/directives" className="relative">
              <div className="glass-card p-3 rounded-2xl text-center hover:bg-white/80 transition-all">
                <ClipboardList className="h-5 w-5 mx-auto mb-1 text-purple-600" />
                <div className="text-xs text-foreground font-medium leading-tight">Chỉ đạo</div>
                {statistics.directives.da_chi_dao > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                    {statistics.directives.da_chi_dao > 9 ? '9+' : statistics.directives.da_chi_dao}
                  </span>
                )}
              </div>
            </Link>
            
            <Link href="/tasks" className="relative">
              <div className="glass-card p-3 rounded-2xl text-center hover:bg-white/80 transition-all">
                <Briefcase className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                <div className="text-xs text-foreground font-medium leading-tight">Công việc</div>
                {statistics.tasks.pending > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                    {statistics.tasks.pending > 9 ? '9+' : statistics.tasks.pending}
                  </span>
                )}
              </div>
            </Link>
            
            <Link href="/projects" className="relative">
              <div className="glass-card p-3 rounded-2xl text-center hover:bg-white/80 transition-all">
                <FolderKanban className="h-5 w-5 mx-auto mb-1 text-green-600" />
                <div className="text-xs text-foreground font-medium leading-tight">Dự án</div>
                {statistics.projects.planning > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                    {statistics.projects.planning > 9 ? '9+' : statistics.projects.planning}
                  </span>
                )}
              </div>
            </Link>
            
            <Link href="/proposals" className="relative">
              <div className="glass-card p-3 rounded-2xl text-center hover:bg-white/80 transition-all">
                <Lightbulb className="h-5 w-5 mx-auto mb-1 text-yellow-600" />
                <div className="text-xs text-foreground font-medium leading-tight">Đề xuất</div>
                {statistics.proposals.submitted > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                    {statistics.proposals.submitted > 9 ? '9+' : statistics.proposals.submitted}
                  </span>
                )}
              </div>
            </Link>
            
            {/* Row 2 */}
            <Link href="/incidents" className="relative">
              <div className="glass-card p-3 rounded-2xl text-center hover:bg-white/80 transition-all">
                <AlertTriangle className="h-5 w-5 mx-auto mb-1 text-red-600" />
                <div className="text-xs text-foreground font-medium leading-tight">Sự cố</div>
                {statistics.incidents.open > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                    {statistics.incidents.open > 9 ? '9+' : statistics.incidents.open}
                  </span>
                )}
              </div>
            </Link>
            
            <Link href="/plans" className="relative">
              <div className="glass-card p-3 rounded-2xl text-center hover:bg-white/80 transition-all">
                <Calendar className="h-5 w-5 mx-auto mb-1 text-teal-600" />
                <div className="text-xs text-foreground font-medium leading-tight">Kế hoạch</div>
                {statistics.plans.draft > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                    {statistics.plans.draft > 9 ? '9+' : statistics.plans.draft}
                  </span>
                )}
              </div>
            </Link>
            
            <Link href="/analysis" className="relative">
              <div className="glass-card p-3 rounded-2xl text-center hover:bg-white/80 transition-all">
                <BarChart3 className="h-5 w-5 mx-auto mb-1 text-violet-600" />
                <div className="text-xs text-foreground font-medium leading-tight">Phân tích</div>
              </div>
            </Link>
            
            <Link href="/board" className="relative">
              <div className="glass-card p-3 rounded-2xl text-center hover:bg-white/80 transition-all">
                <Users className="h-5 w-5 mx-auto mb-1 text-indigo-600" />
                <div className="text-xs text-foreground font-medium leading-tight">BGĐ</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Main Content - Switch between Voice and Chat */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {currentView === 'voice' ? (
            <div className="flex-1 flex flex-col">
              
              <div className="flex-1 flex flex-col items-center justify-center p-6">
                <h2 className="text-sm font-medium text-muted-foreground mb-8 uppercase tracking-wide text-center">
                  Chỉ đạo công việc
                </h2>
                <VoiceRecorder onRecordingComplete={handleRecordingComplete} />
                
                {showSuccess && (
                  <div className="glass-card p-4 rounded-xl mt-8 animate-in fade-in slide-in-from-bottom-4">
                    <p className="text-sm font-medium text-green-700">
                      Đã ghi nhận chỉ đạo thành công!
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <AIChatInterface />
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="glass-card border-t p-4 safe-bottom">
          <div className="flex items-center justify-around gap-2">
            <button
              onClick={() => setCurrentView('voice')}
              className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all ${
                currentView === 'voice' ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white' : 'text-muted-foreground hover:bg-white/50'
              }`}
            >
              <Bot className="h-5 w-5" />
              <span className="text-xs font-medium">Chỉ đạo</span>
            </button>
            
            <button
              onClick={() => setCurrentView('chat')}
              className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all ${
                currentView === 'chat' ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white' : 'text-muted-foreground hover:bg-white/50'
              }`}
            >
              <MessageSquare className="h-5 w-5" />
              <span className="text-xs font-medium">AI Chat</span>
            </button>
            
            <button
              onClick={handleSwipeUp}
              className="flex flex-col items-center gap-1 px-6 py-2 rounded-xl text-muted-foreground hover:bg-white/50 transition-all"
            >
              <LayoutGrid className="h-5 w-5" />
              <span className="text-xs font-medium">Dashboard</span>
            </button>
          </div>
          
          {/* Swipe Up Indicator */}
          <div className="flex flex-col items-center mt-3 opacity-50">
            <ChevronUp className="h-5 w-5 animate-bounce text-primary" />
            <p className="text-xs text-muted-foreground">Vuốt lên để xem dashboard</p>
          </div>
        </div>
      </div>
    );
  }

  // Full Dashboard View (Desktop or Mobile after swipe up)
  return (
    <div className="min-h-screen gradient-holographic pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-card border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 p-2">
                <Bot className="h-full w-full text-white" />
                <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-cyan-400 border-2 border-white" />
              </div>
              <div>
                <div className="text-xs font-semibold text-primary">LEVEL</div>
                <div className="text-xs text-muted-foreground">Quản lý công việc</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isMobile && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full"
                  onClick={handleSwipeDown}
                >
                  <ChevronUp className="h-5 w-5 rotate-180" />
                </Button>
              )}
              <Button variant="ghost" size="icon" className="rounded-full">
                <UserPlus className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full relative">
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-xs font-bold text-white flex items-center justify-center">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </Button>
              <Link href="/admin">
                <Button variant="ghost" size="icon" className="rounded-full" title="Cài đặt">
                  <Menu className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Voice Recording Section - Only on Desktop */}
        {!isMobile && (
          <div className="text-center mb-12">
            <h2 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">
              Chỉ đạo công việc
            </h2>
            <div className="flex justify-center mb-8">
              <VoiceRecorder onRecordingComplete={handleRecordingComplete} />
            </div>
            
            {showSuccess && (
              <div className="glass-card p-4 rounded-xl max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4">
                <p className="text-sm font-medium text-green-700">
                  Đã ghi nhận chỉ đạo thành công!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Statistics Grid */}
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
          <StatsCard
            title="Chỉ đạo"
            icon={ClipboardList}
            iconBgColor="bg-gradient-to-br from-purple-500 to-indigo-600"
            href="/directives"
            stats={[
              { label: 'Đã chỉ đạo', value: statistics.directives.da_chi_dao },
              { label: 'Đã tiếp nhận', value: statistics.directives.da_tiep_nhan },
              { label: 'Đã hoàn thành', value: statistics.directives.da_hoan_thanh }
            ]}
          />
          
          <StatsCard
            title="Công việc"
            icon={Briefcase}
            iconBgColor="bg-gradient-to-br from-blue-500 to-cyan-600"
            href="/tasks"
            stats={[
              { label: 'Chờ xử lý', value: statistics.tasks.pending },
              { label: 'Đang thực hiện', value: statistics.tasks.in_progress },
              { label: 'Hoàn thành', value: statistics.tasks.completed }
            ]}
          />
          
          <StatsCard
            title="Dự án"
            icon={FolderKanban}
            iconBgColor="bg-gradient-to-br from-green-500 to-emerald-600"
            href="/projects"
            stats={[
              { label: 'Lập kế hoạch', value: statistics.projects.planning },
              { label: 'Đang thực hiện', value: statistics.projects.active },
              { label: 'Hoàn thành', value: statistics.projects.completed }
            ]}
          />
          
          <StatsCard
            title="Đề xuất"
            icon={Lightbulb}
            iconBgColor="bg-gradient-to-br from-yellow-500 to-orange-600"
            href="/proposals"
            stats={[
              { label: 'Nháp', value: statistics.proposals.draft },
              { label: 'Đã gửi', value: statistics.proposals.submitted },
              { label: 'Đã duyệt', value: statistics.proposals.approved }
            ]}
          />
          
          <StatsCard
            title="Sự cố"
            icon={AlertTriangle}
            iconBgColor="bg-gradient-to-br from-red-500 to-pink-600"
            href="/incidents"
            stats={[
              { label: 'Mở', value: statistics.incidents.open },
              { label: 'Đang xử lý', value: statistics.incidents.in_progress },
              { label: 'Đã giải quyết', value: statistics.incidents.resolved }
            ]}
          />
          
          <StatsCard
            title="Kế hoạch"
            icon={Calendar}
            iconBgColor="bg-gradient-to-br from-teal-500 to-cyan-600"
            href="/plans"
            stats={[
              { label: 'Nháp', value: statistics.plans.draft },
              { label: 'Đang thực hiện', value: statistics.plans.active },
              { label: 'Hoàn thành', value: statistics.plans.completed }
            ]}
          />
          
          <StatsCard
            title="Phân tích"
            icon={BarChart3}
            iconBgColor="bg-gradient-to-br from-violet-500 to-purple-600"
            href="/analysis"
            stats={[
              { label: 'Tổng số dữ liệu', value: statistics.directives.total + statistics.tasks.total },
              { label: 'Hoàn thành', value: statistics.directives.da_hoan_thanh + statistics.tasks.completed }
            ]}
          />
        </div>

        {/* Quick Actions */}
        <div className="mt-8 glass-card p-6 rounded-2xl">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Hành động nhanh</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/board" className="w-full">
              <Button variant="outline" className="w-full justify-start glass-card hover:bg-white/80 bg-transparent">
                <Users className="mr-2 h-4 w-4" />
                Ban Giám Đốc
              </Button>
            </Link>
            <Link href="/directives" className="w-full">
              <Button variant="outline" className="w-full justify-start glass-card hover:bg-white/80 bg-transparent">
                <ClipboardList className="mr-2 h-4 w-4" />
                Xem tất cả chỉ đạo
              </Button>
            </Link>
            <Link href="/tasks" className="w-full">
              <Button variant="outline" className="w-full justify-start glass-card hover:bg-white/80 bg-transparent">
                <Briefcase className="mr-2 h-4 w-4" />
                Quản lý công việc
              </Button>
            </Link>
            <Link href="/projects" className="w-full">
              <Button variant="outline" className="w-full justify-start glass-card hover:bg-white/80 bg-transparent">
                <FolderKanban className="mr-2 h-4 w-4" />
                Quản lý dự án
              </Button>
            </Link>
          </div>
        </div>

        {/* Back to Command Button - Mobile Only */}
        {isMobile && (
          <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50">
            <Button
              onClick={handleSwipeDown}
              className="glass-card bg-gradient-to-br from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 shadow-lg px-8 py-6 rounded-full flex items-center gap-2"
            >
              <Bot className="h-5 w-5" />
              Trở về Chỉ đạo
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
