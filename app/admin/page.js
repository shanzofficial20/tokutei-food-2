"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createBrowserSupabase } from "@/lib/supabase-browser";

const initialForm = {
  chapter: "第2章 食品衛生",
  question: "",
  option_1: "",
  option_2: "",
  option_3: "",
  option_4: "",
  correct_answer: 1,
  explanation: "",
  is_free: false,
};

export default function AdminPage() {
  const supabase = createBrowserSupabase();

  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

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

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.session.user.id)
      .single();

    setProfile(profileData);
  }

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validateForm() {
    if (!form.chapter.trim()) {
      setMessage("Bab wajib dipilih.");
      return false;
    }

    if (!form.question.trim()) {
      setMessage("Pertanyaan wajib diisi.");
      return false;
    }

    if (!form.option_1.trim()) {
      setMessage("Option 1 wajib diisi.");
      return false;
    }

    if (!form.option_2.trim()) {
      setMessage("Option 2 wajib diisi.");
      return false;
    }

    if (!form.option_3.trim()) {
      setMessage("Option 3 wajib diisi.");
      return false;
    }

    if (!form.option_4.trim()) {
      setMessage("Option 4 wajib diisi.");
      return false;
    }

    if (![1, 2, 3, 4].includes(Number(form.correct_answer))) {
      setMessage("Jawaban benar harus 1, 2, 3, atau 4.");
      return false;
    }

    return true;
  }

  async function submitQuestion() {
    if (!session) return;
    if (!validateForm()) return;

    setSaving(true);
    setMessage("Menyimpan soal...");

    const res = await fetch("/api/admin/questions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(form),
    });

    const json = await res.json();

    setSaving(false);

    if (!res.ok) {
      setMessage(json.error || "Gagal simpan soal.");
      return;
    }

    setMessage("Soal berhasil ditambahkan.");
    setForm(initialForm);
  }

  function fillExample() {
    setForm({
      chapter: "第3章 品質管理",
      question: "QCDの組み合わせとして正しいものはどれですか。",
      option_1: "Quantity・Clean・Danger",
      option_2: "Quality・Cleaning・Design",
      option_3: "Quality・Cost・Delivery",
      option_4: "Question・Cost・Data",
      correct_answer: 3,
      explanation: "QCDはQuality・Cost・Deliveryのことです。",
      is_free: true,
    });
    setMessage("Contoh soal dimasukkan. Edit dulu kalau perlu, lalu simpan.");
  }

  function clearForm() {
    setForm(initialForm);
    setMessage("");
  }

  if (!profile) {
    return (
      <div className="card">
        <h2>Loading admin panel...</h2>
        <p className="small">Sebentar. Sistem sedang cek role akun kamu.</p>
      </div>
    );
  }

  if (profile.role !== "admin") {
    return (
      <div className="card">
        <h1>Akses ditolak</h1>
        <p>Halaman ini hanya untuk admin.</p>

        <div className="row">
          <Link href="/dashboard">Kembali ke Dashboard</Link>
          <Link href="/cbt" className="secondary">
            Latihan CBT
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <section className="card hero">
        <div className="hero-content">
          <div className="badge">Admin Panel</div>

          <h1>Kelola soal Tokutei Food 2.</h1>

          <p className="lead">
            Gunakan halaman ini untuk menambah soal baru, memperbaiki soal, atau
            membuat contoh soal gratis. Untuk import ratusan soal, tetap gunakan
            SQL/CSV di Supabase.
          </p>

        <div className="row">
  <Link href="/dashboard">Dashboard</Link>

  <Link href="/cbt" className="secondary">
    Test CBT
  </Link>

  <Link href="/admin/users" className="secondary">
    Kelola User
  </Link>

  <button className="secondary" onClick={fillExample}>
    Isi Contoh Soal
  </button>
</div>
        </div>
      </section>

      <section className="grid">
        <div className="feature-card">
          <div className="feature-icon">👑</div>
          <h3>Role</h3>
          <div className="price">Admin</div>
          <p className="small">{profile.email}</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🔐</div>
          <h3>Mode Soal</h3>
          <p className="small">
            Centang free kalau ingin soal bisa dicoba user gratis.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🧠</div>
          <h3>Catatan</h3>
          <p className="small">
            Jawaban benar harus angka 1 sampai 4. Jangan pakai A/B/C/D di
            database.
          </p>
        </div>
      </section>

      <section className="card">
        <h2>Tambah Soal Baru</h2>

        <label>Bab</label>
        <select
          value={form.chapter}
          onChange={(e) => update("chapter", e.target.value)}
        >
          <option value="第2章 食品衛生">第2章 食品衛生</option>
          <option value="第3章 品質管理">第3章 品質管理</option>
          <option value="第4章 生産管理">第4章 生産管理</option>
          <option value="第5章 労働安全">第5章 労働安全</option>
          <option value="第6章 社会の変化と会社の方針">
            第6章 社会の変化と会社の方針
          </option>
          <option value="模擬試験">模擬試験</option>
        </select>

        <label>Pertanyaan</label>
        <textarea
          value={form.question}
          placeholder="例：食品衛生の目的として最も適切なものはどれですか。"
          onChange={(e) => update("question", e.target.value)}
        />

        <div className="grid">
          <div>
            <label>Option 1</label>
            <textarea
              value={form.option_1}
              placeholder="Pilihan 1"
              onChange={(e) => update("option_1", e.target.value)}
            />
          </div>

          <div>
            <label>Option 2</label>
            <textarea
              value={form.option_2}
              placeholder="Pilihan 2"
              onChange={(e) => update("option_2", e.target.value)}
            />
          </div>

          <div>
            <label>Option 3</label>
            <textarea
              value={form.option_3}
              placeholder="Pilihan 3"
              onChange={(e) => update("option_3", e.target.value)}
            />
          </div>

          <div>
            <label>Option 4</label>
            <textarea
              value={form.option_4}
              placeholder="Pilihan 4"
              onChange={(e) => update("option_4", e.target.value)}
            />
          </div>
        </div>

        <label>Jawaban benar</label>
        <select
          value={form.correct_answer}
          onChange={(e) => update("correct_answer", Number(e.target.value))}
        >
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
        </select>

        <label>Pembahasan</label>
        <textarea
          value={form.explanation}
          placeholder="Tulis pembahasan singkat. Contoh: QCDはQuality・Cost・Deliveryのことです。"
          onChange={(e) => update("explanation", e.target.value)}
        />

        <label>
          <input
            type="checkbox"
            checked={form.is_free}
            onChange={(e) => update("is_free", e.target.checked)}
            style={{ width: "auto", marginRight: 8 }}
          />
          Jadikan soal gratis/free sample
        </label>

        <div className="row">
          <button onClick={submitQuestion} disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan Soal"}
          </button>

          <button className="secondary" onClick={clearForm} disabled={saving}>
            Kosongkan Form
          </button>
        </div>

        {message && <p className="small">{message}</p>}
      </section>

      <section className="card">
        <h2>Format yang benar</h2>

        <p className="small">
          Database memakai pilihan angka 1, 2, 3, 4. Kalau sumber soal kamu
          pakai A/B/C/D, ubah dulu:
        </p>

        <div className="grid">
          <div className="feature-card">
            <h3>A</h3>
            <p className="small">Masuk sebagai jawaban 1</p>
          </div>

          <div className="feature-card">
            <h3>B</h3>
            <p className="small">Masuk sebagai jawaban 2</p>
          </div>

          <div className="feature-card">
            <h3>C</h3>
            <p className="small">Masuk sebagai jawaban 3</p>
          </div>

          <div className="feature-card">
            <h3>D</h3>
            <p className="small">Masuk sebagai jawaban 4</p>
          </div>
        </div>
      </section>
    </div>
  );
}