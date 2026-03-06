import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { ALL_PERMISSIONS } from "@/lib/permissions";

// ─── GET: Fetch all roles ─────────────────────────────────────────

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 1) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: roles, error } = await supabase
      .from("roles")
      .select("id, name, permissions, created_at")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching roles:", error);
      return NextResponse.json(
        { error: "Failed to fetch roles" },
        { status: 500 },
      );
    }

    return NextResponse.json(roles);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// ─── POST: Create a new role ──────────────────────────────────────

const createRoleSchema = z.object({
  name: z.string().min(2, "Tên vai trò tối thiểu 2 ký tự"),
  permissions: z
    .array(z.enum(ALL_PERMISSIONS as [string, ...string[]]))
    .default([]),
});

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 1) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = createRoleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    const { name, permissions } = parsed.data;

    if (name.toLowerCase() === "admin") {
      return NextResponse.json(
        { error: "Tên vai trò bị cấm" },
        { status: 400 },
      );
    }

    // Check duplicate name
    const { data: existing } = await supabase
      .from("roles")
      .select("id")
      .ilike("name", name)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Tên vai trò này đã tồn tại" },
        { status: 400 },
      );
    }

    const { data: newRole, error } = await supabase
      .from("roles")
      .insert([{ name, permissions }])
      .select()
      .single();

    if (error) {
      console.error("Error creating role:", error);
      return NextResponse.json(
        { error: "Không thể tạo vai trò" },
        { status: 500 },
      );
    }

    return NextResponse.json(newRole, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// ─── PUT: Update an existing role ─────────────────────────────────

const updateRoleSchema = z.object({
  id: z.number(),
  name: z.string().min(2, "Tên vai trò tối thiểu 2 ký tự").optional(),
  permissions: z.array(z.enum(ALL_PERMISSIONS as [string, ...string[]])),
});

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 1) {
      // Assuming Role 1 is Admin
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = updateRoleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    const { id, name, permissions } = parsed.data;
    // Also protect "admin" role from having permissions demoted randomly, or we can just block edit on admin.
    const { data: existingRole } = await supabase
      .from("roles")
      .select("name")
      .eq("id", id)
      .single();

    if (!existingRole) {
      return NextResponse.json(
        { error: "Không tìm thấy vai trò" },
        { status: 404 },
      );
    }

    if (existingRole.name.toLowerCase() === "admin") {
      return NextResponse.json(
        { error: "Không thể tự chỉnh sửa quyền hạn của Admin" },
        { status: 400 },
      );
    }

    // Check for duplicate name if name is being updated
    if (name) {
      if (name.toLowerCase() === "admin") {
        return NextResponse.json(
          { error: "Tên vai trò bị cấm" },
          { status: 400 },
        );
      }

      const { data: duplicateRole } = await supabase
        .from("roles")
        .select("id")
        .ilike("name", name)
        .neq("id", id)
        .single();

      if (duplicateRole) {
        return NextResponse.json(
          { error: "Tên vai trò này đã tồn tại" },
          { status: 400 },
        );
      }
    }

    const updateData: Record<string, unknown> = { permissions };
    if (name) updateData.name = name;

    const { data: updatedRole, error } = await supabase
      .from("roles")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating role:", error);
      return NextResponse.json(
        { error: "Không thể cập nhật vai trò" },
        { status: 500 },
      );
    }

    return NextResponse.json(updatedRole);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// ─── DELETE: Delete a role ────────────────────────────────────────

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 1) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get("id");

    if (!idParam || isNaN(parseInt(idParam))) {
      return NextResponse.json(
        { error: "Thiếu hoặc sai định dạng ID" },
        { status: 400 },
      );
    }

    const id = parseInt(idParam);

    const { data: role } = await supabase
      .from("roles")
      .select("name")
      .eq("id", id)
      .single();

    if (!role) {
      return NextResponse.json(
        { error: "Vai trò không tồn tại" },
        { status: 404 },
      );
    }

    if (role.name.toLowerCase() === "admin") {
      return NextResponse.json(
        { error: "Hệ thống không cho phép xóa vai trò Admin!" },
        { status: 400 },
      );
    }

    // Check if any user is currently assigned this role
    const { count, error: countError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", id);

    if (countError) {
      console.error("Error checking users for role:", countError);
      return NextResponse.json(
        { error: "Lỗi hệ thống khi kiểm tra người dùng" },
        { status: 500 },
      );
    }

    if (count && count > 0) {
      return NextResponse.json(
        {
          error: `Đang có ${count} người dùng sử dụng vai trò này. Vui lòng chuyển vai trò cho họ trước khi xóa.`,
        },
        { status: 400 },
      );
    }

    const { error } = await supabase.from("roles").delete().eq("id", id);

    if (error) {
      console.error("Error deleting role:", error);
      return NextResponse.json(
        { error: "Không thể xóa vai trò" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
