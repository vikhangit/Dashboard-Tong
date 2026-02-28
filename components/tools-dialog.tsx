import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tool } from "@/lib/types"; // Verify ApiResponse export
import { Loader2 } from "lucide-react";
import { useCachedFetch } from "@/hooks/use-cached-fetch";

interface ToolsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ToolsDialog({ open, onOpenChange }: ToolsDialogProps) {
  const { data, isLoading } = useCachedFetch<{ rows: Tool[] }>(
    "tools-cache",
    "/api/tools",
    { rows: [] },
  );

  const tools = data?.rows || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            Công cụ & Tiện ích
          </DialogTitle>
        </DialogHeader>
        {isLoading && tools.length === 0 ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 py-4 max-h-[60vh] overflow-y-auto">
            {tools.map((tool) => (
              <a
                key={tool.id} // use tool.id from sheet service
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-4 rounded-xl transition-all hover:scale-105 active:scale-95 bg-slate-50 border border-transparent hover:border-slate-200"
              >
                {tool.logo ? (
                  <img
                    src={tool.logo}
                    alt={tool.name}
                    className="h-8 w-8 mb-2 object-contain"
                  />
                ) : (
                  <div className="h-8 w-8 mb-2 bg-slate-200 rounded-full" />
                )}
                <div className="font-semibold text-foreground text-center">
                  {tool.name}
                </div>
              </a>
            ))}
            {tools.length === 0 && !isLoading && (
              <div className="col-span-2 text-center text-muted-foreground">
                Không có công cụ nào.
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
