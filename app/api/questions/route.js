import { NextResponse } from "next/server";
import { createAdminSupabase, createAuthSupabase } from "@/lib/supabase-admin";

function shuffleArray(array) {
  const copied = [...array];

  for (let i = copied.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copied[i], copied[j]] = [copied[j], copied[i]];
  }

  return copied;
}

function isPremiumActive(profile) {
  if (!profile) return false;

  if (profile.role === "admin") return true;

  if (profile.role === "premium") {
    if (!profile.premium_until) return true;
    return new Date(profile.premium_until) > new Date();
  }

  return false;
}

export async function GET(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Belum login" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    const chapter = searchParams.get("chapter") || "";
    const requestedLimit = Number(searchParams.get("limit") || 25);

    const allowedLimits = [25, 50, 100];
    const limit = allowedLimits.includes(requestedLimit) ? requestedLimit : 25;

    const authSupabase = createAuthSupabase(token);
    const adminSupabase = createAdminSupabase();

    const { data: userData, error: userError } =
      await authSupabase.auth.getUser();

    if (userError || !userData.user) {
      return NextResponse.json(
        { error: "Session tidak valid. Login ulang." },
        { status: 401 }
      );
    }

    const { data: profile, error: profileError } = await adminSupabase
      .from("profiles")
      .select("id, email, role, premium_until")
      .eq("id", userData.user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Profile user tidak ditemukan." },
        { status: 404 }
      );
    }

    const premium = isPremiumActive(profile);

    let query = adminSupabase
      .from("questions")
      .select(
        "id, chapter, question, option_1, option_2, option_3, option_4, is_free"
      );

    if (chapter) {
      query = query.eq("chapter", chapter);
    }

    if (!premium) {
      query = query.eq("is_free", true);
    }

    const { data: allQuestions, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const shuffled = shuffleArray(allQuestions || []);
    const selectedQuestions = shuffled.slice(0, limit);

    return NextResponse.json({
      premium,
      role: profile.role,
      requested_limit: limit,
      available_questions: allQuestions?.length || 0,
      questions: selectedQuestions,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}