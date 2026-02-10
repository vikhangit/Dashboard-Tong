import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StatusConfigItem {
  label: string;
  color: string;
  textColor?: string;
  icon?: any;
}

interface StatusFilterProps {
  filter: string;
  onFilterChange: (value: string) => void;
  config: Record<string, StatusConfigItem>;
  counts?: Record<string, number>;
  totalCount?: number;
  className?: string;
}

export function StatusFilter({
  filter,
  onFilterChange,
  config,
  counts = {},
  totalCount,
  className,
}: StatusFilterProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <Button
        variant={filter === "all" ? "default" : "outline"}
        onClick={() => onFilterChange("all")}
        className="rounded-full"
        size="sm"
      >
        Tất cả
        {typeof totalCount === "number" && (
          <span
            className={cn(
              "ml-1",
              filter === "all" ? "text-white/80" : "opacity-70",
            )}
          >
            ({totalCount})
          </span>
        )}
      </Button>
      {Object.entries(config).map(([key, item]) => {
        const count = counts[key] || 0;
        const isActive = filter === key;

        return (
          <Button
            key={key}
            variant="outline"
            onClick={() => onFilterChange(key)}
            className={cn(
              "rounded-full border transition-colors",
              isActive
                ? `${item.color} text-white hover:opacity-90 border-transparent shadow-sm`
                : `${item.textColor || ""} border-current/20 bg-background hover:bg-accent hover:text-accent-foreground`,
            )}
            size="sm"
          >
            {item.label}
            <span
              className={cn("ml-1", isActive ? "text-white/80" : "opacity-70")}
            >
              ({count})
            </span>
          </Button>
        );
      })}
    </div>
  );
}
