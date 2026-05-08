"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createBrowserSupabase } from "@/lib/supabase-browser";

export default function Header() {
  const supabase = useMemo(() => createBrowserSupabase(), []);

  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [topicOpen, setTopicOpen] = useState(false);

  const loadUser = useCallback(async () => {
    try {
      setLoading(true);

      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) {
        console.error("SESSION ERROR:", sessionError);
        setSession(null);
        setProfile(null);
        return;
      }

      const currentSession = sessionData?.session || null;
      setSession(currentSession);

      if (!currentSession?.user?.id) {
        setProfile(null);
        return;
      }

      const userId = currentSession.user.id;

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, email, is_paid, plan, paid_at, payment_id")
        .eq("id", userId)
        .maybeSingle();

      if (profileError) {
        console.error("PROFILE ERROR:", profileError);
        setProfile(null);
        return;
      }

      setProfile(profileData);
    } catch (error) {
      console.error("LOAD USER ERROR:", error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    const refreshInterval = setInterval(() => {
      loadUser();
    }, 5000);

    const handleFocus = () => {
      loadUser();
    };

    const handleVisibility = () => {
      if (!document.hidden) {
        loadUser();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      subscription.unsubscribe();
      clearInterval(refreshInterval);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [loadUser, supabase]);

  const isPremium =
    profile?.is_paid === true ||
    profile?.plan === "premium" ||
    profile?.plan === "Premium";

  const accountText = loading ? "Mengecek..." : isPremium ? "Premium" : "Free";

  return (
    <header
      style={{
        width: "100%",
        backgroundColor: "white",
        borderBottom: "1px solid #e5e7eb",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "22px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "24px",
        }}
      >
        <Link
          href="/"
          style={{
            textDecoration: "none",
            color: "#111827",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "28px",
                fontWeight: "900",
                margin: 0,
                lineHeight: 1.1,
              }}
            >
              Tokutei Food 2
            </h1>
            <p
              style={{
                margin: "6px 0 0",
                color: "#6b7280",
                fontSize: "16px",
                fontWeight: "700",
              }}
            >
              Latihan CBT Tokuteiginou 2 Makanan
            </p>
          </div>
        </Link>

        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <Link href="/" style={navButtonStyle}>
            Home
          </Link>

          <div style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setTopicOpen(!topicOpen)}
              style={navButtonStyle}
            >
              TOPIK ▼
            </button>

            {topicOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "60px",
                  left: 0,
                  minWidth: "240px",
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "16px",
                  boxShadow: "0 20px 40px rgba(15, 23, 42, 0.12)",
                  padding: "10px",
                  zIndex: 100,
                }}
              >
                <Link href="/#materi" style={dropdownItemStyle}>
                  Materi
                </Link>
                <Link href="/#haccp" style={dropdownItemStyle}>
                  HACCP / 食品衛生
                </Link>
                <Link href="/#quality" style={dropdownItemStyle}>
                  品質管理
                </Link>
                <Link href="/#production" style={dropdownItemStyle}>
                  生産管理
                </Link>
                <Link href="/#safety" style={dropdownItemStyle}>
                  労働安全
                </Link>
              </div>
            )}
          </div>

          <Link href="/cbt" style={navButtonStyle}>
            CBT
          </Link>

          <Link
            href={isPremium ? "/cbt" : "/upgrade"}
            style={{
              ...accountBadgeStyle,
              backgroundColor: isPremium ? "#dcfce7" : "#ecfdf5",
              borderColor: isPremium ? "#86efac" : "#bbf7d0",
              color: isPremium ? "#166534" : "#15803d",
            }}
          >
            Akun: {accountText}
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "20px",
            border: "none",
            backgroundColor: "#020617",
            color: "white",
            fontSize: "34px",
            fontWeight: "900",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ☰
        </button>
      </div>

      {menuOpen && (
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "0 32px 22px",
          }}
        >
          <div
            style={{
              backgroundColor: "#f8fafc",
              border: "1px solid #e5e7eb",
              borderRadius: "18px",
              padding: "16px",
              display: "grid",
              gap: "10px",
            }}
          >
            <Link href="/" style={mobileMenuItemStyle}>
              Home
            </Link>
            <Link href="/upgrade" style={mobileMenuItemStyle}>
              Upgrade Premium
            </Link>
            <Link href="/payment" style={mobileMenuItemStyle}>
              Pembayaran
            </Link>
            <Link href="/cbt" style={mobileMenuItemStyle}>
              CBT
            </Link>
            <div
              style={{
                ...mobileMenuItemStyle,
                backgroundColor: isPremium ? "#dcfce7" : "#fef3c7",
                color: isPremium ? "#166534" : "#92400e",
              }}
            >
              Status Akun: {accountText}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

const navButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "54px",
  padding: "0 28px",
  borderRadius: "18px",
  backgroundColor: "#f1f5f9",
  color: "#111827",
  textDecoration: "none",
  fontSize: "18px",
  fontWeight: "900",
  border: "none",
  cursor: "pointer",
};

const accountBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "54px",
  padding: "0 28px",
  borderRadius: "18px",
  textDecoration: "none",
  fontSize: "18px",
  fontWeight: "900",
  border: "1px solid",
};

const dropdownItemStyle = {
  display: "block",
  padding: "12px 14px",
  borderRadius: "10px",
  color: "#111827",
  textDecoration: "none",
  fontSize: "15px",
  fontWeight: "700",
};

const mobileMenuItemStyle = {
  display: "block",
  padding: "14px 16px",
  borderRadius: "12px",
  backgroundColor: "white",
  color: "#111827",
  textDecoration: "none",
  fontSize: "16px",
  fontWeight: "800",
};