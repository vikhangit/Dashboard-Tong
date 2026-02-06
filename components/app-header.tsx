import { Bot, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative h-8 w-8 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 p-2">
              <Bot className="h-full w-full text-white" />
              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-cyan-400 border-2 border-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-primary">
                APEC GLOBAL
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-8 w-8 relative"
            >
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
