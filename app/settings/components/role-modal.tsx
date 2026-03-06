"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Loader2, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PERMISSION_GROUPS,
  PERMISSION_LABELS,
  type Permission,
} from "@/lib/permissions";
import { RoleDef } from "../types";

interface RoleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRole: RoleDef | null;
  onRefresh: () => Promise<void>;
  onSuccess?: (newRoleId?: number) => void;
}

export function RoleModal({
  open,
  onOpenChange,
  selectedRole,
  onRefresh,
  onSuccess,
}: RoleModalProps) {
  const [roleFormName, setRoleFormName] = useState("");
  const [roleFormPermissions, setRoleFormPermissions] = useState<Permission[]>(
    [],
  );
  const [roleError, setRoleError] = useState("");
  const [isSubmittingRole, setIsSubmittingRole] = useState(false);

  useEffect(() => {
    if (open) {
      if (selectedRole) {
        setRoleFormName(selectedRole.name);
        setRoleFormPermissions(selectedRole.permissions);
      } else {
        setRoleFormName("");
        setRoleFormPermissions([]);
      }
      setRoleError("");
    }
  }, [open, selectedRole]);

  const toggleRoleFormPermission = (perm: Permission) => {
    setRoleFormPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm],
    );
  };

  const handleSaveRole = async () => {
    if (!roleFormName.trim()) {
      setRoleError("Tên vai trò không được bỏ trống");
      return;
    }
    setIsSubmittingRole(true);
    setRoleError("");
    try {
      let response;
      if (selectedRole) {
        response = await axios.put("/api/settings/roles", {
          id: selectedRole.id,
          name: roleFormName.trim(),
          permissions: roleFormPermissions,
        });
      } else {
        response = await axios.post("/api/settings/roles", {
          name: roleFormName.trim(),
          permissions: roleFormPermissions,
        });
      }

      await onRefresh();

      if (onSuccess) {
        // If it's a new role, the API might return the new role object with ID
        const newRoleId = response.data?.id;
        onSuccess(newRoleId);
      }

      onOpenChange(false);
    } catch (err: any) {
      setRoleError(err.response?.data?.error || "Lỗi khi lưu vai trò");
    } finally {
      setIsSubmittingRole(false);
    }
  };

  const isSystemAdmin = selectedRole?.id === 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col p-2">
        <DialogHeader>
          <DialogTitle>
            {selectedRole
              ? selectedRole.id === 1
                ? "Chi tiết vai trò"
                : "Sửa vai trò"
              : "Thêm vai trò mới"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-2 py-4 space-y-4">
          {roleError && (
            <div className="p-3 rounded bg-red-50 text-red-600 text-sm border border-red-200">
              {roleError}
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="roleName" className="text-blue-800">
              Tên vai trò
            </Label>
            <Input
              id="roleName"
              value={roleFormName}
              onChange={(e) => setRoleFormName(e.target.value)}
              placeholder="VD: Chủ tịch, Nhân viên,..."
              disabled={isSystemAdmin}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-blue-800">Quyền</Label>
              {!isSystemAdmin && (
                <button
                  type="button"
                  disabled={isSubmittingRole}
                  className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50"
                  onClick={() => {
                    const allPerms = PERMISSION_GROUPS.flatMap(
                      (g) => g.permissions,
                    );
                    if (roleFormPermissions.length === allPerms.length) {
                      setRoleFormPermissions([]);
                    } else {
                      setRoleFormPermissions(allPerms);
                    }
                  }}
                >
                  {roleFormPermissions.length ===
                  PERMISSION_GROUPS.flatMap((g) => g.permissions).length
                    ? "Bỏ chọn tất cả"
                    : "Chọn tất cả"}
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
              {PERMISSION_GROUPS.map((group) => (
                <div
                  key={group.module}
                  className={`p-2 rounded-lg border shadow-sm ${
                    isSystemAdmin
                      ? "bg-slate-50/50 border-transparent opacity-80"
                      : "bg-white border-slate-100"
                  }`}
                >
                  <h3 className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1.5 border-b pb-1">
                    {group.module}
                  </h3>
                  <div className="flex flex-col gap-1">
                    {group.permissions.map((perm) => {
                      const isOn = roleFormPermissions.includes(perm);
                      return (
                        <label
                          key={perm}
                          className={`flex items-center justify-between px-2 py-1 rounded-md transition-all border ${
                            isOn
                              ? "bg-purple-50/50 border-purple-200"
                              : "bg-white border-transparent hover:bg-slate-50"
                          } ${
                            isSystemAdmin
                              ? "cursor-default pointer-events-none"
                              : "cursor-pointer"
                          }`}
                        >
                          <span
                            className={`text-[13px] select-none ${
                              isOn
                                ? "text-purple-900 font-medium"
                                : "text-slate-600"
                            }`}
                          >
                            {PERMISSION_LABELS[perm]}
                          </span>
                          <div
                            className={`w-4 h-4 rounded-sm flex items-center justify-center transition-colors ${
                              isOn
                                ? "bg-primary text-primary-foreground"
                                : "border border-slate-300 bg-white"
                            }`}
                          >
                            {isOn && <Check className="w-3 h-3" />}
                          </div>
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={isOn}
                            onChange={() => {
                              if (!isSystemAdmin) {
                                toggleRoleFormPermission(perm);
                              }
                            }}
                            disabled={isSubmittingRole || isSystemAdmin}
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          {!isSystemAdmin && (
            <Button onClick={handleSaveRole} disabled={isSubmittingRole}>
              {isSubmittingRole ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {selectedRole ? "Lưu thay đổi" : "Tạo vai trò"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
