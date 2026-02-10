"use client";

import { useState } from "react";
import { CheckCheck, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

interface MarkAsReadButtonProps {
  id: string;
  endpoint: string;
  onSuccess: () => Promise<void> | void;
  className?: string;
}

export function MarkAsReadButton({
  id,
  endpoint,
  onSuccess,
  className,
}: MarkAsReadButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleMarkAsSeen = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) return;

    setIsLoading(true);
    try {
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          seen: true,
        }),
      });

      if (res.ok) {
        await onSuccess();
      } else {
        console.error("Failed to mark as seen");
      }
    } catch (err) {
      console.error("Error marking as seen:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      size="sm"
      className="h-7 px-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-md animate-bounce z-10 border-0"
      title="Đánh dấu đã xem"
      onClick={handleMarkAsSeen}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <CheckCheck className="h-3.5 w-3.5" />
      )}
    </Button>
  );
}
