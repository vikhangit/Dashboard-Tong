import Link from "next/link";
import { Bot, MessageSquare, LayoutGrid } from "lucide-react";

interface BottomNavProps {
  showDashboard: boolean;
  setShowDashboard: (show: boolean) => void;
}

export function BottomNav({ showDashboard, setShowDashboard }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 glass-card border-t p-3 safe-bottom z-50 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex items-center justify-around gap-2 pb-2">
        <button
          onClick={() => setShowDashboard(false)}
          className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all ${
            !showDashboard
              ? "bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg"
              : "text-muted-foreground hover:bg-white/50"
          }`}
        >
          <Bot className="h-5 w-5" />
          <span className="text-xs font-medium">Chỉ đạo</span>
        </button>

        <Link
          href="/chat"
          className="flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all text-muted-foreground hover:bg-white/50"
        >
          <MessageSquare className="h-5 w-5" />
          <span className="text-xs font-medium">AI Chat</span>
        </Link>

        <button
          onClick={() => setShowDashboard(true)}
          className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all ${
            showDashboard
              ? "bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg"
              : "text-muted-foreground hover:bg-white/50"
          }`}
        >
          <LayoutGrid className="h-5 w-5" />
          <span className="text-xs font-medium">Dashboard</span>
        </button>
      </div>
    </div>
  );
}
