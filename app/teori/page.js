import Link from "next/link";

export default function TeoriPage() {
  return (
    <div>
      <section className="card hero">
        <div className="hero-content">
          <div className="badge">Teori</div>

          <h1>Teori Tokutei Food 2.</h1>

          <p className="lead">
            Pelajari ringkasan materi penting sebelum masuk simulasi CBT.
            Fokus pada 食品衛生, 品質管理, 生産管理, 労働安全, dan 社会の変化.
          </p>

          <div className="row">
            <Link href="/cbt">Mulai Simulasi CBT</Link>
            <Link href="/flashcard" className="secondary">
              Buka Flashcard
            </Link>
          </div>
        </div>
      </section>
<div className="feature-card">
  <div className="feature-icon">👷</div>
  <h3>第1章 職長として働くための基本</h3>
  <p className="small">
    職長の役割, 作業指示, 報告・連絡・相談, 作業者への教育, 安全・品質・生産の基本.
  </p>
</div>
      <section className="grid">
        <div className="feature-card">
          <div className="feature-icon">🧼</div>
          <h3>第2章 食品衛生</h3>
          <p className="small">
            HACCP, CCP, CL, アレルゲン, 食中毒, 衛生管理.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">📊</div>
          <h3>第3章 品質管理</h3>
          <p className="small">
            QCD, PDCA, SDCA, QC7つ道具, トレーサビリティ.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🏭</div>
          <h3>第4章 生産管理</h3>
          <p className="small">
            生産性, 工数, 歩留まり, 稼働率, 納期管理.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">⚠️</div>
          <h3>第5章 労働安全</h3>
          <p className="small">
            5S, KY, ヒヤリハット, リスクアセスメント.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🌏</div>
          <h3>第6章 社会の変化</h3>
          <p className="small">
            SDGs, ESG, フードディフェンス, 人権, 多様性.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">📝</div>
          <h3>模擬試験</h3>
          <p className="small">
            Campuran soal untuk mengukur kesiapan sebelum ujian.
          </p>
        </div>
      </section>
    </div>
  );
}