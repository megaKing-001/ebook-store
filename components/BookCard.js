import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/format";

const TYPE_LABELS = { ebook: null, video: "Video course", audio: "Audio course" };

export default function BookCard({ book }) {
  const typeLabel = TYPE_LABELS[book.type];

  return (
    <Link href={`/product/${book.slug}`} className="group block">
      <div className="relative aspect-[2/3] bg-parchmentDark border border-charcoal/10 overflow-hidden">
        <Image
          src={book.cover}
          alt={`Cover of ${book.title}`}
          fill
          sizes="(min-width: 768px) 25vw, 50vw"
          className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
        />
      </div>
      <div className="mt-3">
        {typeLabel && <p className="text-xs uppercase tracking-wide text-brass mb-0.5">{typeLabel}</p>}
        <h3 className="font-serif text-lg leading-snug">{book.title}</h3>
        <p className="text-sm text-stone mt-0.5">{book.author}</p>
        <p className="text-sm mt-1">
          {book.compare_at_price && (
            <span className="text-stone line-through mr-2">
              {formatPrice(book.compare_at_price, book.currency)}
            </span>
          )}
          <span className="text-burgundy">{formatPrice(book.price, book.currency)}</span>
        </p>
      </div>
    </Link>
  );
}
