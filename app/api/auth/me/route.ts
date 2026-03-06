import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { type Permission, ALL_PERMISSIONS } from "@/lib/permissions";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const roleId = session.role;

    // Fetch permissions from the `roles` table based on user's role ID
    let permissions: Permission[] = [];

    try {
      if (roleId === 1) {
        permissions = ALL_PERMISSIONS;
      } else {
        const { data: roleData } = await supabase
          .from("roles")
          .select("permissions")
          .eq("id", roleId)
          .single();

        if (roleData?.permissions && roleData.permissions.length > 0) {
          permissions = roleData.permissions as Permission[];
        }
      }
    } catch (err) {
      console.error("Error fetching role permissions:", err);
      // If role doesn't exist, we just let permissions be empty [] to prevent unauthorized access
    }

    return NextResponse.json({
      user: {
        id: session.userId,
        phone: session.phone,
        name: session.name,
        role: roleId,
      },
      permissions,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
