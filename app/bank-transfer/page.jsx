"use client";

import { useState } from "react";
import Link from "next/link";
import { createBrowserSupabase } from "@/lib/supabase-browser";

export default function BankTransferPage() {
  const supabase = createBrowserSupabase();

  const [proofFile, setProofFile] = useState(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setMessage("Kamu harus login dulu sebelum kirim bukti transfer.");
        setLoading(false);
        return;
      }

      if (!proofFile) {
        setMessage("Upload bukti transfer dulu.");
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("plan", "premium_1_month");
      formData.append("amount", "980");
      formData.append("note", note);
      formData.append("proof", proofFile);

      const response = await fetch("/api/transfer-request", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(data.message || "Gagal mengirim bukti transfer.");
        setLoading(false);
        return;
      }

      setMessage(
        "Bukti transfer berhasil dikirim. Tunggu admin cek pembayaran kamu."
      );
      setProofFile(null);
      setNote("");
    } catch (error) {
      console.error(error);
      setMessage("Terjadi error saat mengirim bukti transfer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        maxWidth: "900px",
        margin: "70px auto",
        padding: "24px",
      }}
    >
      <section
        style={{
          backgroundColor: "rgb(255, 255, 255)",
          border: "1px solid rgb(229, 231, 235)",
          borderRadius: "24px",
          padding: "32px",
          boxShadow: "0 20px 50px rgba(15, 23, 42, 0.08)",
        }}
      >
        <h1
          style={{
            fontSize: "36px",
            fontWeight: "900",
            marginBottom: "12px",
            color: "rgb(15, 23, 42)",
          }}
        >
          Transfer Yuucho
        </h1>

        <p
          style={{
            fontSize: "18px",
            color: "rgb(100, 116, 139)",
            marginBottom: "28px",
          }}
        >
          Transfer manual ke rekening Yuucho. Setelah transfer, upload bukti
          pembayaran di bawah. Admin akan mengecek dan mengaktifkan Premium.
        </p>

        <div
          style={{
            backgroundColor: "rgb(248, 250, 252)",
            border: "1px solid rgb(226, 232, 240)",
            borderRadius: "18px",
            padding: "24px",
            marginBottom: "28px",
          }}
        >
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "900",
              marginBottom: "18px",
            }}
          >
            Data Rekening Yuucho
          </h2>

          <div style={{ display: "grid", gap: "12px", fontSize: "17px" }}>
            <p>
              <strong>Bank:</strong> ゆうちょ銀行
            </p>
            <p>
              <strong>Nama:</strong> GUNUNG LUMBANTOBING
            </p>
            <p>
              <strong>記号:</strong> 14050
            </p>
            <p>
              <strong>番号:</strong> 71322791
            </p>
            <p>
              <strong>Jumlah:</strong> ¥980
            </p>
          </div>

          <p
            style={{
              marginTop: "18px",
              color: "rgb(220, 38, 38)",
              fontWeight: "800",
            }}
          >
            Ganti data rekening di kode ini dengan rekening Yuucho kamu yang
            asli.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label
            style={{
              display: "block",
              fontWeight: "900",
              marginBottom: "8px",
            }}
          >
            Upload Bukti Transfer
          </label>

          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => setProofFile(e.target.files?.[0] || null)}
            style={{
              width: "100%",
              padding: "14px",
              border: "1px solid rgb(203, 213, 225)",
              borderRadius: "12px",
              marginBottom: "18px",
            }}
          />

          <label
            style={{
              display: "block",
              fontWeight: "900",
              marginBottom: "8px",
            }}
          >
            Catatan tambahan
          </label>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Contoh: Saya sudah transfer atas nama Hans."
            rows={4}
            style={{
              width: "100%",
              padding: "14px",
              border: "1px solid rgb(203, 213, 225)",
              borderRadius: "12px",
              marginBottom: "18px",
              fontSize: "16px",
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "14px",
              border: "none",
              backgroundColor: loading ? "rgb(100, 116, 139)" : "rgb(15, 23, 42)",
              color: "white",
              fontSize: "18px",
              fontWeight: "900",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Mengirim..." : "Kirim Bukti Transfer"}
          </button>
        </form>

        {message && (
          <p
            style={{
              marginTop: "22px",
              fontWeight: "900",
              color: message.includes("berhasil")
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
            ← Kembali ke halaman upgrade
          </Link>
        </div>
      </section>
    </main>
  );
}