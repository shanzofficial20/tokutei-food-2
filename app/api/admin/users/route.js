import { NextResponse } from "next/server";
import { createAdminSupabase, createAuthSupabase } from "@/lib/supabase-admin";

async function checkAdmin(request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    return { error: "Belum login", status: 401 };
  }

  const authSupabase = createAuthSupabase(token);
  const adminSupabase = createAdminSupabase();

  const { data: userData, error: userError } = await authSupabase.auth.getUser();

  if (userError || !userData.user) {
    return { error: "Session tidak valid", status: 401 };
  }

  const { data: profile, error: profileError } = await adminSupabase
    .from("profiles")
    .select("id, role")
    .eq("id", userData.user.id)
    .single();

  if (profileError || !profile) {
    return { error: "Profile admin tidak ditemukan", status: 403 };
  }

  if (profile.role !== "admin") {
    return { error: "Hanya admin yang bisa akses halaman ini", status: 403 };
  }

  return {
    adminSupabase,
    adminUser: userData.user,
  };
}

export async function GET(request) {
  try {
    const checked = await checkAdmin(request);

    if (checked.error) {
      return NextResponse.json(
        { error: checked.error },
        { status: checked.status }
      );
    }

    const { data, error } = await checked.adminSupabase
      .from("profiles")
      .select("id, email, role, premium_until, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ users: data || [] });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const checked = await checkAdmin(request);

    if (checked.error) {
      return NextResponse.json(
        { error: checked.error },
        { status: checked.status }
      );
    }

    const body = await request.json();

    const userId = body.user_id;
    const role = body.role;
    const days = Number(body.days || 30);

    if (!userId) {
      return NextResponse.json({ error: "User ID kosong" }, { status: 400 });
    }

    if (!["free", "premium", "admin"].includes(role)) {
      return NextResponse.json(
        { error: "Role harus free, premium, atau admin" },
        { status: 400 }
      );
    }

    if (userId === checked.adminUser.id && role !== "admin") {
      return NextResponse.json(
        { error: "Kamu tidak bisa menurunkan role admin akunmu sendiri." },
        { status: 400 }
      );
    }

    let premiumUntil = null;

    if (role === "premium") {
      premiumUntil = new Date(
        Date.now() + days * 24 * 60 * 60 * 1000
      ).toISOString();
    }

    const { data, error } = await checked.adminSupabase
      .from("profiles")
      .update({
        role,
        premium_until: premiumUntil,
      })
      .eq("id", userId)
      .select("id, email, role, premium_until, created_at")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ user: data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}