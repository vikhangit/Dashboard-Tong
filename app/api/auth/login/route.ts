import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { signToken, COOKIE_NAME } from "@/lib/auth";

const loginSchema = z.object({
  phone: z
    .string()
    .min(1, "Vui lòng nhập số điện thoại")
    .regex(/^[0-9+\-\s()]+$/, "Số điện thoại không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    const { phone, password } = parsed.data;

    // Query user from Supabase
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("phone", phone)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: "Số điện thoại hoặc mật khẩu không đúng" },
        { status: 401 },
      );
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Số điện thoại hoặc mật khẩu không đúng" },
        { status: 401 },
      );
    }

    // Check if account is locked
    if (user.is_locked) {
      return NextResponse.json(
        { error: "Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên." },
        { status: 403 },
      );
    }

    // Create JWT token
    const token = await signToken({
      userId: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role,
    });

    // Set HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
      },
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Đã xảy ra lỗi, vui lòng thử lại" },
      { status: 500 },
    );
  }
}
