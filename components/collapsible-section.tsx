"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
  className = "",
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className={`mb-3 text-sm border border-border/100 rounded overflow-hidden ${className}`}
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="px-4 py-2 font-medium bg-slate-100 text-blue-700 font-bold uppercase tracking-wider flex items-center justify-between cursor-pointer hover:bg-slate-200 transition-colors"
      >
        <span>{title}</span>
        {isOpen ? (
          <ChevronUp className="size-6" />
        ) : (
          <ChevronDown className="size-6" />
        )}
      </div>

      {isOpen && (
        <div
          className="p-4 bg-white border-t animate-in slide-in-from-top-2 duration-200 cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      )}
    </div>
  );
}
