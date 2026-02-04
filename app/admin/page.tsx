'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Settings, Plus, Trash2, GripVertical, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardCard } from '@/lib/types';

const defaultCards: DashboardCard[] = [
  { id: '1', title: 'Chỉ đạo', icon: 'ClipboardList', type: 'directives', enabled: true, order: 1 },
  { id: '2', title: 'Công việc', icon: 'Briefcase', type: 'tasks', enabled: true, order: 2 },
  { id: '3', title: 'Dự án', icon: 'FolderKanban', type: 'projects', enabled: true, order: 3 },
  { id: '4', title: 'Đề xuất', icon: 'Lightbulb', type: 'proposals', enabled: true, order: 4 },
  { id: '5', title: 'Sự cố', icon: 'AlertTriangle', type: 'incidents', enabled: true, order: 5 },
  { id: '6', title: 'Kế hoạch', icon: 'Calendar', type: 'plans', enabled: true, order: 6 },
  { id: '7', title: 'Phân tích', icon: 'BarChart3', type: 'analysis', enabled: true, order: 7 }
];

export default function AdminPage() {
  const [cards, setCards] = useState<DashboardCard[]>(defaultCards);
  const [sheetId, setSheetId] = useState('');
  const [saved, setSaved] = useState(false);

  const toggleCard = (id: string) => {
    setCards(cards.map(card => 
      card.id === id ? { ...card, enabled: !card.enabled } : card
    ));
  };

  const updateCardTitle = (id: string, title: string) => {
    setCards(cards.map(card => 
      card.id === id ? { ...card, title } : card
    ));
  };

  const deleteCard = (id: string) => {
    setCards(cards.filter(card => card.id !== id));
  };

  const addNewCard = () => {
    const newCard: DashboardCard = {
      id: Date.now().toString(),
      title: 'Thẻ mới',
      icon: 'Circle',
      type: 'directives',
      enabled: true,
      order: cards.length + 1
    };
    setCards([...cards, newCard]);
  };

  const saveConfiguration = () => {
    // In production, save to database
    console.log('[v0] Saving configuration:', { cards, sheetId });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

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
              <h1 className="text-xl font-bold text-foreground">Cài đặt hệ thống</h1>
              <p className="text-sm text-muted-foreground">
                Quản lý cấu hình dashboard và tích hợp
              </p>
            </div>
            <Button onClick={saveConfiguration} className="gap-2">
              <Save className="h-4 w-4" />
              Lưu cài đặt
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {saved && (
          <Card className="glass-card p-4 mb-6 bg-green-50 border-green-200">
            <p className="text-sm font-medium text-green-800 text-center">
              Đã lưu cài đặt thành công!
            </p>
          </Card>
        )}

        <Tabs defaultValue="cards" className="space-y-6">
          <TabsList className="glass-card">
            <TabsTrigger value="cards">Quản lý thẻ</TabsTrigger>
            <TabsTrigger value="sheets">Google Sheets</TabsTrigger>
            <TabsTrigger value="ai">Cài đặt AI</TabsTrigger>
          </TabsList>

          {/* Cards Management */}
          <TabsContent value="cards" className="space-y-4">
            <Card className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Quản lý thẻ dashboard</h2>
                  <p className="text-sm text-muted-foreground">
                    Tùy chỉnh các thẻ hiển thị trên dashboard
                  </p>
                </div>
                <Button onClick={addNewCard} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Thêm thẻ
                </Button>
              </div>

              <div className="space-y-3">
                {cards.map((card) => (
                  <Card key={card.id} className="p-4 bg-white/50">
                    <div className="flex items-center gap-4">
                      <Button variant="ghost" size="icon" className="cursor-move">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                      </Button>

                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`title-${card.id}`} className="text-xs">Tiêu đề</Label>
                          <Input
                            id={`title-${card.id}`}
                            value={card.title}
                            onChange={(e) => updateCardTitle(card.id, e.target.value)}
                            className="h-9"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`type-${card.id}`} className="text-xs">Loại</Label>
                          <Input
                            id={`type-${card.id}`}
                            value={card.type}
                            disabled
                            className="h-9 bg-muted"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={card.enabled}
                            onCheckedChange={() => toggleCard(card.id)}
                          />
                          <Label className="text-xs text-muted-foreground">
                            {card.enabled ? 'Bật' : 'Tắt'}
                          </Label>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteCard(card.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Google Sheets Integration */}
          <TabsContent value="sheets" className="space-y-4">
            <Card className="glass-card p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-foreground mb-2">Tích hợp Google Sheets</h2>
                <p className="text-sm text-muted-foreground">
                  Kết nối với Google Sheets để đồng bộ dữ liệu
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sheet-id">ID Google Sheet</Label>
                  <Input
                    id="sheet-id"
                    placeholder="Nhập ID của Google Sheet"
                    value={sheetId}
                    onChange={(e) => setSheetId(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    ID là chuỗi ký tự trong URL: docs.google.com/spreadsheets/d/[ID]/edit
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Cấu hình ranges</Label>
                  <div className="grid gap-3">
                    {['Chỉ đạo', 'Công việc', 'Dự án', 'Đề xuất'].map((name) => (
                      <div key={name} className="flex items-center gap-3">
                        <Label className="w-32 text-sm">{name}</Label>
                        <Input placeholder={`Sheet1!A1:E100`} className="flex-1" />
                      </div>
                    ))}
                  </div>
                </div>

                <Button className="w-full sm:w-auto">
                  Kiểm tra kết nối
                </Button>
              </div>
            </Card>

            <Card className="glass-card p-6 bg-blue-50/50 border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Hướng dẫn thiết lập</h3>
              <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                <li>Tạo Google Sheet và lấy ID từ URL</li>
                <li>Chia sẻ Sheet với quyền "Editor" cho service account</li>
                <li>Nhập ID và cấu hình ranges cho từng loại dữ liệu</li>
                <li>Kiểm tra kết nối và lưu cài đặt</li>
              </ol>
            </Card>
          </TabsContent>

          {/* AI Configuration */}
          <TabsContent value="ai" className="space-y-4">
            <Card className="glass-card p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-foreground mb-2">Cài đặt AI</h2>
                <p className="text-sm text-muted-foreground">
                  Cấu hình tính năng phân tích và tự động hóa AI
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-foreground mb-1">Phân tích giọng nói</h3>
                    <p className="text-sm text-muted-foreground">
                      Tự động chuyển đổi giọng nói thành văn bản
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-foreground mb-1">Phân loại tự động</h3>
                    <p className="text-sm text-muted-foreground">
                      AI tự động phân loại và gán thẻ cho công việc
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-foreground mb-1">Đề xuất thông minh</h3>
                    <p className="text-sm text-muted-foreground">
                      Gợi ý ưu tiên công việc dựa trên dữ liệu lịch sử
                    </p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-foreground mb-1">Báo cáo tự động</h3>
                    <p className="text-sm text-muted-foreground">
                      Tạo báo cáo tổng hợp hàng tuần/tháng
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
