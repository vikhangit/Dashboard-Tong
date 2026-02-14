"use client";

import { useEffect, useState } from "react";
import {
  Bot,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { formatDateTime, formatShortDateTime, cn } from "@/lib/utils";

interface NotificationItem {
  id: string;
  type: "directive" | "incident" | "proposal";
  title: string;
  message: string;
  timestamp: string;
  link: string;
  isRead: boolean;
}

interface AppHeaderProps {
  title?: string;
  backHref?: string;
}

export function AppHeader({ title, backHref }: AppHeaderProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/integrations/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.data || []);
        setUnreadCount(data.data.length);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "directive":
        return <CheckCircle2 className="size-6 text-green-500" />;
      case "incident":
        return <AlertTriangle className="size-6 text-red-500" />;
      case "proposal":
        return <Lightbulb className="size-6 text-yellow-600" />;
      default:
        return <Bell className="size-6 text-primary" />;
    }
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case "directive":
        return { text: "text-green-500", border: "border-green-500" };
      case "incident":
        return { text: "text-red-600", border: "border-red-500" };
      case "proposal":
        return { text: "text-yellow-600", border: "border-yellow-500" };
      default:
        return { text: "text-primary", border: "border-primary" };
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {backHref ? (
              <Link href={backHref}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-slate-100"
                >
                  <ArrowLeft className="h-5 w-5 text-slate-600" />
                </Button>
              </Link>
            ) : (
              <div className="relative h-8 w-8 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 p-2">
                <Bot className="h-full w-full text-white" />
                <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-cyan-400 border-2 border-white" />
              </div>
            )}

            <div>
              {title ? (
                <div className="text-lg font-bold text-foreground">{title}</div>
              ) : (
                <div className="text-base font-semibold text-primary">
                  APEC GLOBAL
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Popover open={isOpen} onOpenChange={setIsOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-9 w-9 relative"
                >
                  <Bell className="size-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-90 p-0" align="end">
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <h4 className="font-semibold">Thông báo</h4>
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="px-1 text-xs">
                      {unreadCount} mới
                    </Badge>
                  )}
                </div>
                <ScrollArea className="h-[500px]">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                      <Bell className="mb-2 h-8 w-8 opacity-20" />
                      <p className="text-lg">Không có thông báo mới</p>
                    </div>
                  ) : (
                    <div className="grid">
                      {notifications.map((item) => {
                        const styles = getTypeStyles(item.type);
                        return (
                          <Link
                            key={item.id}
                            href={item.link}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                              "flex items-start gap-3 border-b border-l-4 px-3 py-3 last:border-b-0 hover:bg-muted/50 transition-colors",
                              styles.border,
                            )}
                          >
                            <div className="mt-1">{getIcon(item.type)}</div>
                            <div className="space-y-1">
                              <p
                                className={cn(
                                  "text-lg font-medium leading-none",
                                  styles.text,
                                )}
                              >
                                {item.title}
                              </p>
                              <p className="text-base text-muted-foreground line-clamp-3">
                                {item.message}
                              </p>
                              <p className="text-base text-muted-foreground/70">
                                {formatDateTime(new Date(item.timestamp))}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </header>
  );
}
