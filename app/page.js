import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import BookCarousel from "@/components/BookCarousel";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { data: ebooks } = await supabase
    .from("ebooks")
    .select("*")
    .order("created_at", { ascending: true });

  const books = ebooks || [];

  return (
    <div>
      <section className="max-w-3xl mx-auto px-6 md:px-10 pt-16 md:pt-24 pb-12 text-center">
        <h1 className="font-serif text-3xl md:text-4xl leading-tight">
          Ebooks, video and audio courses for the thoughtful reader
        </h1>
        <p className="mt-4 text-charcoal/80 max-w-prose mx-auto">
          A small, curated shelf — read, watch, or listen, right in your browser.
        </p>
        <Link
          href="/shop"
          className="inline-block mt-6 bg-burgundy text-parchment px-6 py-3 text-sm hover:bg-burgundy/90 transition-colors"
        >
          Browse the shop
        </Link>
      </section>

      {books.length > 0 && (
        <section className="pb-20 px-4">
          <BookCarousel books={books} />
        </section>
      )}
    </div>
  );
}
