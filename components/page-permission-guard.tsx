"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Permission } from "@/lib/permissions";

interface PagePermissionGuardProps {
  permission: Permission;
  children: React.ReactNode;
}

export function PagePermissionGuard({
  permission,
  children,
}: PagePermissionGuardProps) {
  const router = useRouter();
  const { hasPermission, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-holographic">
        <div className="h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!hasPermission(permission)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gradient-holographic gap-4">
        <div className="flex flex-col items-center gap-3 glass-card p-8 rounded-2xl shadow-lg">
          <ShieldX className="h-16 w-16 text-red-400" />
          <h2 className="text-xl font-semibold text-foreground">
            Không có quyền truy cập
          </h2>
          <p className="text-muted-foreground text-center max-w-xs">
            Bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị
            viên.
          </p>
          <Button
            onClick={() => router.push("/")}
            className="mt-2 rounded-full"
          >
            Về trang chủ
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
