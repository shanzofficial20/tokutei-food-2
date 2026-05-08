import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { questions, answers } = body;

    if (!questions || !answers) {
      return NextResponse.json(
        { error: "Data tidak lengkap." },
        { status: 400 }
      );
    }

    let benar = 0;
    let salah = 0;
    const pembahasan = [];

    questions.forEach((q) => {
      const jawabanUser = answers[q.id];
      const jawabanBenar = q.correct_answer;
      const isBenar = jawabanUser === jawabanBenar;

      if (isBenar) {
        benar++;
      } else {
        salah++;
      }

      pembahasan.push({
        id: q.id,
        soal: q.question,
        pilihan: q.options,
        jawaban_user: jawabanUser ?? null,
        jawaban_benar: jawabanBenar,
        benar: isBenar,
        penjelasan: q.explanation ?? null,
      });
    });

    const total = questions.length;
    const skor = Math.round((benar / total) * 100);

    return NextResponse.json({
      skor,
      benar,
      salah,
      total,
      pembahasan,
    });
  } catch (err) {
    console.error("Submit error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
