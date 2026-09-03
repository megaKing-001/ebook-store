import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-ink text-parchment">
      <div className="max-w-6xl mx-auto px-6 md:px-10 flex items-center justify-between h-20">
        <Link href="/" className="font-serif text-2xl tracking-tight">
          The Reading Room
        </Link>
        <nav className="flex items-center gap-8 text-sm">
          <Link href="/" className="hover:text-brassLight transition-colors">
            Home
          </Link>
          <Link href="/shop" className="hover:text-brassLight transition-colors">
            Shop
          </Link>
        </nav>
      </div>
    </header>
  );
}
