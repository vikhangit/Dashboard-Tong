import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

// ─── GET: List all users ──────────────────────────────────────────

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 1) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: users, error } = await supabase
      .from("users")
      .select("id, phone, name, role, is_locked, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 },
      );
    }

    return NextResponse.json(users);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// ─── POST: Create new user ────────────────────────────────────────

const createSchema = z.object({
  name: z.string().min(2, "Tên quá ngắn"),
  phone: z.string().min(10, "Số điện thoại không hợp lệ"),
  password: z.string().min(6, "Mật khẩu ít nhất 6 ký tự"),
  role: z.coerce.number({ required_error: "Vui lòng chọn vai trò" }),
});

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 1) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    const { name, phone, password, role } = parsed.data;

    // Check if phone already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("phone", phone)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: "Số điện thoại đã tồn tại" },
        { status: 400 },
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Insert user
    const { data: newUser, error } = await supabase
      .from("users")
      .insert([
        {
          name,
          phone,
          password_hash,
          role,
        },
      ])
      .select("id, phone, name, role, created_at")
      .single();

    if (error) {
      console.error("Error creating user:", error);
      return NextResponse.json(
        { error: "Không thể tạo người dùng" },
        { status: 500 },
      );
    }

    return NextResponse.json(newUser, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// ─── PUT: Update user ────────────────────────────────────────────

const updateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2, "Tên quá ngắn"),
  phone: z.string().min(10, "Số điện thoại không hợp lệ"),
  role: z.coerce.number({ required_error: "Vui lòng chọn vai trò" }),
  password: z
    .string()
    .min(6, "Mật khẩu ít nhất 6 ký tự")
    .optional()
    .or(z.literal("")),
});

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 1) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    const { id, name, phone, role, password } = parsed.data;

    // Check if phone exists for a DIFFERENT user
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("phone", phone)
      .neq("id", id)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: "Số điện thoại đã tồn tại ở tài khoản khác" },
        { status: 400 },
      );
    }

    const updates: Record<string, any> = { name, phone, role };

    // Update password if provided
    if (password && password.trim().length > 0) {
      const salt = await bcrypt.genSalt(10);
      updates.password_hash = await bcrypt.hash(password, salt);
    }

    const { data: updatedUser, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", id)
      .select("id, phone, name, role, created_at")
      .single();

    if (error) {
      console.error("Error updating user:", error);
      return NextResponse.json(
        { error: "Không thể cập nhật người dùng" },
        { status: 500 },
      );
    }

    return NextResponse.json(updatedUser);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// ─── PATCH: Toggle lock/unlock user ──────────────────────────────

const toggleLockSchema = z.object({
  id: z.string().uuid(),
  is_locked: z.boolean(),
});

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 1) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = toggleLockSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    const { id, is_locked } = parsed.data;

    // Prevent locking oneself
    if (id === session.userId) {
      return NextResponse.json(
        { error: "Không thể khóa tài khoản của chính mình" },
        { status: 400 },
      );
    }

    // Prevent locking admin (role=1)
    const { data: targetUser } = await supabase
      .from("users")
      .select("role")
      .eq("id", id)
      .single();

    if (targetUser?.role === 1) {
      return NextResponse.json(
        { error: "Không thể khóa tài khoản Admin" },
        { status: 400 },
      );
    }

    const { data: updatedUser, error } = await supabase
      .from("users")
      .update({ is_locked })
      .eq("id", id)
      .select("id, phone, name, role, is_locked, created_at")
      .single();

    if (error) {
      console.error("Error toggling lock:", error);
      return NextResponse.json(
        { error: "Không thể cập nhật trạng thái khóa" },
        { status: 500 },
      );
    }

    return NextResponse.json(updatedUser);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// ─── DELETE: Delete user ─────────────────────────────────────────

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 1) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Thiếu ID" }, { status: 400 });
    }

    // Prevent deleting oneself
    if (id === session.userId) {
      return NextResponse.json(
        { error: "Không thể tự xóa tài khoản của mình" },
        { status: 400 },
      );
    }

    const { error } = await supabase.from("users").delete().eq("id", id);

    if (error) {
      console.error("Error deleting user:", error);
      return NextResponse.json(
        { error: "Không thể xóa người dùng" },
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
