import "./globals.css";
import Header from "./components/Header";

export const metadata = {
  title: "Tokutei Food 2 - Latihan CBT Tokuteiginou 2 Makanan",
  description: "Website latihan soal CBT Tokuteiginou 2 makanan dengan akses premium.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <Header />
        <main className="container">{children}</main>
      </body>
    </html>
  );
}