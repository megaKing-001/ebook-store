import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { data: book } = await supabase.from("ebooks").select("title").eq("slug", params.slug).single();
  if (!book) return {};
  return { title: `${book.title} — The Reading Room` };
}

export default async function ProductPage({ params }) {
  const { data: book } = await supabase.from("ebooks").select("*").eq("slug", params.slug).single();
  if (!book) notFound();

  return (
    <section className="max-w-6xl mx-auto px-6 md:px-10 py-16 grid md:grid-cols-[0.8fr_1.2fr] gap-12">
      <div className="relative aspect-[2/3] max-w-sm w-full">
        <Image
          src={book.cover}
          alt={`Cover of ${book.title}`}
          fill
          sizes="(min-width: 768px) 30vw, 80vw"
          className="object-cover shadow-[0_20px_40px_-15px_rgba(22,33,62,0.35)]"
          priority
        />
      </div>

      <div>
        <h1 className="font-serif text-3xl md:text-4xl leading-tight">{book.title}</h1>
        {book.subtitle && (
          <p className="font-serif italic text-lg text-stone mt-2 max-w-prose">{book.subtitle}</p>
        )}
        <p className="text-sm text-stone mt-3">
          By {book.author} &middot; {book.pages} pages
        </p>

        <p className="mt-6 max-w-prose leading-relaxed text-charcoal/85">{book.long_description}</p>

        <div className="mt-8 flex items-center gap-6">
          <span className="font-serif text-2xl">{formatPrice(book.price, book.currency)}</span>
          <Link
            href={`/checkout?slug=${book.slug}`}
            className="inline-block bg-burgundy text-parchment px-6 py-3 text-sm hover:bg-burgundy/90 transition-colors"
          >
            Buy now
          </Link>
        </div>

        <div className="rule mt-10 pt-6 text-sm text-stone">
          Instant download after payment. PDF format, readable on any device.
        </div>
      </div>
    </section>
  );
}
