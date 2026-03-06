import { Permission } from "@/lib/permissions";

export interface RoleDef {
  id: number;
  name: string;
  permissions: Permission[];
}

export interface UserDef {
  id: string;
  phone: string;
  name: string | null;
  role: number;
  is_locked: boolean;
}
