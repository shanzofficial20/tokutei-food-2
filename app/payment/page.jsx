"use client";

import { useEffect, useRef, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase-browser";

export default function PaymentPage() {
  const supabase = createBrowserSupabase();

  const payjpRef = useRef(null);
  const cardElementRef = useRef(null);

  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.pay.jp/v2/pay.js";
    script.async = true;

    script.onload = () => {
      const publicKey = process.env.NEXT_PUBLIC_PAYJP_PUBLIC_KEY;

      if (!publicKey) {
        setMessage("NEXT_PUBLIC_PAYJP_PUBLIC_KEY belum ada di .env.local");
        return;
      }

      const payjp = window.Payjp(publicKey);
      const elements = payjp.elements();

      const cardElement = elements.create("card");
      cardElement.mount("#card-element");

      payjpRef.current = payjp;
      cardElementRef.current = cardElement;

      setReady(true);
    };

    script.onerror = () => {
      setMessage("Gagal memuat script PAY.JP");
    };

    document.body.appendChild(script);

    return () => {
      if (cardElementRef.current) {
        cardElementRef.current.unmount();
      }

      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  async function handlePayment(e) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
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
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("Pembayaran sukses. Akun kamu sekarang Premium.");
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
          fontWeight: "800",
          marginBottom: "24px",
        }}
      >
        Pembayaran Akses Premium
      </h1>

      <p
        style={{
          fontSize: "20px",
          marginBottom: "28px",
        }}
      >
        Harga: <strong>¥980</strong>
      </p>

      <form onSubmit={handlePayment}>
        <div
          id="card-element"
          style={{
            padding: "18px",
            border: "1px solid #d1d5db",
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
            backgroundColor: loading ? "#777" : "#111",
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontWeight: "800",
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
            fontWeight: "800",
            fontSize: "18px",
          }}
        >
          {message}
        </p>
      )}
    </main>
  );
}