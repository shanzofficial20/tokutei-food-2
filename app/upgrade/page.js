import Link from "next/link";

export default function UpgradePage() {
  return (
    <div>
      <section className="card hero">
        <div className="hero-content">
          <div className="badge">Premium Access</div>

          <h1>Buka semua soal Tokutei Food 2.</h1>

          <p className="lead">
            Akun gratis hanya bisa mencoba beberapa soal. Dengan premium, kamu
            bisa mengakses seluruh bank soal CBT, pembahasan, dan latihan penuh.
          </p>

          <div className="row">
            <Link href="/login">Login / Daftar</Link>
            <Link href="/cbt" className="secondary">Coba Soal Gratis</Link>
          </div>
        </div>
      </section>

      <section className="grid">
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
          <Link href="/cbt" className="secondary">Coba Gratis</Link>
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
          <Link href="/payment">Upgrade Premium</Link>nk href="
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
         <Link href="/payment">Pilih Paket Ini</Link>
        </div>
      </section>

      <section className="card" id="payment">
        <h2>Cara upgrade premium</h2>

        <p>
          Untuk versi awal, pembayaran dilakukan secara manual. Setelah user
          membayar, admin akan mengubah status akun menjadi premium.
        </p>

        <ol>
          <li>Daftar akun di website.</li>
          <li>Pilih paket premium.</li>
          <li>Lakukan pembayaran manual.</li>
          <li>Kirim email akun yang dipakai daftar.</li>
          <li>Admin mengaktifkan premium.</li>
        </ol>

        <div className="card">
          <h3>Informasi pembayaran</h3>
          <p className="small">
            Isi bagian ini nanti dengan metode pembayaran kamu. Contoh:
            PayPay, transfer bank Jepang, Wise, atau rekening Indonesia.
          </p>

          <p>
            <b>PayPay:</b> tulis nomor/ID kamu di sini
          </p>
          <p>
            <b>Kontak:</b> tulis WhatsApp / email kamu di sini
          </p>
        </div>

        <p className="small">
          Catatan: sistem pembayaran otomatis bisa ditambahkan nanti. Untuk MVP,
          pembayaran manual lebih aman dan cepat dibuat.
        </p>
      </section>

      <section className="card">
        <h2>Kenapa premium?</h2>
        <p>
          Karena latihan ujian butuh soal banyak, bukan cuma baca teori. Target
          kita sederhana: user bisa terbiasa dengan pola soal CBT, pilihan 1–4,
          dan membaca soal Jepang tanpa furigana.
        </p>

        <Link href="/login">Daftar Sekarang</Link>
      </section>
    </div>
  );
}