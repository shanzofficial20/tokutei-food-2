import { NextResponse } from "next/server";
import { createAdminSupabase, createAuthSupabase } from "@/lib/supabase-admin";

export async function POST(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Belum login" }, { status: 401 });
    }

    const body = await request.json();
    const authSupabase = createAuthSupabase(token);
    const adminSupabase = createAdminSupabase();

    const { data: userData, error: userError } = await authSupabase.auth.getUser();

    if (userError || !userData.user) {
      return NextResponse.json({ error: "Session tidak valid" }, { status: 401 });
    }

    const { data: profile } = await adminSupabase
      .from("profiles")
      .select("role")
      .eq("id", userData.user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Hanya admin yang bisa tambah soal" }, { status: 403 });
    }

    const payload = {
      chapter: body.chapter,
      question: body.question,
      option_1: body.option_1,
      option_2: body.option_2,
      option_3: body.option_3,
      option_4: body.option_4,
      correct_answer: Number(body.correct_answer),
      explanation: body.explanation,
      is_free: Boolean(body.is_free)
    };

    const { data, error } = await adminSupabase
      .from("questions")
      .insert(payload)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ question: data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
