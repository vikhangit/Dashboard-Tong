"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Settings as SettingsIcon, Shield, Users } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";

import { RoleDef, UserDef } from "./types";
import { UsersTab } from "./components/users-tab";
import { RolesTab } from "./components/roles-tab";

export default function SettingsPage() {
  const router = useRouter();
  const { isAdmin, isLoading: authLoading } = useAuth();

  const [roles, setRoles] = useState<RoleDef[]>([]);
  const [users, setUsers] = useState<UserDef[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const [rolesRes, usersRes] = await Promise.all([
        axios.get("/api/settings/roles"),
        axios.get("/api/settings/users"),
      ]);

      setRoles(rolesRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error("Failed to fetch settings data:", err);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push("/");
      return;
    }
    if (!authLoading && isAdmin) {
      fetchData(true);
    }
  }, [authLoading, isAdmin, router, fetchData]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-holographic">
        <div className="h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen gradient-holographic pb-4">
      {/* Header */}
      <PageHeader
        title="Cài đặt"
        icon={<SettingsIcon className="w-5 h-5" />}
        backHref="/"
        className="glass-card"
      />

      <div className="container mx-auto px-4 py-3 max-w-5xl">
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="roles" className="gap-2">
              <Shield className="h-4 w-4" />
              Roles
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: USER MANAGEMENT */}
          <TabsContent value="users">
            <UsersTab users={users} roles={roles} onRefresh={fetchData} />
          </TabsContent>

          {/* TAB 2: ROLES & PERMISSIONS */}
          <TabsContent value="roles">
            <RolesTab roles={roles} users={users} onRefresh={fetchData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
