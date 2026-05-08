import { NextResponse } from "next/server";
import { createAdminSupabase, createAuthSupabase } from "@/lib/supabase-admin";

export async function POST(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Belum login" }, { status: 401 });
    }

    const body = await request.json();
    const answers = body.answers || [];

    if (!Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json({ error: "Jawaban masih kosong" }, { status: 400 });
    }

    const authSupabase = createAuthSupabase(token);
    const adminSupabase = createAdminSupabase();

    const { data: userData, error: userError } = await authSupabase.auth.getUser();

    if (userError || !userData.user) {
      return NextResponse.json({ error: "Session tidak valid" }, { status: 401 });
    }

    const ids = answers.map((a) => a.question_id);

    const { data: questions, error: qError } = await adminSupabase
      .from("questions")
      .select("id, question, correct_answer, explanation")
      .in("id", ids);

    if (qError) {
      return NextResponse.json({ error: qError.message }, { status: 500 });
    }

    const questionMap = new Map(questions.map((q) => [q.id, q]));
    let score = 0;

    const details = answers.map((a) => {
      const q = questionMap.get(a.question_id);
      const is_correct = q?.correct_answer === a.selected_answer;
      if (is_correct) score++;

      return {
        question_id: a.question_id,
        question: q?.question,
        selected_answer: a.selected_answer,
        correct_answer: q?.correct_answer,
        explanation: q?.explanation,
        is_correct
      };
    });

    const { data: attempt, error: attemptError } = await adminSupabase
      .from("attempts")
      .insert({
        user_id: userData.user.id,
        mode: body.mode || "simulasi",
        score,
        total_questions: answers.length
      })
      .select()
      .single();

    if (attemptError) {
      return NextResponse.json({ error: attemptError.message }, { status: 500 });
    }

    const attemptAnswers = details.map((d) => ({
      attempt_id: attempt.id,
      question_id: d.question_id,
      selected_answer: d.selected_answer,
      correct_answer: d.correct_answer,
      is_correct: d.is_correct
    }));

    await adminSupabase.from("attempt_answers").insert(attemptAnswers);

    return NextResponse.json({
      attempt_id: attempt.id,
      score,
      total_questions: answers.length,
      details
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
