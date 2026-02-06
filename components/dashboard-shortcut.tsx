import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardShortcutProps {
  href: string;
  icon: LucideIcon;
  label: string;
  iconColor?: string;
  count?: number;
  className?: string;
}

export function DashboardShortcut({
  href,
  icon: Icon,
  label,
  iconColor,
  count,
  className,
}: DashboardShortcutProps) {
  return (
    <Link href={href} className="relative">
      <div
        className={cn(
          "bg-white border-b-3 border-slate-200 p-2 rounded-2xl text-center hover:bg-white/80 transition-all",
          className,
        )}
      >
        <Icon className={cn("h-5 w-5 mx-auto mb-1", iconColor)} />
        <div className="text-base text-foreground font-medium leading-tight">
          {label}
        </div>
        {count !== undefined && count > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
            {count}
          </span>
        )}
      </div>
    </Link>
  );
}
