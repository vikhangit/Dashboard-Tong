"use client";

import { useState } from "react";
import axios from "axios";
import {
  Plus,
  Phone,
  Briefcase,
  Edit,
  Trash2,
  Users,
  Loader2,
  Lock,
  LockOpen,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { UserDef, RoleDef } from "../types";
import { RoleModal } from "./role-modal";

export function UsersTab({
  users,
  roles,
  onRefresh,
}: {
  users: UserDef[];
  roles: RoleDef[];
  onRefresh: () => Promise<void>;
}) {
  const { user: currentUser } = useAuth();

  // --- User Management State ---
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false);
  const [isLockUserModalOpen, setIsLockUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDef | null>(null);
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);
  const [userError, setUserError] = useState("");

  const [userFormData, setUserFormData] = useState({
    name: "",
    phone: "",
    role: "",
    password: "",
  });

  const [isQuickRoleModalOpen, setIsQuickRoleModalOpen] = useState(false);

  const openAddUserModal = () => {
    setSelectedUser(null);
    setUserFormData({
      name: "",
      phone: "",
      role: roles.length > 0 ? String(roles[0].id) : "",
      password: "",
    });
    setUserError("");
    setIsUserModalOpen(true);
  };

  const openEditUserModal = (u: UserDef) => {
    setSelectedUser(u);
    setUserFormData({
      name: u.name || "",
      phone: u.phone,
      role: String(u.role),
      password: "",
    });
    setUserError("");
    setIsUserModalOpen(true);
  };

  const openDeleteUserModal = (u: UserDef) => {
    setSelectedUser(u);
    setUserError("");
    setIsDeleteUserModalOpen(true);
  };

  const handleSaveUser = async () => {
    setIsSubmittingUser(true);
    setUserError("");

    try {
      if (selectedUser) {
        await axios.put("/api/settings/users", {
          id: selectedUser.id,
          ...userFormData,
        });
      } else {
        await axios.post("/api/settings/users", userFormData);
      }
      await onRefresh();
      setIsUserModalOpen(false);
    } catch (err: any) {
      setUserError(
        err.response?.data?.error || "Đã xảy ra lỗi khi lưu người dùng",
      );
    } finally {
      setIsSubmittingUser(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setIsSubmittingUser(true);
    setUserError("");

    try {
      await axios.delete(`/api/settings/users?id=${selectedUser.id}`);
      await onRefresh();
      setIsDeleteUserModalOpen(false);
    } catch (err: any) {
      setUserError(
        err.response?.data?.error || "Đã xảy ra lỗi khi xóa người dùng",
      );
    } finally {
      setIsSubmittingUser(false);
    }
  };

  const getRoleName = (roleId: number) => {
    const r = roles.find((role) => role.id === roleId);
    return r ? r.name : "Không xác định";
  };

  const openLockUserModal = (u: UserDef) => {
    setSelectedUser(u);
    setUserError("");
    setIsLockUserModalOpen(true);
  };

  const handleToggleLock = async () => {
    if (!selectedUser) return;
    setIsSubmittingUser(true);
    setUserError("");
    try {
      await axios.patch("/api/settings/users", {
        id: selectedUser.id,
        is_locked: !selectedUser.is_locked,
      });
      await onRefresh();
      setIsLockUserModalOpen(false);
    } catch (err: any) {
      setUserError(
        err.response?.data?.error || "Lỗi khi cập nhật trạng thái khóa",
      );
    } finally {
      setIsSubmittingUser(false);
    }
  };

  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between gap-3 mb-3">
        <h2 className="text-lg font-semibold">{users.length} users</h2>
        <Button
          onClick={openAddUserModal}
          className="gap-2 hover:bg-blue-600 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Thêm
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {users.map((u) => {
          const isSystemAdmin = u.role === 1;

          return (
            <Card
              key={u.id}
              className={`p-3 glass-card flex flex-row items-center gap-3 hover:border-primary/30 transition-colors ${u.is_locked ? "opacity-60" : ""}`}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-inner">
                  {u.name?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground line-clamp-1 flex items-center gap-2">
                    {u.name || "Chưa đặt tên"}
                    {u.id === currentUser?.id && (
                      <Badge
                        variant="outline"
                        className="text-[10px] h-4 p-2 shrink-0 bg-background/50"
                      >
                        Bạn
                      </Badge>
                    )}
                  </h3>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                    <Phone className="h-3.5 w-3.5" />
                    {u.phone}
                  </div>
                  <div className="mt-2 flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                    <Badge variant="secondary" className="text-xs font-normal">
                      {getRoleName(u.role)}
                    </Badge>
                    {u.is_locked && (
                      <Badge
                        variant="destructive"
                        className="text-[10px] h-4 px-1.5"
                      >
                        Đã khóa
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1 shrink-0 border-l border-black/5 pl-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => openEditUserModal(u)}
                  className="h-7 w-7 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                >
                  <Edit className="h-3.5 w-3.5" />
                </Button>
                {!isSystemAdmin && u.id !== currentUser?.id && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => openLockUserModal(u)}
                    className={`h-7 w-7 ${u.is_locked ? "text-green-600 hover:bg-green-50 hover:text-green-700" : "text-amber-600 hover:bg-amber-50 hover:text-amber-700"}`}
                    title={u.is_locked ? "Mở khóa" : "Khóa"}
                  >
                    {u.is_locked ? (
                      <LockOpen className="h-3.5 w-3.5" />
                    ) : (
                      <Lock className="h-3.5 w-3.5" />
                    )}
                  </Button>
                )}
                {!isSystemAdmin && u.id !== currentUser?.id && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => openDeleteUserModal(u)}
                    className="h-7 w-7 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {users.length === 0 && (
        <div className="text-center py-12 glass-card rounded-xl">
          <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">
            Chưa có người dùng nào (Lỗi hiển thị)
          </p>
        </div>
      )}

      {/* Add/Edit USER Dialog */}
      <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedUser ? "Sửa tài khoản" : "Thêm tài khoản mới"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {userError && (
              <div className="p-3 rounded bg-red-50 text-red-600 text-sm border border-red-200">
                {userError}
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="name">Họ và tên</Label>
              <Input
                id="name"
                value={userFormData.name}
                onChange={(e) =>
                  setUserFormData({ ...userFormData, name: e.target.value })
                }
                placeholder="Nhập tên..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Số điện thoại (để đăng nhập)</Label>
              <Input
                id="phone"
                value={userFormData.phone}
                onChange={(e) =>
                  setUserFormData({ ...userFormData, phone: e.target.value })
                }
                placeholder="09..."
                type="tel"
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>Vai trò hệ thống</Label>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-blue-600 hover:text-blue-800"
                  onClick={() => setIsQuickRoleModalOpen(true)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Thêm mới
                </Button>
              </div>
              <Select
                value={userFormData.role}
                onValueChange={(val: string) =>
                  setUserFormData({ ...userFormData, role: val })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={String(r.id)}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2 pt-2">
              <Label htmlFor="password">
                Mật khẩu {selectedUser && "(Bỏ trống nếu không đổi)"}
              </Label>
              <Input
                id="password"
                type="text"
                value={userFormData.password}
                onChange={(e) =>
                  setUserFormData({ ...userFormData, password: e.target.value })
                }
                placeholder={selectedUser ? "********" : "Mật khẩu..."}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUserModalOpen(false)}
              disabled={isSubmittingUser}
            >
              Hủy
            </Button>
            <Button onClick={handleSaveUser} disabled={isSubmittingUser}>
              {isSubmittingUser ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {selectedUser ? "Cập nhật" : "Tạo tài khoản"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete USER Dialog */}
      <Dialog
        open={isDeleteUserModalOpen}
        onOpenChange={setIsDeleteUserModalOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-600">Xóa tài khoản</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {userError && (
              <div className="mb-4 p-3 rounded bg-red-50 text-red-600 text-sm border border-red-200">
                {userError}
              </div>
            )}
            <p>
              Bạn có chắc chắn muốn xóa tài khoản của{" "}
              <b>{selectedUser?.name}</b> ({selectedUser?.phone}) không?
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteUserModalOpen(false)}
              disabled={isSubmittingUser}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={isSubmittingUser}
            >
              {isSubmittingUser ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Xác nhận xóa"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lock/Unlock USER Dialog */}
      <Dialog open={isLockUserModalOpen} onOpenChange={setIsLockUserModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle
              className={
                selectedUser?.is_locked ? "text-green-600" : "text-amber-600"
              }
            >
              {selectedUser?.is_locked ? "Mở khóa tài khoản" : "Khóa tài khoản"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {userError && (
              <div className="mb-4 p-3 rounded bg-red-50 text-red-600 text-sm border border-red-200">
                {userError}
              </div>
            )}
            <p>
              {selectedUser?.is_locked ? (
                <>
                  Bạn có chắc chắn muốn mở khóa tài khoản của{" "}
                  <b>{selectedUser?.name}</b>?
                </>
              ) : (
                <>
                  Bạn có chắc chắn muốn khóa tài khoản của{" "}
                  <b>{selectedUser?.name}</b>? Người dùng này sẽ không thể đăng
                  nhập.
                </>
              )}
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsLockUserModalOpen(false)}
              disabled={isSubmittingUser}
            >
              Hủy
            </Button>
            <Button
              variant={selectedUser?.is_locked ? "default" : "destructive"}
              onClick={handleToggleLock}
              disabled={isSubmittingUser}
            >
              {isSubmittingUser ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : selectedUser?.is_locked ? (
                "Xác nhận mở khóa"
              ) : (
                "Xác nhận khóa"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Quick Add ROLE Modal */}
      <RoleModal
        open={isQuickRoleModalOpen}
        onOpenChange={setIsQuickRoleModalOpen}
        selectedRole={null}
        onRefresh={onRefresh}
        onSuccess={(newRoleId) => {
          if (newRoleId) {
            setUserFormData((prev) => ({ ...prev, role: String(newRoleId) }));
          }
        }}
      />
    </div>
  );
}
