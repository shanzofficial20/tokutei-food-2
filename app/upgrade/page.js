import Link from "next/link";

export default function UpgradePage() {
  return (
    <main className="main">
      <section className="hero">
        <div className="badge">Premium Access</div>

        <h1>Upgrade Premium Tokutei Food 2</h1>

        <p>
          Pilih paket premium. Kamu bisa bayar otomatis dengan kartu kredit
          lewat PAY.JP atau transfer manual lewat Yuucho.
        </p>
      </section>

      <section className="features">
        <div className="feature-card">
          <div className="feature-icon">🔓</div>

          <h3>Free</h3>

          <p className="small">Untuk coba sistem latihan.</p>

          <div className="price">¥0</div>

          <ul>
            <li>Akses soal gratis terbatas</li>
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

          <p className="small">Aktif selama 30 hari.</p>

          <div className="price">¥980</div>

          <ul>
            <li>Akses semua soal premium</li>
            <li>Latihan CBT penuh</li>
            <li>Pembahasan jawaban</li>
            <li>Masa aktif 30 hari</li>
          </ul>

          <Link
            href="/payment?plan=premium_1_month&amount=980"
            className="primary"
          >
            Bayar Kartu Kredit
          </Link>

          <Link
            href="/bank-transfer?plan=premium_1_month&amount=980"
            className="secondary"
          >
            Transfer Yuucho
          </Link>
        </div>

        <div className="feature-card">
          <div className="feature-icon">👑</div>

          <h3>Premium 3 Bulan</h3>

          <p className="small">Aktif selama 90 hari.</p>

          <div className="price">¥2,500</div>

          <ul>
            <li>Akses semua soal premium</li>
            <li>Cocok untuk belajar bertahap</li>
            <li>Lebih hemat dari bulanan</li>
            <li>Masa aktif 90 hari</li>
          </ul>

          <Link
            href="/payment?plan=premium_3_months&amount=2500"
            className="primary"
          >
            Bayar Kartu Kredit
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
          Jika memakai kartu kredit, akun otomatis menjadi Premium setelah
          pembayaran berhasil. Jika memakai Transfer Yuucho, akun akan menjadi
          Premium setelah admin mengecek dan menyetujui bukti transfer.
        </p>

        <ol>
          <li>Login ke akun kamu.</li>
          <li>Pilih paket 1 bulan atau 3 bulan.</li>
          <li>Pilih metode pembayaran.</li>
          <li>Bayar sesuai metode yang dipilih.</li>
          <li>Akun menjadi Premium sesuai masa aktif paket.</li>
        </ol>
      </section>
    </main>
  );
}