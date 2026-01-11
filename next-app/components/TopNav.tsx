import Link from "next/link";

export function TopNav() {
  // ラベルと遷移先の一覧
  const items = [
    { label: "入力", href: "/input" },
    { label: "集団定義", href: "/population-definitions" },
    { label: "レポート印刷", href: "/print-report" },
    { label: "相対尤度", href: "/relative-likelihood" },
    { label: "尤度レポート印刷", href: "/print-likelihood-report" },
    { label: "このサイトについて", href: "/about" },
    { label: "ランダムフォレスト・モデリング(ベータ)", href: "/random-forest-modeling-beta" },
  ];

  return (
    <header className="h-12 bg-sky-700 text-white">
      <div className="mx-auto max-w-6xl h-full px-4 flex items-center gap-5 text-sm">
        <div className="font-semibold tracking-wide">IsoLocate(モック)</div>
        <nav className="flex items-center gap-4 opacity-95">
          {items.map(({ label, href }) => (
            <Link key={label} href={href} className="cursor-pointer whitespace-nowrap hover:underline">
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
