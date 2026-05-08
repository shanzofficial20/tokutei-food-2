"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserSupabase } from "@/lib/supabase-browser";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createBrowserSupabase();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function validateInput() {
    if (!email.trim()) {
      setMessage("Email wajib diisi.");
      return false;
    }

    if (!password.trim()) {
      setMessage("Password wajib diisi.");
      return false;
    }

    if (password.length < 6) {
      setMessage("Password minimal 6 karakter.");
      return false;
    }

    return true;
  }

  async function login() {
    if (!validateInput()) return;

    setLoading(true);
    setMessage("Sedang login...");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    router.push("/dashboard");
  }

  async function register() {
    if (!validateInput()) return;

    setLoading(true);
    setMessage("Membuat akun...");

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Akun berhasil dibuat. Sekarang klik Login.");
  }

  return (
    <div>
      <section className="card hero">
        <div className="hero-content">
          <div className="badge">Login Member</div>

          <h1>Masuk ke Tokutei Food 2.</h1>

          <p className="lead">
            Login untuk mulai latihan CBT, melihat skor, dan mengakses soal
            premium jika akunmu sudah aktif.
          </p>
        </div>
      </section>

      <section className="grid">
        <div className="card">
          <h2>Login / Daftar</h2>

          <label>Email</label>
          <input
            type="email"
            value={email}
            placeholder="email@example.com"
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            placeholder="Minimal 6 karakter"
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="row">
            <button onClick={login} disabled={loading}>
              {loading ? "Loading..." : "Login"}
            </button>

            <button className="secondary" onClick={register} disabled={loading}>
              Daftar
            </button>
          </div>

          {message && <p className="small">{message}</p>}
        </div>

        <div className="feature-card">
          <div className="feature-icon">🔐</div>
          <h3>Akun Free</h3>
          <p className="small">
            Setelah daftar, kamu bisa mencoba soal gratis terlebih dahulu.
          </p>

          <ul>
            <li>Akses contoh soal</li>
            <li>Skor otomatis</li>
            <li>Bisa upgrade premium kapan saja</li>
          </ul>

          <Link href="/cbt" className="secondary">
            Coba CBT Gratis
          </Link>
        </div>

        <div className="feature-card">
          <div className="feature-icon">👑</div>
          <h3>Akun Premium</h3>
          <p className="small">
            Premium membuka semua soal latihan Tokuteiginou 2 makanan.
          </p>

          <ul>
            <li>Akses semua soal</li>
            <li>Pembahasan jawaban</li>
            <li>Riwayat skor latihan</li>
          </ul>

          <Link href="/upgrade">
            Lihat Premium
          </Link>
        </div>
      </section>

      <section className="card">
        <h2>Catatan login</h2>
        <p>
          Kalau kamu baru daftar dan belum bisa login, kemungkinan Supabase
          masih meminta konfirmasi email. Untuk development, confirm email bisa
          dimatikan dulu di Supabase.
        </p>

        <p className="small">
          Supabase → Authentication → Providers → Email → matikan Confirm email.
        </p>
      </section>
    </div>
  );
}