"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  Sparkles,
  ChevronLeft,
  Mic,
  Square,
  Loader2,
} from "lucide-react";
import axios from "axios";
import { useVoiceRecorder } from "@/hooks/use-voice-recorder";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

import { Message } from "@/lib/types";
import { getChatContext } from "@/lib/chat-utils";

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

  const { isRecording, isTranscribing, startRecording, stopRecording } =
    useVoiceRecorder({
      onTranscriptionComplete: (text) => {
        setInput((prev) => (prev ? `${prev} ${text}` : text));
      },
      onError: (err) => {
        console.error("Voice recording error:", err);
      },
    });

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);

    // Get context (last 10 messages)
    const context = getChatContext(updatedMessages);

    try {
      const response = await axios.post("/api/chat", {
        message: input,
        history: context,
      });

      const aiContent =
        typeof response.data === "string"
          ? response.data
          : JSON.stringify(response.data);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiContent,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Xin lỗi, đã có lỗi xảy ra khi kết nối với AI. Vui lòng thử lại sau.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
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
                    {new Date(message.timestamp).toLocaleTimeString("vi-VN", {
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
              <Button
                onClick={handleMicClick}
                disabled={isTranscribing}
                className={`transition-all duration-300 rounded-full h-10 w-10 p-0 flex items-center justify-center shrink-0 ${
                  isRecording
                    ? "bg-gradient-to-br from-red-500 to-pink-600 text-white shadow-lg scale-110 border-none"
                    : isTranscribing
                      ? "bg-gradient-to-br from-blue-400 to-cyan-500 text-white shadow-md animate-pulse border-none"
                      : "bg-gradient-to-br from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-md border-none"
                }`}
              >
                {isRecording ? (
                  <div className="flex items-end gap-1 h-4 select-none pointer-events-none">
                    <div
                      className="w-1 bg-white rounded-full animate-sound-wave"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="w-1 bg-white rounded-full animate-sound-wave"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-1 bg-white rounded-full animate-sound-wave"
                      style={{ animationDelay: "75ms" }}
                    />
                  </div>
                ) : isTranscribing ? (
                  <Loader2 className="h-4 w-4 text-white animate-spin" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </Button>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={
                  isRecording
                    ? "Đang lắng nghe..."
                    : isTranscribing
                      ? "Đang xử lý..."
                      : "Nhập tin nhắn..."
                }
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
