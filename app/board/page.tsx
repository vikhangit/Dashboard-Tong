'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  Users,
  FileText,
  DollarSign,
  BarChart3,
  Bell,
  Grid3X3,
  ChevronRight,
  Menu as MenuIcon,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AIChatBox } from '@/components/ai-chat-box';
import { BoardStatistics } from '@/lib/board-types';
import { calculateBoardStatistics, mockApprovals, mockDecisions } from '@/lib/board-mock-data';

export default function BoardDashboard() {
  const [statistics, setStatistics] = useState<BoardStatistics | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);

  useEffect(() => {
    setStatistics(calculateBoardStatistics());
  }, []);

  if (!statistics) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-holographic">
        <div className="h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const pendingApprovals = mockApprovals.filter(a => a.status === 'pending');
  const recentDecisions = mockDecisions.slice(0, 3);

  return (
    <div className="min-h-screen gradient-holographic">
      {/* Desktop & Mobile Header */}
      <header className="sticky top-0 z-40 glass-card border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 md:h-12 md:w-12 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 p-2">
                <Users className="h-full w-full text-white" />
              </div>
              <div>
                <h1 className="text-sm md:text-base font-bold text-foreground">Ban Giám Đốc</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Hệ thống quản lý & ra quyết định</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-full relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
              </Button>
              
              {/* Desktop Menu */}
              <Link href="/admin" className="hidden md:block">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <MenuIcon className="h-5 w-5" />
                </Button>
              </Link>
              
              {/* Mobile Grid Menu */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full md:hidden"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                {showMobileMenu ? <X className="h-5 w-5" /> : <Grid3X3 className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Desktop View */}
      <div className="hidden md:block container mx-auto px-4 py-8 max-w-7xl">
        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <Badge variant="secondary" className="bg-orange-100 text-orange-700">Cần xử lý</Badge>
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-1">{statistics.pendingApprovals}</h3>
            <p className="text-sm text-muted-foreground">Chờ phê duyệt</p>
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-700">Hôm nay</Badge>
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-1">{statistics.approvedToday}</h3>
            <p className="text-sm text-muted-foreground">Đã phê duyệt</p>
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">Tuần này</Badge>
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-1">{statistics.decisionsThisWeek}</h3>
            <p className="text-sm text-muted-foreground">Quyết định mới</p>
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
              <Badge variant="secondary" className="bg-red-100 text-red-700">Khẩn cấp</Badge>
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-1">{statistics.criticalItems}</h3>
            <p className="text-sm text-muted-foreground">Vấn đề quan trọng</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Approvals & Decisions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pending Approvals */}
            <div className="glass-card p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Chờ phê duyệt</h2>
                <Link href="/board/approvals">
                  <Button variant="ghost" size="sm" className="text-primary">
                    Xem tất cả <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
              <div className="space-y-3">
                {pendingApprovals.map((approval) => (
                  <Link key={approval.id} href={`/board/approvals/${approval.id}`}>
                    <div className="glass-card p-4 rounded-xl hover:bg-white/80 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-foreground line-clamp-1">{approval.title}</h3>
                        <Badge 
                          variant={approval.priority === 'urgent' ? 'destructive' : 'secondary'}
                          className={
                            approval.priority === 'urgent' 
                              ? 'bg-red-100 text-red-700' 
                              : approval.priority === 'high'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-blue-100 text-blue-700'
                          }
                        >
                          {approval.priority === 'urgent' ? 'Khẩn' : approval.priority === 'high' ? 'Cao' : 'TB'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{approval.description}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Từ: {approval.submittedBy}</span>
                        <span>{approval.submittedAt.toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Decisions */}
            <div className="glass-card p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Quyết định gần đây</h2>
                <Link href="/board/decisions">
                  <Button variant="ghost" size="sm" className="text-primary">
                    Xem tất cả <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
              <div className="space-y-3">
                {recentDecisions.map((decision) => (
                  <div key={decision.id} className="glass-card p-4 rounded-xl">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-foreground">{decision.title}</h3>
                      <Badge 
                        variant="secondary"
                        className={
                          decision.status === 'decided' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-blue-100 text-blue-700'
                        }
                      >
                        {decision.status === 'decided' ? 'Đã quyết định' : 'Đang xem xét'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{decision.description}</p>
                    {decision.decidedBy && (
                      <p className="text-xs text-muted-foreground">
                        Quyết định bởi: {decision.decidedBy}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Statistics & Quick Actions */}
          <div className="space-y-6">
            {/* Project Overview */}
            <div className="glass-card p-6 rounded-2xl">
              <h2 className="text-lg font-semibold text-foreground mb-4">Tổng quan dự án</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tổng số dự án</span>
                  <span className="text-lg font-semibold text-foreground">{statistics.projects.total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-600">Đúng tiến độ</span>
                  <span className="text-lg font-semibold text-green-600">{statistics.projects.onTrack}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-orange-600">Có rủi ro</span>
                  <span className="text-lg font-semibold text-orange-600">{statistics.projects.atRisk}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-red-600">Trễ hạn</span>
                  <span className="text-lg font-semibold text-red-600">{statistics.projects.delayed}</span>
                </div>
              </div>
            </div>

            {/* Financial Overview */}
            <div className="glass-card p-6 rounded-2xl">
              <h2 className="text-lg font-semibold text-foreground mb-4">Tài chính</h2>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Sử dụng ngân sách</span>
                  <span className="text-lg font-semibold text-foreground">{statistics.financial.budgetUtilization}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all"
                    style={{ width: `${statistics.financial.budgetUtilization}%` }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Chờ duyệt</span>
                  <span className="font-medium">{statistics.financial.pendingBudgets}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Đã duyệt</span>
                  <span className="font-medium">{statistics.financial.approvedBudgets}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-card p-6 rounded-2xl">
              <h2 className="text-lg font-semibold text-foreground mb-4">Hành động nhanh</h2>
              <div className="space-y-2">
                <Link href="/board/approvals">
                  <Button variant="outline" className="w-full justify-start glass-card hover:bg-white/80 bg-transparent">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Phê duyệt
                  </Button>
                </Link>
                <Link href="/board/decisions">
                  <Button variant="outline" className="w-full justify-start glass-card hover:bg-white/80 bg-transparent">
                    <FileText className="mr-2 h-4 w-4" />
                    Quyết định
                  </Button>
                </Link>
                <Link href="/board/directives">
                  <Button variant="outline" className="w-full justify-start glass-card hover:bg-white/80 bg-transparent">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Chỉ đạo
                  </Button>
                </Link>
                <Link href="/analysis">
                  <Button variant="outline" className="w-full justify-start glass-card hover:bg-white/80 bg-transparent">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Phân tích
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View - Overview Info (when menu is closed) */}
      <div className="md:hidden">
        {!showMobileMenu && !showMobileChat && (
          <div className="container mx-auto px-4 py-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="glass-card p-4 rounded-xl">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-2">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-foreground">{statistics.pendingApprovals}</p>
                <p className="text-xs text-muted-foreground">Chờ duyệt</p>
              </div>
              <div className="glass-card p-4 rounded-xl">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-2">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-foreground">{statistics.approvedToday}</p>
                <p className="text-xs text-muted-foreground">Đã duyệt</p>
              </div>
              <div className="glass-card p-4 rounded-xl">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-2">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-foreground">{statistics.decisionsThisWeek}</p>
                <p className="text-xs text-muted-foreground">Quyết định</p>
              </div>
              <div className="glass-card p-4 rounded-xl">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center mb-2">
                  <AlertCircle className="h-5 w-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-foreground">{statistics.criticalItems}</p>
                <p className="text-xs text-muted-foreground">Khẩn cấp</p>
              </div>
            </div>

            {/* General Information */}
            <div className="glass-card p-5 rounded-2xl mb-6">
              <h2 className="text-base font-semibold text-foreground mb-3">Thông tin chung</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between pb-3 border-b border-border/50">
                  <span className="text-muted-foreground">Dự án đang thực hiện</span>
                  <span className="font-medium text-foreground">{statistics.projects.onTrack + statistics.projects.atRisk}</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-border/50">
                  <span className="text-muted-foreground">Sử dụng ngân sách</span>
                  <span className="font-medium text-foreground">{statistics.financial.budgetUtilization}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Chỉ đạo đang xử lý</span>
                  <span className="font-medium text-foreground">{statistics.directives.active}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Dashboard Menu */}
        {showMobileMenu && !showMobileChat && (
          <div className="container mx-auto px-4 py-6 pb-24">
            <h2 className="text-lg font-semibold text-foreground mb-4">Quản lý & Quyết định</h2>
            <div className="grid gap-3">
              <Link href="/board/approvals" onClick={() => setShowMobileMenu(false)}>
                <div className="glass-card p-4 rounded-xl flex items-center justify-between hover:bg-white/80 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Phê duyệt</p>
                      <p className="text-xs text-muted-foreground">{statistics.pendingApprovals} chờ xử lý</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </Link>

              <Link href="/board/decisions" onClick={() => setShowMobileMenu(false)}>
                <div className="glass-card p-4 rounded-xl flex items-center justify-between hover:bg-white/80 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Quyết định</p>
                      <p className="text-xs text-muted-foreground">{statistics.decisionsThisWeek} tuần này</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </Link>

              <Link href="/board/directives" onClick={() => setShowMobileMenu(false)}>
                <div className="glass-card p-4 rounded-xl flex items-center justify-between hover:bg-white/80 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Chỉ đạo</p>
                      <p className="text-xs text-muted-foreground">{statistics.directives.active} đang hoạt động</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </Link>

              <Link href="/projects" onClick={() => setShowMobileMenu(false)}>
                <div className="glass-card p-4 rounded-xl flex items-center justify-between hover:bg-white/80 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Dự án</p>
                      <p className="text-xs text-muted-foreground">{statistics.projects.total} dự án</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </Link>

              <Link href="/analysis" onClick={() => setShowMobileMenu(false)}>
                <div className="glass-card p-4 rounded-xl flex items-center justify-between hover:bg-white/80 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Phân tích</p>
                      <p className="text-xs text-muted-foreground">Báo cáo & thống kê</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </Link>

              <Link href="/admin" onClick={() => setShowMobileMenu(false)}>
                <div className="glass-card p-4 rounded-xl flex items-center justify-between hover:bg-white/80 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center">
                      <MenuIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Cài đặt</p>
                      <p className="text-xs text-muted-foreground">Cấu hình hệ thống</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* Mobile AI Chat */}
        {showMobileChat && (
          <div className="fixed inset-0 top-[64px] bg-background z-30">
            <AIChatBox />
          </div>
        )}

        {/* Mobile Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 glass-card border-t z-50 md:hidden">
          <div className="flex items-center justify-around p-3">
            <Button
              variant="ghost"
              size="sm"
              className={`flex-1 ${!showMobileChat && !showMobileMenu ? 'text-primary' : 'text-muted-foreground'}`}
              onClick={() => {
                setShowMobileChat(false);
                setShowMobileMenu(false);
              }}
            >
              <BarChart3 className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`flex-1 ${showMobileChat ? 'text-primary' : 'text-muted-foreground'}`}
              onClick={() => {
                setShowMobileChat(!showMobileChat);
                setShowMobileMenu(false);
              }}
            >
              <Users className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`flex-1 ${showMobileMenu ? 'text-primary' : 'text-muted-foreground'}`}
              onClick={() => {
                setShowMobileMenu(!showMobileMenu);
                setShowMobileChat(false);
              }}
            >
              <Grid3X3 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
