"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/format";

export default function BookCarousel({ books }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (books.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % books.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [books.length]);

  if (!books || books.length === 0) return null;

  function goTo(i) {
    setIndex(((i % books.length) + books.length) % books.length);
  }

  return (
    <div className="relative max-w-2xl mx-auto">
      <div className="relative aspect-[16/10] md:aspect-[16/8] overflow-hidden bg-parchmentDark">
        {books.map((book, i) => (
          <Link
            key={book.slug}
            href={`/product/${book.slug}`}
            className={`absolute inset-0 flex items-center gap-6 px-6 md:px-10 transition-opacity duration-700 ${
              i === index ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            <div className="relative w-24 md:w-32 aspect-[2/3] flex-shrink-0 shadow-lg">
              <Image src={book.cover} alt={`Cover of ${book.title}`} fill sizes="150px" className="object-cover" />
            </div>
            <div>
              <h3 className="font-serif text-xl md:text-2xl leading-snug">{book.title}</h3>
              <p className="text-sm text-stone mt-1">{book.author}</p>
              <p className="text-sm text-burgundy mt-2">{formatPrice(book.price, book.currency)}</p>
            </div>
          </Link>
        ))}
      </div>

      {books.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {books.map((book, i) => (
            <button
              key={book.slug}
              onClick={() => goTo(i)}
              aria-label={`Show ${book.title}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-burgundy" : "w-1.5 bg-charcoal/20"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
