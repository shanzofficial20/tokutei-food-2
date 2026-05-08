"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createBrowserSupabase } from "@/lib/supabase-browser";

export default function CBTPage() {
  const supabase = createBrowserSupabase();

  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [chapter, setChapter] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [premium, setPremium] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const currentQuestion = questions[current];
  const answeredCount = Object.keys(answers).length;
  const progress =
    questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  useEffect(() => {
    init();
  }, []);

  async function init() {
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      window.location.href = "/login";
      return;
    }

    setSession(data.session);
    await loadQuestions(data.session.access_token);
  }

  async function loadQuestions(token, selectedChapter = "") {
    setLoading(true);
    setMessage("");
    setResult(null);
    setCurrent(0);
    setAnswers({});

    const params = new URLSearchParams();

    if (selectedChapter) {
      params.set("chapter", selectedChapter);
    }

    const res = await fetch(`/api/questions?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await res.json();

    if (!res.ok) {
      setMessage(json.error || "Gagal mengambil soal.");
      setQuestions([]);
      setLoading(false);
      return;
    }

    setPremium(json.premium || false);
    setQuestions(json.questions || []);
    setLoading(false);
  }

  function changeChapter(value) {
    setChapter(value);

    if (session) {
      loadQuestions(session.access_token, value);
    }
  }

  function selectAnswer(questionId, answer) {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  }

  function goNext() {
    setCurrent((prev) => Math.min(prev + 1, questions.length - 1));
  }

  function goPrev() {
    setCurrent((prev) => Math.max(prev - 1, 0));
  }

  function goToQuestion(index) {
    setCurrent(index);
  }

  async function submit() {
    if (!session) return;

    if (questions.length === 0) {
      setMessage("Tidak ada soal untuk disubmit.");
      return;
    }

    const unanswered = questions.length - answeredCount;

    if (unanswered > 0) {
      const ok = window.confirm(
        `Masih ada ${unanswered} soal belum dijawab. Tetap submit?`
      );

      if (!ok) return;
    }

    setSubmitting(true);
    setMessage("");

    const payload = {
      mode: chapter ? chapter : "Simulasi Random",
      answers: questions.map((q) => ({
        question_id: q.id,
        selected_answer: answers[q.id] || 0,
      })),
    };

    const res = await fetch("/api/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(payload),
    });

    const json = await res.json();

    setSubmitting(false);

    if (!res.ok) {
      setMessage(json.error || "Gagal submit jawaban.");
      return;
    }

    setResult(json);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (loading) {
    return (
      <div className="card">
        <h2>Mengambil soal CBT...</h2>
        <p className="small">Sebentar. Mesin CBT lagi nyiapin amunisi.</p>
      </div>
    );
  }

  if (result) {
    const percent = Math.round((result.score / result.total_questions) * 100);

    return (
      <div>
        <section className="card hero">
          <div className="hero-content">
            <div className="badge">Hasil CBT</div>

            <h1>{percent}%</h1>

            <p className="lead">
              Kamu menjawab benar {result.score} dari {result.total_questions} soal.
            </p>

            <div className="row">
              <button onClick={() => loadQuestions(session.access_token, chapter)}>
                Ulangi CBT
              </button>

              <Link href="/dashboard" className="secondary">
                Lihat Dashboard
              </Link>
            </div>
          </div>
        </section>

        <section className="grid">
          <div className="feature-card">
            <div className="feature-icon">✅</div>
            <h3>Benar</h3>
            <div className="price">{result.score}</div>
          </div>

          <div className="feature-card">
            <div className="feature-icon">❌</div>
            <h3>Salah</h3>
            <div className="price">
              {result.total_questions - result.score}
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Nilai</h3>
            <div className="price">{percent}%</div>
          </div>
        </section>

        <section className="card">
          <h2>Pembahasan Jawaban</h2>

          {result.details.map((d, index) => (
            <div className="feature-card" key={d.question_id}>
              <p className="small">Soal {index + 1}</p>

              <h3>{d.question}</h3>

              <p>
                <b>Jawaban kamu:</b>{" "}
                {d.selected_answer === 0 ? "Tidak dijawab" : d.selected_answer}
              </p>

              <p>
                <b>Jawaban benar:</b> {d.correct_answer}
              </p>

              <p className={d.is_correct ? "correct" : "wrong"}>
                {d.is_correct ? "Benar" : "Salah"}
              </p>

              {d.explanation && (
                <p className="small">
                  <b>Pembahasan:</b> {d.explanation}
                </p>
              )}
            </div>
          ))}
        </section>
      </div>
    );
  }

  return (
    <div>
      <section className="card hero">
        <div className="hero-content">
          <div className="badge">
            {premium ? "Premium CBT" : "Free CBT"}
          </div>

          <h1>Latihan CBT Tokutei Food 2.</h1>

          <p className="lead">
            Pilih bab, jawab soal satu per satu, lalu submit untuk melihat skor
            dan pembahasan.
          </p>

          {!premium && (
            <p className="small">
              Akun kamu masih free. Soal yang muncul hanya contoh gratis.
              Untuk membuka semua soal, upgrade ke premium.
            </p>
          )}

          <div className="row">
            {!premium && <Link href="/upgrade">Upgrade Premium</Link>}
            <Link href="/dashboard" className="secondary">
              Dashboard
            </Link>
          </div>
        </div>
      </section>

      <section className="card">
        <h2>Pengaturan Latihan</h2>

        <label>Pilih bab</label>
        <select value={chapter} onChange={(e) => changeChapter(e.target.value)}>
          <option value="">Simulasi Random</option>
          <option value="第2章 食品衛生">第2章 食品衛生</option>
          <option value="第3章 品質管理">第3章 品質管理</option>
          <option value="第4章 生産管理">第4章 生産管理</option>
          <option value="第5章 労働安全">第5章 労働安全</option>
          <option value="第6章 社会の変化と会社の方針">
            第6章 社会の変化と会社の方針
          </option>
        </select>

        <div className="grid">
          <div className="feature-card">
            <h3>Jumlah Soal</h3>
            <div className="price">{questions.length}</div>
          </div>

          <div className="feature-card">
            <h3>Sudah Dijawab</h3>
            <div className="price">{answeredCount}</div>
          </div>

          <div className="feature-card">
            <h3>Progress</h3>
            <div className="price">{progress}%</div>
          </div>
        </div>

        {message && <p className="wrong">{message}</p>}
      </section>

      {questions.length === 0 && (
        <section className="card">
          <h2>Tidak ada soal</h2>
          <p>
            Kalau akun kamu masih free, kemungkinan bab ini tidak punya soal
            gratis. Coba pilih Simulasi Random atau upgrade premium.
          </p>
          <Link href="/upgrade">Lihat Premium</Link>
        </section>
      )}

      {currentQuestion && (
        <section className="card">
          <p className="small">
            Soal {current + 1} dari {questions.length}
          </p>

          <h2>{currentQuestion.question}</h2>

          {[1, 2, 3, 4].map((n) => (
            <button
              key={n}
              className={`option ${
                answers[currentQuestion.id] === n ? "active" : ""
              }`}
              onClick={() => selectAnswer(currentQuestion.id, n)}
            >
              {n}. {currentQuestion[`option_${n}`]}
            </button>
          ))}

          <div className="row">
            <button
              className="secondary"
              disabled={current === 0}
              onClick={goPrev}
            >
              Sebelumnya
            </button>

            <button
              className="secondary"
              disabled={current === questions.length - 1}
              onClick={goNext}
            >
              Berikutnya
            </button>

            <button onClick={submit} disabled={submitting}>
              {submitting ? "Submit..." : "Submit CBT"}
            </button>
          </div>
        </section>
      )}

      {questions.length > 0 && (
        <section className="card">
          <h2>Navigasi Soal</h2>

          <div className="row">
            {questions.map((q, index) => (
              <button
                key={q.id}
                className={answers[q.id] ? "" : "secondary"}
                onClick={() => goToQuestion(index)}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <p className="small">
            Tombol gelap = sudah dijawab. Tombol abu-abu = belum dijawab.
          </p>
        </section>
      )}
    </div>
  );
}