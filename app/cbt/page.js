"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createBrowserSupabase } from "@/lib/supabase-browser";

const TIMER_BY_LIMIT = {
  25: 30 * 60,
  50: 60 * 60,
  100: 120 * 60,
};

export default function CBTPage() {
  const supabase = createBrowserSupabase();

  const [session, setSession] = useState(null);
  const [premium, setPremium] = useState(false);
  const [role, setRole] = useState("free");

  const [chapter, setChapter] = useState("");
  const [questionLimit, setQuestionLimit] = useState(25);

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMER_BY_LIMIT[25]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const answeredCount = Object.keys(answers).length;

  const progress =
    questions.length > 0
      ? Math.round((answeredCount / questions.length) * 100)
      : 0;

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (!started || result || submitting) return;

    if (timeLeft <= 0) {
      submit(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [started, timeLeft, result, submitting]);

  async function init() {
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      window.location.href = "/login";
      return;
    }

    setSession(data.session);
    await loadQuestions(data.session.access_token, "", 25);
  }

  async function loadQuestions(token, selectedChapter, selectedLimit) {
    setLoading(true);
    setMessage("");
    setResult(null);
    setStarted(false);
    setAnswers({});
    setTimeLeft(TIMER_BY_LIMIT[selectedLimit] || TIMER_BY_LIMIT[25]);

    const params = new URLSearchParams();

    if (selectedChapter) {
      params.set("chapter", selectedChapter);
    }

    params.set("limit", selectedLimit);

    const res = await fetch(`/api/questions?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await res.json();

    if (!res.ok) {
      setQuestions([]);
      setMessage(json.error || "Gagal mengambil soal.");
      setLoading(false);
      return;
    }

    setPremium(json.premium || false);
    setRole(json.role || "free");
    setQuestions(json.questions || []);

    if ((json.questions || []).length === 0) {
      setMessage(
        "Tidak ada soal untuk pilihan ini. Kalau akun free, coba pilih Simulasi Random atau upgrade premium."
      );
    } else if ((json.questions || []).length < selectedLimit) {
      setMessage(
        `Soal tersedia ${json.questions.length} dari ${selectedLimit}. ${
          json.premium
            ? "Soal pada bab ini belum cukup."
            : "Akun free hanya bisa akses soal gratis."
        }`
      );
    }

    setLoading(false);
  }

  function handleLimitChange(value) {
    const newLimit = Number(value);

    setQuestionLimit(newLimit);

    if (session) {
      loadQuestions(session.access_token, chapter, newLimit);
    }
  }

  function handleChapterChange(value) {
    setChapter(value);

    if (session) {
      loadQuestions(session.access_token, value, questionLimit);
    }
  }

  function startSimulation() {
    if (questions.length === 0) {
      setMessage("Tidak ada soal untuk dimulai.");
      return;
    }

    setStarted(true);
    setMessage("");
    setTimeLeft(TIMER_BY_LIMIT[questionLimit] || TIMER_BY_LIMIT[25]);
  }

  function selectAnswer(questionId, selectedAnswer) {
    if (!started) return;

    setAnswers((prev) => ({
      ...prev,
      [questionId]: selectedAnswer,
    }));
  }

  function formatTime(seconds) {
    const safeSeconds = Math.max(seconds, 0);
    const minutes = Math.floor(safeSeconds / 60);
    const secs = safeSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(
      2,
      "0"
    )}`;
  }

  async function submit(autoSubmit = false) {
    if (!session || submitting) return;

    if (questions.length === 0) {
      setMessage("Tidak ada soal untuk disubmit.");
      return;
    }

    const unanswered = questions.length - answeredCount;

    if (!autoSubmit && unanswered > 0) {
      const ok = window.confirm(
        `Masih ada ${unanswered} soal belum dijawab. Tetap submit?`
      );

      if (!ok) return;
    }

    setSubmitting(true);

    if (autoSubmit) {
      setMessage("Waktu habis. Jawaban otomatis dikirim...");
    }

    const payload = {
      mode: chapter
        ? `${chapter} - ${questions.length} soal`
        : `Simulasi Random - ${questions.length} soal`,
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
    setStarted(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (loading) {
    return (
      <div className="card">
        <h2>Mengambil soal CBT...</h2>
        <p className="small">Sebentar. Soal sedang disiapkan.</p>
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
              Kamu menjawab benar {result.score} dari{" "}
              {result.total_questions} soal.
            </p>

            <div className="row">
              <button
                onClick={() =>
                  loadQuestions(session.access_token, chapter, questionLimit)
                }
              >
                Ulangi Simulasi
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
            CBT VERSION: LIMIT TIMER 25-50-100
          </div>

          <h1>Simulasi CBT Tokutei Food 2.</h1>

          <p className="lead">
            Pilih jumlah soal, pilih bab, klik mulai, lalu kerjakan dengan timer.
          </p>

          <p className="small">
            Status akun: <b>{premium ? role : "free"}</b>
          </p>

          {!premium && (
            <p className="small">
              Akun free hanya bisa mengakses soal gratis. Upgrade premium untuk
              membuka semua soal.
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
        <h2>Pengaturan Simulasi</h2>

        <label>Jumlah soal</label>
        <select
          value={questionLimit}
          onChange={(e) => handleLimitChange(e.target.value)}
          disabled={started}
        >
          <option value={25}>25 soal — 30 menit</option>
          <option value={50}>50 soal — 60 menit</option>
          <option value={100}>100 soal — 120 menit</option>
        </select>

        <label>Bab</label>
        <select
          value={chapter}
          onChange={(e) => handleChapterChange(e.target.value)}
          disabled={started}
        >
          <option value="">Simulasi Random Semua Bab</option>
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
            <h3>Timer</h3>
            <div className="price">{formatTime(timeLeft)}</div>
          </div>
        </div>

        <div className="row">
          {!started && (
            <button onClick={startSimulation} disabled={questions.length === 0}>
              ▶ Mulai Simulasi ({questions.length} soal)
            </button>
          )}

          {started && (
            <button onClick={() => submit(false)} disabled={submitting}>
              {submitting ? "Submit..." : "Submit CBT"}
            </button>
          )}

          <button
            className="secondary"
            onClick={() =>
              loadQuestions(session.access_token, chapter, questionLimit)
            }
            disabled={started}
          >
            Acak Ulang Soal
          </button>
        </div>

        {message && <p className="wrong">{message}</p>}

        {!started && questions.length > 0 && (
          <p className="small">
            Pilihan jawaban akan aktif setelah kamu klik{" "}
            <b>Mulai Simulasi</b>.
          </p>
        )}
      </section>

      {questions.length === 0 && (
        <section className="card">
          <h2>Tidak ada soal</h2>

          <p>
            Kalau akun kamu masih free, kemungkinan bab ini tidak punya soal
            gratis. Coba pilih Simulasi Random Semua Bab atau upgrade premium.
          </p>

          <Link href="/upgrade">Lihat Premium</Link>
        </section>
      )}

      {questions.length > 0 && (
        <section className="card">
          <h2>Daftar Soal</h2>

          {questions.map((q, index) => (
            <div className="feature-card" key={q.id}>
              <p className="small">
                Soal {index + 1} dari {questions.length}
              </p>

              <h3>
                #{index + 1} {q.question}
              </h3>

              {!started && (
                <p className="small">
                  Tekan <b>Mulai Simulasi</b> dulu untuk membuka pilihan
                  jawaban.
                </p>
              )}

              {started && (
                <div>
                  {[1, 2, 3, 4].map((n) => (
                    <button
                      key={n}
                      className={`option ${answers[q.id] === n ? "active" : ""}`}
                      onClick={() => selectAnswer(q.id, n)}
                    >
                      {n}. {q[`option_${n}`]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
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
                onClick={() => {
                  const target = document.getElementById(`question-${index}`);
                  if (target) target.scrollIntoView({ behavior: "smooth" });
                }}
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