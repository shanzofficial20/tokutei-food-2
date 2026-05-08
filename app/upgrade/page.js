import Link from "next/link";

export default function UpgradePage() {
  return (
    <main className="main">
      <section className="hero">
        <div className="badge">Premium Access</div>

        <h1>Upgrade Premium Tokutei Food 2</h1>

        <p>
          Akses semua soal CBT, latihan premium, flashcard, dan pembahasan untuk
          persiapan Tokuteiginou 2 Makanan.
        </p>
      </section>

      <section className="features">
        <div className="feature-card">
          <div className="feature-icon">🔓</div>

          <h3>Free</h3>

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
         <Link href="/payment" className="primary">
  Upgrade Premium
</Link>

<Link href="/bank-transfer" className="secondary">
  Transfer Yuucho
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

          <Link href="/payment" className="primary">
  Pilih Paket Ini
</Link>

<Link
  href="/bank-transfer?plan=premium_3_months&amount=2500"
  className="secondary"
>
  Transfer Yuucho
</Link>
        </div>
      </section>

      <section className="card" style={{ marginTop: "32px" }}>
        <h2>Cara upgrade premium</h2>

        <p>
          Pembayaran sekarang sudah otomatis lewat PAY.JP. Setelah pembayaran
          berhasil, sistem akan langsung mengubah akun kamu menjadi Premium.
        </p>

        <ol>
          <li>Login ke akun kamu.</li>
          <li>Pilih paket premium.</li>
          <li>Klik tombol Upgrade Premium.</li>
          <li>Isi data kartu di halaman pembayaran.</li>
          <li>Setelah sukses, akun otomatis menjadi Premium.</li>
        </ol>

        <Link href="/payment" className="primary">
          Bayar Sekarang
        </Link>
      </section>
    </main>
  );
}