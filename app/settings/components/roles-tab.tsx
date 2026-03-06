"use client";

import { useState } from "react";
import axios from "axios";
import {
  Plus,
  Shield,
  Briefcase,
  Trash2,
  Check,
  Save,
  Loader2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { RoleDef, UserDef } from "../types";
import { RoleModal } from "./role-modal";

export function RolesTab({
  roles,
  users,
  onRefresh,
}: {
  roles: RoleDef[];
  users: UserDef[];
  onRefresh: () => Promise<void>;
}) {
  const [selectedRole, setSelectedRole] = useState<RoleDef | null>(null);
  const [roleError, setRoleError] = useState("");
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isDeleteRoleModalOpen, setIsDeleteRoleModalOpen] = useState(false);
  const [isSubmittingRole, setIsSubmittingRole] = useState(false);

  const openEditRoleModal = (role: RoleDef) => {
    setSelectedRole(role);
    setRoleError("");
    setIsRoleModalOpen(true);
  };

  const openAddRoleModal = () => {
    setSelectedRole(null);
    setRoleError("");
    setIsRoleModalOpen(true);
  };

  const openDeleteRoleModal = (role: RoleDef) => {
    setSelectedRole(role);
    setRoleError("");
    setIsDeleteRoleModalOpen(true);
  };

  const handleDeleteRole = async () => {
    if (!selectedRole) return;
    setIsSubmittingRole(true);
    setRoleError("");
    try {
      await axios.delete(`/api/settings/roles?id=${selectedRole.id}`);
      await onRefresh();
      setIsDeleteRoleModalOpen(false);
    } catch (err: any) {
      setRoleError(err.response?.data?.error || "Lỗi khi xóa vai trò");
    } finally {
      setIsSubmittingRole(false);
    }
  };

  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between gap-3 mb-3">
        <h2 className="text-lg font-semibold">{roles.length} roles</h2>
        <Button
          onClick={openAddRoleModal}
          className="gap-2 hover:bg-blue-600 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Thêm
        </Button>
      </div>

      <div className="space-y-3">
        {roles.map((role) => {
          const isSystemAdmin = role.id === 1; // Assuming 1 is Admin

          return (
            <Card
              key={role.id}
              className={`glass-card overflow-hidden transition-colors py-0 ${
                isSystemAdmin ? "border-primary/20" : ""
              }`}
            >
              {/* Role Header */}
              <div
                className={`px-3 py-2.5 border-none flex items-center justify-between flex-wrap gap-2 cursor-pointer transition-colors bg-white`}
                onClick={() => openEditRoleModal(role)}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold shadow-sm ${
                      isSystemAdmin
                        ? "bg-gradient-to-br from-red-400 to-red-600"
                        : "bg-gradient-to-br from-indigo-400 to-indigo-600"
                    }`}
                  >
                    {isSystemAdmin ? (
                      <Shield className="w-4 h-4" />
                    ) : (
                      <Briefcase className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-base text-foreground leading-none">
                        {role.name}
                      </span>
                      {isSystemAdmin && (
                        <Badge
                          variant="default"
                          className="text-[10px] h-4 px-1.5 pb-0.5 bg-red-100 text-red-700 hover:bg-red-200 border-red-200"
                        >
                          System
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1 leading-none">
                      <Check className="w-3 h-3 text-green-500" />
                      <b>
                        {users.filter((u) => u.role === role.id).length}
                      </b>{" "}
                      user
                    </p>
                  </div>
                </div>

                <div
                  className="flex gap-1.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  {!isSystemAdmin && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openDeleteRoleModal(role)}
                      className="h-7 px-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      Xóa
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}

        {roles.length === 0 && (
          <div className="text-center py-12 glass-card rounded-xl">
            <Shield className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">
              Đang tải danh sách vai trò...
            </p>
          </div>
        )}
      </div>

      {/* Role Modal (Reusable) */}
      <RoleModal
        open={isRoleModalOpen}
        onOpenChange={setIsRoleModalOpen}
        selectedRole={selectedRole}
        onRefresh={onRefresh}
      />

      {/* Delete ROLE Dialog */}
      <Dialog
        open={isDeleteRoleModalOpen}
        onOpenChange={setIsDeleteRoleModalOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-600">Xóa vai trò</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {roleError && (
              <div className="mb-4 p-3 rounded bg-red-50 text-red-600 text-sm border border-red-200">
                {roleError}
              </div>
            )}
            <p>
              Bạn có chắc chắn muốn xóa vai trò <b>{selectedRole?.name}</b>{" "}
              không?
            </p>
            <p className="text-sm text-red-500 mt-2 font-medium">
              Lưu ý: Bạn không thể xóa vai trò nếu đang có tài khoản sử dụng vai
              trò này.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteRoleModalOpen(false)}
              disabled={isSubmittingRole}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteRole}
              disabled={isSubmittingRole}
            >
              {isSubmittingRole ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Xác nhận xóa"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
