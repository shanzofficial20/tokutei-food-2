"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createBrowserSupabase } from "@/lib/supabase-browser";

export default function AdminUsersPage() {
  const supabase = createBrowserSupabase();

  const [session, setSession] = useState(null);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");

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
    await loadUsers(data.session.access_token);
  }

  async function loadUsers(token) {
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/admin/users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await res.json();

    setLoading(false);

    if (!res.ok) {
      setMessage(json.error || "Gagal mengambil data user.");
      return;
    }

    setUsers(json.users || []);
  }

  async function updateUser(userId, role, days = 30) {
    if (!session) return;

    setUpdatingId(userId);
    setMessage("Mengubah status user...");

    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        user_id: userId,
        role,
        days,
      }),
    });

    const json = await res.json();

    setUpdatingId("");

    if (!res.ok) {
      setMessage(json.error || "Gagal update user.");
      return;
    }

    setMessage(`User ${json.user.email} berhasil diubah menjadi ${json.user.role}.`);
    await loadUsers(session.access_token);
  }

  function formatPremiumDate(date) {
    if (!date) return "-";
    return new Date(date).toLocaleString();
  }

  function getStatusLabel(user) {
    if (user.role === "admin") return "Admin";

    if (user.role === "premium") {
      if (!user.premium_until) return "Premium";
      if (new Date(user.premium_until) > new Date()) return "Premium Aktif";
      return "Premium Expired";
    }

    return "Free";
  }

  if (loading) {
    return (
      <div className="card">
        <h2>Loading user...</h2>
        <p className="small">Sebentar. Data member sedang diambil.</p>
      </div>
    );
  }

  return (
    <div>
      <section className="card hero">
        <div className="hero-content">
          <div className="badge">Admin Users</div>

          <h1>Kelola akun premium.</h1>

          <p className="lead">
            Dari halaman ini kamu bisa mengubah user free menjadi premium,
            memperpanjang premium, atau memberi akses admin.
          </p>

          <div className="row">
            <Link href="/admin">Admin Panel</Link>
            <Link href="/dashboard" className="secondary">
              Dashboard
            </Link>
            <button
              className="secondary"
              onClick={() => loadUsers(session.access_token)}
            >
              Refresh User
            </button>
          </div>
        </div>
      </section>

      <section className="grid">
        <div className="feature-card">
          <div className="feature-icon">👥</div>
          <h3>Total User</h3>
          <div className="price">{users.length}</div>
        </div>

        <div className="feature-card">
          <div className="feature-icon">👑</div>
          <h3>Premium</h3>
          <div className="price">
            {users.filter((u) => u.role === "premium").length}
          </div>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🔓</div>
          <h3>Free</h3>
          <div className="price">
            {users.filter((u) => u.role === "free").length}
          </div>
        </div>
      </section>

      {message && (
        <section className="card">
          <p className="small">{message}</p>
        </section>
      )}

      <section className="card">
        <h2>Daftar User</h2>

        {users.length === 0 && (
          <p className="small">Belum ada user terdaftar.</p>
        )}

        {users.map((user) => (
          <div className="feature-card" key={user.id}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <div>
                <h3>{user.email}</h3>

                <p>
                  <b>Status:</b> {getStatusLabel(user)}
                </p>

                <p className="small">
                  <b>Premium sampai:</b> {formatPremiumDate(user.premium_until)}
                </p>

                <p className="small">
                  <b>Dibuat:</b>{" "}
                  {user.created_at
                    ? new Date(user.created_at).toLocaleString()
                    : "-"}
                </p>
              </div>

              <div className="row">
                <button
                  className="secondary"
                  disabled={updatingId === user.id}
                  onClick={() => updateUser(user.id, "free")}
                >
                  Free
                </button>

                <button
                  disabled={updatingId === user.id}
                  onClick={() => updateUser(user.id, "premium", 30)}
                >
                  Premium 30 Hari
                </button>

                <button
                  disabled={updatingId === user.id}
                  onClick={() => updateUser(user.id, "premium", 90)}
                >
                  Premium 90 Hari
                </button>

                <button
                  className="secondary"
                  disabled={updatingId === user.id}
                  onClick={() => updateUser(user.id, "admin")}
                >
                  Admin
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="card">
        <h2>Cara pakainya</h2>
        <ol>
          <li>User daftar akun di website.</li>
          <li>User bayar manual ke kamu.</li>
          <li>Kamu buka halaman ini.</li>
          <li>Cari email user.</li>
          <li>Klik Premium 30 Hari atau Premium 90 Hari.</li>
          <li>User langsung bisa akses soal premium.</li>
        </ol>
      </section>
    </div>
  );
}