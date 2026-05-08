import Link from "next/link";

export default function UpgradePage() {
  return (
    <main style={{ padding: "48px 24px", maxWidth: "1200px", margin: "0 auto" }}>
      <section>
        <h1 style={{ fontSize: "42px", fontWeight: "900", marginBottom: "12px" }}>
          Upgrade Premium
        </h1>

        <p style={{ fontSize: "18px", color: "#64748b", marginBottom: "36px" }}>
          Pilih paket latihan Tokutei Food 2 sesuai kebutuhan kamu.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
          }}
        >
          <div className="feature-card">
            <div className="feature-icon">🆓</div>
            <h3>Gratis</h3>
            <p className="small">Untuk coba sistem latihan.</p>
            <div className="price">¥0</div>

            <ul>
              <li>Akses 10 soal gratis</li>
              <li>Skor otomatis</li>
              <li>Cocok untuk mencoba fitur</li>
            </ul>

            <Link href="/cbt" className="secondary">
              Coba Gratis
            </Link>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔥</div>
            <h3>Premium 1 Bulan</h3>
            <p className="small">Untuk latihan serius sebelum ujian.</p>
            <div className="price">¥980</div>

            <ul>
              <li>Akses semua soal premium</li>
              <li>Latihan CBT penuh</li>
              <li>Pembahasan jawaban</li>
              <li>Riwayat skor latihan</li>
            </ul>

            <Link href="/upgrade" className="primary">
  Upgrade Premium
</Link>
          </div>

          <div className="feature-card">
            <div className="feature-icon">👑</div>
            <h3>Premium 3 Bulan</h3>
            <p className="small">Untuk persiapan lebih panjang.</p>
            <div className="price">¥2,500</div>

            <ul>
              <li>Akses semua soal</li>
              <li>Cocok untuk belajar bertahap</li>
              <li>Lebih hemat dari bulanan</li>
              <li>Support update soal</li>
            </ul>

           <Link href="/upgrade" className="primary">
  Pilih Paket Ini
</Link>
          </div>
        </div>
      </section>

      <section className="card" style={{ marginTop: "32px" }}>
        <h2>Cara upgrade premium</h2>

        <p>
          Pembayaran sekarang sudah otomatis lewat PAY.JP. Setelah pembayaran
          berhasil, akun kamu langsung berubah menjadi Premium.
        </p>

        <ol>
          <li>Login ke akun kamu.</li>
          <li>Pilih paket premium.</li>
          <li>Klik tombol Upgrade Premium.</li>
          <li>Isi kartu test atau kartu asli saat production.</li>
          <li>Setelah sukses, akun otomatis menjadi Premium.</li>
        </ol>

        <Link href="/payment" className="primary">
          Bayar Sekarang
        </Link>
      </section>
    </main>
  );
}