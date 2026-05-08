"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createBrowserSupabase } from "@/lib/supabase-browser";

function getSelectedPlan() {
  if (typeof window === "undefined") {
    return {
      plan: "premium_1_month",
      amount: 980,
      label: "Premium 1 Bulan",
    };
  }

  const params = new URLSearchParams(window.location.search);
  const plan = params.get("plan") || "premium_1_month";

  if (plan === "premium_3_months") {
    return {
      plan: "premium_3_months",
      amount: 2500,
      label: "Premium 3 Bulan",
    };
  }

  return {
    plan: "premium_1_month",
    amount: 980,
    label: "Premium 1 Bulan",
  };
}

export default function PaymentPage() {
  const supabase = createBrowserSupabase();

  const payjpRef = useRef(null);
  const cardElementRef = useRef(null);

  const [selectedPlan, setSelectedPlan] = useState({
    plan: "premium_1_month",
    amount: 980,
    label: "Premium 1 Bulan",
  });

  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setSelectedPlan(getSelectedPlan());
  }, []);

  useEffect(() => {
    const existingScript = document.querySelector(
      'script[src="https://js.pay.jp/v2/pay.js"]'
    );

    function setupPayjp() {
      const publicKey = process.env.NEXT_PUBLIC_PAYJP_PUBLIC_KEY;

      if (!publicKey) {
        setMessage("NEXT_PUBLIC_PAYJP_PUBLIC_KEY belum ada di .env.local");
        return;
      }

      if (!window.Payjp) {
        setMessage("PAY.JP belum siap. Refresh halaman dulu.");
        return;
      }

      const payjp = window.Payjp(publicKey);
      const elements = payjp.elements();

      const cardElement = elements.create("card");
      cardElement.mount("#card-element");

      payjpRef.current = payjp;
      cardElementRef.current = cardElement;

      setReady(true);
    }

    if (existingScript) {
      setupPayjp();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.pay.jp/v2/pay.js";
    script.async = true;

    script.onload = setupPayjp;

    script.onerror = () => {
      setMessage("Gagal memuat script PAY.JP");
    };

    document.body.appendChild(script);

    return () => {
      if (cardElementRef.current) {
        cardElementRef.current.unmount();
      }
    };
  }, []);

  async function handlePayment(e) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const currentPlan = getSelectedPlan();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setMessage("Kamu harus login dulu sebelum bayar.");
        setLoading(false);
        return;
      }

      if (!payjpRef.current || !cardElementRef.current) {
        setMessage("PAY.JP belum siap. Refresh halaman dulu.");
        setLoading(false);
        return;
      }

      const result = await payjpRef.current.createToken(cardElementRef.current);

      if (result.error) {
        setMessage(result.error.message || "Data kartu salah.");
        setLoading(false);
        return;
      }

      const token = result.id;

      const response = await fetch("/api/pay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: token,
          userId: user.id,
          email: user.email,
          plan: currentPlan.plan,
          amount: currentPlan.amount,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(
          `Pembayaran sukses. Paket ${currentPlan.label} aktif sampai ${new Date(
            data.premiumUntil
          ).toLocaleDateString("ja-JP")}.`
        );
      } else {
        console.error("PAYMENT BACKEND ERROR:", data);
        setMessage(data.message || "Pembayaran gagal.");
      }
    } catch (error) {
      console.error("FRONTEND PAYMENT ERROR:", error);
      setMessage("Terjadi error saat pembayaran.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        maxWidth: "560px",
        margin: "100px auto",
        padding: "20px",
      }}
    >
      <h1
        style={{
          fontSize: "32px",
          fontWeight: "900",
          marginBottom: "16px",
          color: "rgb(15, 23, 42)",
        }}
      >
        Pembayaran Kartu Kredit
      </h1>

      <div
        style={{
          backgroundColor: "rgb(248, 250, 252)",
          border: "1px solid rgb(226, 232, 240)",
          borderRadius: "16px",
          padding: "18px",
          marginBottom: "24px",
        }}
      >
        <p
          style={{
            fontSize: "18px",
            fontWeight: "800",
            marginBottom: "8px",
            color: "rgb(15, 23, 42)",
          }}
        >
          Paket: {selectedPlan.label}
        </p>

        <p
          style={{
            fontSize: "24px",
            fontWeight: "900",
            color: "rgb(15, 23, 42)",
          }}
        >
          Harga: ¥{selectedPlan.amount.toLocaleString()}
        </p>
      </div>

      <form onSubmit={handlePayment}>
        <div
          id="card-element"
          style={{
            padding: "18px",
            border: "1px solid rgb(209, 213, 219)",
            borderRadius: "10px",
            marginBottom: "24px",
            backgroundColor: "white",
          }}
        />

        <button
          type="submit"
          disabled={!ready || loading}
          style={{
            width: "100%",
            padding: "18px",
            backgroundColor: loading ? "rgb(100, 116, 139)" : "rgb(15, 23, 42)",
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontWeight: "900",
            fontSize: "18px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Memproses..." : "Bayar Sekarang"}
        </button>
      </form>

      {message && (
        <p
          style={{
            marginTop: "28px",
            fontWeight: "900",
            fontSize: "17px",
            color: message.includes("sukses")
              ? "rgb(22, 101, 52)"
              : "rgb(185, 28, 28)",
          }}
        >
          {message}
        </p>
      )}

      <div style={{ marginTop: "28px" }}>
        <Link
          href="/upgrade"
          style={{
            color: "rgb(37, 99, 235)",
            fontWeight: "800",
            textDecoration: "none",
          }}
        >
          ← Kembali ke pilihan paket
        </Link>
      </div>
    </main>
  );
}