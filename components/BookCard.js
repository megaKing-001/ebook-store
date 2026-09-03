import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/format";

export default function BookCard({ book }) {
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
        <h3 className="font-serif text-lg leading-snug">{book.title}</h3>
        <p className="text-sm text-stone mt-0.5">{book.author}</p>
        <p className="text-sm text-burgundy mt-1">{formatPrice(book.price, book.currency)}</p>
      </div>
    </Link>
  );
}
