'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { mockDirectInputs } from '@/lib/board-mock-data';

export default function BoardDirectivesPage() {
  const [directive, setDirective] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!directive.trim()) return;

    console.log('[v0] Submitting directive:', directive);
    setShowSuccess(true);
    setDirective('');
    
    setTimeout(() => setShowSuccess(false), 3000);
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
              <h1 className="text-lg font-bold text-foreground">Chỉ đạo trực tiếp</h1>
              <p className="text-xs text-muted-foreground">Gửi chỉ đạo và theo dõi tiến độ</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-3xl">
        {showSuccess && (
          <div className="glass-card p-4 rounded-xl mb-6 bg-green-50 border-green-200 animate-in fade-in slide-in-from-top">
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Đã gửi chỉ đạo thành công!</p>
                <p className="text-sm text-green-700">Nội dung đã được ghi nhận và gửi tới các bộ phận liên quan</p>
              </div>
            </div>
          </div>
        )}

        {/* Input Directive */}
        <div className="glass-card p-6 rounded-2xl mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Send className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Chỉ đạo mới</h2>
              <p className="text-xs text-muted-foreground">Nhập nội dung chỉ đạo của bạn</p>
            </div>
          </div>

          <Textarea
            value={directive}
            onChange={(e) => setDirective(e.target.value)}
            placeholder="Nhập nội dung chỉ đạo... (VD: Hoàn thành báo cáo tài chính Q1 trước ngày 31/01)"
            className="min-h-[150px] glass-card mb-4"
          />

          <div className="flex gap-3">
            <Button
              onClick={handleSubmit}
              disabled={!directive.trim()}
              className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              <Send className="h-4 w-4 mr-2" />
              Gửi chỉ đạo
            </Button>
            <Button
              variant="outline"
              className="bg-transparent"
              onClick={() => setDirective('')}
            >
              Xóa
            </Button>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-900 leading-relaxed">
              <strong>Gợi ý:</strong> Chỉ đạo của bạn sẽ được phân tích bởi AI và tự động phân loại, gán cho các bộ phận phù hợp. Dữ liệu cũng được đồng bộ với Google Sheets và CMS.
            </p>
          </div>
        </div>

        {/* Recent Directives */}
        <div className="glass-card p-6 rounded-2xl">
          <h2 className="text-lg font-semibold text-foreground mb-4">Chỉ đạo gần đây</h2>
          
          <div className="space-y-3">
            {mockDirectInputs
              .filter(d => d.type === 'directive')
              .map((item) => (
                <div key={item.id} className="glass-card p-4 rounded-xl">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm text-foreground flex-1 leading-relaxed">{item.content}</p>
                    <Badge 
                      variant="secondary"
                      className={
                        item.status === 'processed' 
                          ? 'bg-green-100 text-green-700' 
                          : item.status === 'submitted'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }
                    >
                      {item.status === 'processed' ? 'Đã xử lý' : item.status === 'submitted' ? 'Đã gửi' : 'Nháp'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Bởi: {item.createdBy}</span>
                    <span>{item.createdAt.toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* AI Analysis Info */}
        <div className="glass-card p-6 rounded-2xl mt-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <h3 className="font-semibold text-foreground">Phân tích AI</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            Hệ thống AI sẽ tự động phân tích nội dung chỉ đạo và thực hiện các hành động sau:
          </p>
          <ul className="text-sm text-foreground space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-purple-500">•</span>
              <span>Phân loại theo lĩnh vực và mức độ ưu tiên</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500">•</span>
              <span>Gán cho bộ phận và người phụ trách phù hợp</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500">•</span>
              <span>Đồng bộ dữ liệu với CMS và Google Sheets</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500">•</span>
              <span>Tạo thông báo và nhắc nhở tự động</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
