"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ExpandableTextProps {
  text: string;
  className?: string;
  maxLines?: number;
}

export function ExpandableText({
  text,
  className,
  maxLines = 3,
}: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const checkOverflow = () => {
      const element = textRef.current;
      if (element) {
        if (!isExpanded) {
          setIsOverflowing(element.scrollHeight > element.clientHeight);
        }
      }
    };

    // Check immediately and on window resize
    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [text, isExpanded]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="flex flex-col items-start">
      <p
        ref={textRef}
        onClick={() => (isOverflowing || isExpanded) && toggleExpand()}
        className={cn(
          "text-base text-muted-foreground whitespace-pre-wrap transition-all",
          !isExpanded && "line-clamp-3", // Default line-clamp
          (isOverflowing || isExpanded) && "cursor-pointer",
          className,
        )}
        style={
          !isExpanded
            ? {
                display: "-webkit-box",
                WebkitLineClamp: maxLines,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }
            : undefined
        }
      >
        {text}
      </p>

      {(isOverflowing || isExpanded) && (
        <Button
          variant="link"
          size="sm"
          onClick={toggleExpand}
          className="p-0 h-auto mt-1 text-xs text-blue-600 font-medium hover:no-underline"
        >
          {isExpanded ? "Thu gọn" : "Xem thêm"}
        </Button>
      )}
    </div>
  );
}
