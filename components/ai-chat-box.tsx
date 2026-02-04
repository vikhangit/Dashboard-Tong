'use client';

import React from "react"

import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, TrendingUp, FileText, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface QuickAction {
  icon: React.ElementType;
  label: string;
  prompt: string;
}

const quickActions: QuickAction[] = [
  { icon: TrendingUp, label: 'Xem ngay lý do?', prompt: 'Phân tích tình hình hoạt động hiện tại' },
  { icon: Sparkles, label: 'Vào Run AI ngay!', prompt: 'Chạy phân tích AI cho dữ liệu mới nhất' },
  { icon: FileText, label: 'Báo cáo tổng hợp', prompt: 'Tạo báo cáo tổng hợp tuần này' },
  { icon: Users, label: 'Thống kê nhân sự', prompt: 'Xem thống kê hiệu suất nhân sự' }
];

export function AIChatBox() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Chào bạn! Tôi là trợ lý AI của bạn. Tôi có thể giúp bạn phân tích dữ liệu, tạo báo cáo, và đưa ra quyết định thông minh. Bạn cần hỗ trợ gì?',
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Đã nhận được yêu cầu: "${content}". Tôi đang phân tích dữ liệu và sẽ cung cấp kết quả chi tiết cho bạn...`,
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickAction = (prompt: string) => {
    handleSend(prompt);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white'
                  : 'glass-card text-foreground'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">Trợ lý AI</span>
                </div>
              )}
              <p className="text-sm leading-relaxed">{message.content}</p>
              <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-white/70' : 'text-muted-foreground'}`}>
                {message.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="glass-card rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="flex gap-1">
                  <div className="h-2 w-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="h-2 w-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="h-2 w-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-4">
          <div className="glass-card rounded-xl p-4">
            <p className="text-sm font-medium text-foreground mb-3">Hành động nhanh</p>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="justify-start glass-card hover:bg-white/80 bg-transparent h-auto py-3"
                  onClick={() => handleQuickAction(action.prompt)}
                >
                  <action.icon className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="text-xs text-left line-clamp-2">{action.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 glass-card border-t">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Bot className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend(input)}
              placeholder="Gửi tin nhắn cho Trợ lý AI"
              className="pl-10 rounded-full glass-card border-none"
            />
          </div>
          <Button
            size="icon"
            className="rounded-full bg-gradient-to-br from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 flex-shrink-0"
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isTyping}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
