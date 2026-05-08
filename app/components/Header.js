"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createBrowserSupabase } from "@/lib/supabase-browser";

export default function Header() {
  const supabase = useMemo(() => createBrowserSupabase(), []);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [topicOpen, setTopicOpen] = useState(false);

  const loadUser = useCallback(async () => {
    try {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user?.id) {
        setProfile(null);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, is_paid, plan, premium_until")
        .eq("id", session.user.id)
        .maybeSingle();

      if (error) {
        console.error("PROFILE ERROR:", error);
        setProfile(null);
        return;
      }

      setProfile(data);
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
    }, 10000);

    return () => {
      subscription.unsubscribe();
      clearInterval(refreshInterval);
    };
  }, [loadUser, supabase]);

  const premiumUntil = profile?.premium_until
    ? new Date(profile.premium_until)
    : null;

  const isPremium =
    profile?.is_paid === true && premiumUntil && premiumUntil > new Date();

  const accountText = loading ? "Loading..." : isPremium ? "Premium" : "Free";

  const premiumDateText = premiumUntil
    ? premiumUntil.toLocaleDateString("ja-JP")
    : "-";

  return (
    <header
      style={{
        width: "100%",
        backgroundColor: "rgb(255, 255, 255)",
        borderBottom: "1px solid rgb(229, 231, 235)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "22px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "24px",
        }}
      >
        <Link
          href="/"
          className="tf-brand"
          style={{
            textDecoration: "none",
            color: "rgb(17, 24, 39)",
          }}
        >
          <div>
            <div
              className="tf-brand-title"
              style={{
                fontSize: "28px",
                fontWeight: "900",
                color: "rgb(17, 24, 39)",
                lineHeight: "1.1",
              }}
            >
              Tokutei Food 2
            </div>

            <div
              className="tf-brand-subtitle"
              style={{
                marginTop: "6px",
                fontSize: "15px",
                fontWeight: "700",
                color: "rgb(107, 114, 128)",
              }}
            >
              Latihan CBT Tokuteiginou 2 Makanan
            </div>
          </div>
        </Link>

        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <Link href="/" style={navButton}>
            Home
          </Link>

          <div style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setTopicOpen(!topicOpen)}
              style={navButton}
            >
              TOPIK
            </button>

            {topicOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "64px",
                  left: 0,
                  width: "260px",
                  padding: "12px",
                  backgroundColor: "rgb(255, 255, 255)",
                  border: "1px solid rgb(229, 231, 235)",
                  borderRadius: "18px",
                  boxShadow: "0 20px 40px rgba(15, 23, 42, 0.14)",
                  zIndex: 999,
                }}
              >
                <Link
                  href="/teori"
                  style={dropdownItem}
                  onClick={() => setTopicOpen(false)}
                >
                  Teori
                </Link>

                <Link
                  href="/flashcard"
                  style={dropdownItem}
                  onClick={() => setTopicOpen(false)}
                >
                  Flashcard
                </Link>

                <Link
                  href="/cbt"
                  style={dropdownItem}
                  onClick={() => setTopicOpen(false)}
                >
                  Latihan CBT
                </Link>

                <Link
                  href="/dashboard"
                  style={dropdownItem}
                  onClick={() => setTopicOpen(false)}
                >
                  Dashboard
                </Link>

                <Link
                  href="/upgrade"
                  style={dropdownItem}
                  onClick={() => setTopicOpen(false)}
                >
                  Upgrade Premium
                </Link>
              </div>
            )}
          </div>

          <Link href="/cbt" style={navButton}>
            CBT
          </Link>

          <Link
            href={isPremium ? "/dashboard" : "/upgrade"}
            style={{
              ...premiumBadge,
              backgroundColor: isPremium
                ? "rgb(220, 252, 231)"
                : "rgb(236, 253, 245)",
              borderColor: isPremium
                ? "rgb(134, 239, 172)"
                : "rgb(187, 247, 208)",
              color: isPremium ? "rgb(22, 101, 52)" : "rgb(21, 128, 61)",
            }}
            title={isPremium ? `Premium sampai ${premiumDateText}` : "Akun Free"}
          >
            Akun: {accountText}
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            minWidth: "64px",
            height: "64px",
            padding: "0 18px",
            borderRadius: "20px",
            border: "none",
            backgroundColor: "rgb(2, 6, 23)",
            color: "rgb(255, 255, 255)",
            fontSize: "16px",
            fontWeight: "900",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
          }}
        >
          Menu
        </button>
      </div>

      {menuOpen && (
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "0 28px 24px",
          }}
        >
          <div
            style={{
              backgroundColor: "rgb(248, 250, 252)",
              border: "1px solid rgb(229, 231, 235)",
              borderRadius: "18px",
              padding: "14px",
              display: "grid",
              gap: "10px",
            }}
          >
            <Link href="/" style={mobileItem} onClick={() => setMenuOpen(false)}>
              Home
            </Link>

            <Link
              href="/login"
              style={mobileItem}
              onClick={() => setMenuOpen(false)}
            >
              Login
            </Link>

            <Link
              href="/register"
              style={mobileItem}
              onClick={() => setMenuOpen(false)}
            >
              Daftar
            </Link>

            <Link
              href="/teori"
              style={mobileItem}
              onClick={() => setMenuOpen(false)}
            >
              Teori
            </Link>

            <Link
              href="/flashcard"
              style={mobileItem}
              onClick={() => setMenuOpen(false)}
            >
              Flashcard
            </Link>

            <Link
              href="/cbt"
              style={mobileItem}
              onClick={() => setMenuOpen(false)}
            >
              CBT
            </Link>

            <Link
              href="/dashboard"
              style={mobileItem}
              onClick={() => setMenuOpen(false)}
            >
              Dashboard
            </Link>

            <Link
              href="/upgrade"
              style={mobileItem}
              onClick={() => setMenuOpen(false)}
            >
              Upgrade Premium
            </Link>

            <Link
              href="/payment"
              style={mobileItem}
              onClick={() => setMenuOpen(false)}
            >
              Payment
            </Link>

            <Link
              href="/bank-transfer"
              style={mobileItem}
              onClick={() => setMenuOpen(false)}
            >
              Transfer Yuucho
            </Link>

            <div
              style={{
                padding: "14px 16px",
                borderRadius: "12px",
                backgroundColor: isPremium
                  ? "rgb(220, 252, 231)"
                  : "rgb(254, 243, 199)",
                color: isPremium ? "rgb(22, 101, 52)" : "rgb(146, 64, 14)",
                fontSize: "16px",
                fontWeight: "900",
              }}
            >
              Status Akun: {accountText}
              {isPremium && (
                <div
                  style={{
                    marginTop: "6px",
                    fontSize: "14px",
                    fontWeight: "800",
                  }}
                >
                  Aktif sampai: {premiumDateText}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

const navButton = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "54px",
  padding: "0 28px",
  borderRadius: "18px",
  backgroundColor: "rgb(241, 245, 249)",
  color: "rgb(17, 24, 39)",
  textDecoration: "none",
  fontSize: "18px",
  fontWeight: "900",
  border: "none",
  cursor: "pointer",
};

const premiumBadge = {
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

const dropdownItem = {
  display: "block",
  padding: "13px 14px",
  borderRadius: "12px",
  color: "rgb(17, 24, 39)",
  backgroundColor: "rgb(255, 255, 255)",
  textDecoration: "none",
  fontSize: "16px",
  fontWeight: "800",
};

const mobileItem = {
  display: "block",
  padding: "14px 16px",
  borderRadius: "12px",
  backgroundColor: "rgb(255, 255, 255)",
  color: "rgb(17, 24, 39)",
  textDecoration: "none",
  fontSize: "16px",
  fontWeight: "800",
};