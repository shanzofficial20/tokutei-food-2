import Link from "next/link";

const cards = [
  {
    front: "QCD",
    back: "Quality・Cost・Delivery。品質・コスト・納期のこと。",
  },
  {
    front: "PDCA",
    back: "Plan・Do・Check・Act。改善活動の基本サイクル。",
  },
  {
    front: "SDCA",
    back: "Standardize・Do・Check・Act。標準を守り安定させる考え方。",
  },
  {
    front: "HACCP",
    back: "食品の安全を守る衛生管理方法。",
  },
  {
    front: "CCP",
    back: "重要管理点。食品安全で特に管理が必要な工程。",
  },
  {
    front: "5S",
    back: "整理・整頓・清掃・清潔・しつけ。",
  },
];

export default function FlashcardPage() {
  return (
    <div>
      <section className="card hero">
        <div className="hero-content">
          <div className="badge">Flashcard</div>

          <h1>Flashcard istilah penting.</h1>

          <p className="lead">
            Hafalkan istilah inti Tokutei Food 2 sebelum latihan CBT. Ini
            versi awal, nanti bisa kita sambungkan ke database.
          </p>

          <div className="row">
            <Link href="/cbt">Simulasi CBT</Link>
            <Link href="/teori" className="secondary">
              Baca Teori
            </Link>
          </div>
        </div>
      </section>

      <section className="grid">
        {cards.map((card) => (
          <div className="feature-card" key={card.front}>
            <div className="feature-icon">🧠</div>
            <h3>{card.front}</h3>
            <p className="small">{card.back}</p>
          </div>
        ))}
      </section>
    </div>
  );
}