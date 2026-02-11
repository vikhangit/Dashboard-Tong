import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronRight, type LucideIcon, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  icon: LucideIcon;
  stats: { label: string; value: number }[];
  href: string;
  iconBgColor?: string;
}

export function StatsCard({
  title,
  icon: Icon,
  stats,
  href,
  iconBgColor = "bg-primary",
}: StatsCardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);
    router.push(href);
  };

  return (
    <div onClick={handleClick}>
      <Card className="glass-card p-4 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer group relative overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-xl">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`${iconBgColor} rounded-xl p-2.5 text-white`}>
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-foreground">{title}</h3>
          </div>
        </div>

        <div className="space-y-2 -mt-3">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="flex items-center justify-between text-base"
            >
              <span className="text-muted-foreground">{stat.label}</span>
              <span className="font-semibold text-foreground">
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
