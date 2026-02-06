"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, Sparkles, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface QuickAction {
  icon: string;
  label: string;
  action: string;
}

const quickActions: QuickAction[] = [
  { icon: "🤔", label: "Xem ngay lý do?", action: "show_reasons" },
  { icon: "⚡", label: "Vào Run AI ngay!", action: "run_ai" },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Chào bạn! Hôm nay bạn muốn tôi hỗ trợ gì?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Tôi đã nhận được yêu cầu của bạn và đang xử lý. Vui lòng đợi trong giây lát!",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickAction = (action: string) => {
    setInput(`Thực hiện hành động: ${action}`);
  };

  return (
    <div className="h-screen overflow-hidden gradient-holographic flex flex-col">
      {/* Header */}
      <header className="glass-card border-b p-4 shrink-0">
        <div className="container mx-auto flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ChevronLeft className="size-9" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                Trợ lý AI
              </h1>
              <p className="text-xs text-muted-foreground">Đang hoạt động</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <div className="flex-1 container mx-auto flex flex-col min-h-0">
        <div className="flex flex-col h-full rounded-t-2xl rounded-b-none overflow-hidden border border-b-0">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-gradient-to-br from-purple-500 to-blue-500 text-white"
                      : "glass-card text-foreground"
                  }`}
                >
                  <p className="text-lg whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      message.role === "user"
                        ? "text-purple-100"
                        : "text-muted-foreground"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="glass-card rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <div
                      className="h-2 w-2 rounded-full bg-purple-500 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="h-2 w-2 rounded-full bg-purple-500 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="h-2 w-2 rounded-full bg-purple-500 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {/* <div className="p-4 space-y-2 bg-white/50 backdrop-blur-sm border-t border-white/20">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleQuickAction(action.action)}
                className="w-full glass-card hover:bg-white/80 transition-all rounded-xl px-4 py-3 flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{action.icon}</span>
                  <span className="text-sm font-medium text-foreground">
                    {action.label}
                  </span>
                </div>
                <Sparkles className="h-4 w-4 text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div> */}

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex items-center gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Nhập tin nhắn..."
                className="flex-1 min-h-[40px] max-h-[200px] glass-card border-purple-200 focus-visible:ring-purple-500 resize-none py-3 text-lg"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim()}
                className="bg-gradient-to-br from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
