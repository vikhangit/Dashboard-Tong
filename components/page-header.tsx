import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  icon?: ReactNode;
  backHref?: string;
  children?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  icon,
  backHref = "/",
  children,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full backdrop-blur-xl bg-background/80 border-b shadow-sm",
        className,
      )}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href={backHref}>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-muted/50 -ml-2"
            >
              <ArrowLeft className="size-7" />
            </Button>
          </Link>
          <div>
            <h1 className="flex items-center gap-2 text-lg font-semibold leading-tight">
              {icon}
              {title}
            </h1>
          </div>
        </div>

        {children && <div className="flex items-center gap-4">{children}</div>}
      </div>
    </header>
  );
}
