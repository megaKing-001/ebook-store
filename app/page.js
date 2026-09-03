import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import BookCard from "@/components/BookCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { data: ebooks, error } = await supabase
    .from("ebooks")
    .select("*")
    .order("created_at", { ascending: true });

  if (error || !ebooks || ebooks.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center text-stone">
        <p>No books in the shop yet. Add some rows to the `ebooks` table in Supabase.</p>
      </div>
    );
  }

  const featured = ebooks[0];
  const rest = ebooks.slice(1, 5);

  return (
    <div>
      <section className="max-w-6xl mx-auto px-6 md:px-10 pt-16 md:pt-24 pb-16 grid md:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
        <div>
          <p className="text-sm text-burgundy mb-4">Currently on the shelf</p>
          <h1 className="font-serif text-4xl md:text-5xl leading-[1.1]">{featured.title}</h1>
          <p className="font-serif italic text-xl md:text-2xl text-stone mt-3 max-w-prose">
            {featured.subtitle}
          </p>
          <p className="mt-6 max-w-prose text-charcoal/85 leading-relaxed">{featured.description}</p>
          <div className="mt-8 flex items-center gap-6">
            <Link
              href={`/product/${featured.slug}`}
              className="inline-block bg-burgundy text-parchment px-6 py-3 text-sm hover:bg-burgundy/90 transition-colors"
            >
              Read more &amp; buy
            </Link>
            <Link href="/shop" className="text-sm underline underline-offset-4 decoration-charcoal/30 hover:decoration-charcoal">
              Browse the full shop
            </Link>
          </div>
        </div>
        <div className="relative aspect-[2/3] max-w-sm mx-auto w-full">
          <Image
            src={featured.cover}
            alt={`Cover of ${featured.title}`}
            fill
            sizes="(min-width: 768px) 30vw, 60vw"
            className="object-cover shadow-[0_20px_40px_-15px_rgba(22,33,62,0.35)]"
            priority
          />
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <div className="rule" />
      </div>

      {rest.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 md:px-10 py-16">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="font-serif text-2xl">More from the shelf</h2>
            <Link href="/shop" className="text-sm underline underline-offset-4 decoration-charcoal/30 hover:decoration-charcoal">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
            {rest.map((book) => (
              <BookCard key={book.slug} book={book} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
