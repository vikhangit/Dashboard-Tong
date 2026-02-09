"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReloadButtonProps {
  onReload: () => Promise<void>;
  className?: string;
}

export function ReloadButton({ onReload, className }: ReloadButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleReload = async () => {
    setIsRefreshing(true);
    try {
      await onReload();
    } catch (error) {
      console.error("Reload failed", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        "rounded-full border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 shadow-sm transition-all",
        className,
      )}
      onClick={handleReload}
      disabled={isRefreshing}
    >
      <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
    </Button>
  );
}
