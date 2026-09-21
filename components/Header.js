"use client";

import { useState } from "react";
import Link from "next/link";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-ink text-parchment relative">
      <div className="max-w-6xl mx-auto px-6 md:px-10 flex items-center justify-between h-20">
        <Link href="/" className="font-serif text-2xl tracking-tight" onClick={() => setOpen(false)}>
          The Quiet Shelf
        </Link>

        <button
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
          aria-expanded={open}
          className="text-2xl leading-none px-1 py-1"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open && (
        <nav className="absolute right-0 top-20 bg-ink border-t border-parchment/10 min-w-[10rem] shadow-lg z-20">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="block px-6 py-3 text-sm hover:bg-parchment/5 transition-colors"
          >
            Home
          </Link>
          <Link
            href="/shop"
            onClick={() => setOpen(false)}
            className="block px-6 py-3 text-sm hover:bg-parchment/5 transition-colors"
          >
            Shop
          </Link>
          <Link
            href="/library"
            onClick={() => setOpen(false)}
            className="block px-6 py-3 text-sm hover:bg-parchment/5 transition-colors"
          >
            My Library
          </Link>
        </nav>
      )}
    </header>
  );
}
