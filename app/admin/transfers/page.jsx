"use client";

import { useState } from "react";

export default function AdminTransfersPage() {
  const [adminSecret, setAdminSecret] = useState("");
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadRequests() {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/transfer-requests", {
        headers: {
          "x-admin-secret": adminSecret,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(data.message || "Gagal mengambil data.");
        setLoading(false);
        return;
      }

      setRequests(data.requests || []);
      setMessage("Data berhasil dimuat.");
    } catch (error) {
      console.error(error);
      setMessage("Terjadi error saat mengambil data.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(id, action) {
    const confirmText =
      action === "approve"
        ? "Yakin mau aktifkan Premium untuk user ini?"
        : "Yakin mau tolak request ini?";

    if (!confirm(confirmText)) return;

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/transfer-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": adminSecret,
        },
        body: JSON.stringify({
          id,
          action,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(data.message || "Aksi gagal.");
        setLoading(false);
        return;
      }

      setMessage(data.message);
      await loadRequests();
    } catch (error) {
      console.error(error);
      setMessage("Terjadi error saat memproses request.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        maxWidth: "1100px",
        margin: "60px auto",
        padding: "24px",
      }}
    >
      <h1
        style={{
          fontSize: "36px",
          fontWeight: "900",
          marginBottom: "12px",
        }}
      >
        Admin Transfer Yuucho
      </h1>

      <p
        style={{
          color: "rgb(100, 116, 139)",
          marginBottom: "24px",
          fontSize: "17px",
        }}
      >
        Masukkan admin secret, lalu cek bukti transfer. Kalau pembayaran benar,
        klik Approve untuk mengaktifkan Premium.
      </p>

      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        <input
          type="password"
          value={adminSecret}
          onChange={(e) => setAdminSecret(e.target.value)}
          placeholder="ADMIN_SECRET"
          style={{
            flex: 1,
            padding: "14px",
            border: "1px solid rgb(203, 213, 225)",
            borderRadius: "12px",
            fontSize: "16px",
          }}
        />

        <button
          onClick={loadRequests}
          disabled={loading}
          style={{
            padding: "14px 22px",
            borderRadius: "12px",
            border: "none",
            backgroundColor: "rgb(15, 23, 42)",
            color: "white",
            fontWeight: "900",
            cursor: "pointer",
          }}
        >
          {loading ? "Loading..." : "Load"}
        </button>
      </div>

      {message && (
        <p
          style={{
            marginBottom: "24px",
            fontWeight: "900",
          }}
        >
          {message}
        </p>
      )}

      <div style={{ display: "grid", gap: "18px" }}>
        {requests.map((item) => (
          <div
            key={item.id}
            style={{
              backgroundColor: "white",
              border: "1px solid rgb(226, 232, 240)",
              borderRadius: "18px",
              padding: "22px",
              boxShadow: "0 12px 30px rgba(15, 23, 42, 0.06)",
            }}
          >
            <div
              style={{
                display: "grid",
                gap: "8px",
                marginBottom: "16px",
              }}
            >
              <p>
                <strong>Email:</strong> {item.email}
              </p>
              <p>
                <strong>Amount:</strong> ¥{item.amount}
              </p>
              <p>
                <strong>Plan:</strong> {item.plan}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  style={{
                    fontWeight: "900",
                    color:
                      item.status === "approved"
                        ? "rgb(22, 101, 52)"
                        : item.status === "rejected"
                        ? "rgb(185, 28, 28)"
                        : "rgb(202, 138, 4)",
                  }}
                >
                  {item.status}
                </span>
              </p>
              <p>
                <strong>Catatan:</strong> {item.note || "-"}
              </p>
              <p>
                <strong>Dikirim:</strong>{" "}
                {new Date(item.created_at).toLocaleString()}
              </p>
            </div>

            {item.proof_url ? (
              <a
                href={item.proof_url}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-block",
                  marginRight: "12px",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  backgroundColor: "rgb(241, 245, 249)",
                  color: "rgb(15, 23, 42)",
                  textDecoration: "none",
                  fontWeight: "900",
                }}
              >
                Lihat Bukti Transfer
              </a>
            ) : (
              <p>Bukti transfer tidak ada.</p>
            )}

            {item.status === "pending" && (
              <>
                <button
                  onClick={() => handleAction(item.id, "approve")}
                  style={{
                    marginRight: "12px",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    border: "none",
                    backgroundColor: "rgb(22, 101, 52)",
                    color: "white",
                    fontWeight: "900",
                    cursor: "pointer",
                  }}
                >
                  Approve Premium
                </button>

                <button
                  onClick={() => handleAction(item.id, "reject")}
                  style={{
                    padding: "12px 16px",
                    borderRadius: "12px",
                    border: "none",
                    backgroundColor: "rgb(185, 28, 28)",
                    color: "white",
                    fontWeight: "900",
                    cursor: "pointer",
                  }}
                >
                  Reject
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}