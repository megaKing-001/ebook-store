import { supabase } from "@/lib/supabaseClient";
import BookCard from "@/components/BookCard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Shop — The Reading Room" };

export default async function ShopPage() {
  const { data: ebooks, error } = await supabase
    .from("ebooks")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center text-stone">
        <p>Couldn&apos;t load the shop right now. Try again shortly.</p>
      </div>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-6 md:px-10 py-16">
      <h1 className="font-serif text-3xl mb-2">Shop</h1>
      <p className="text-stone mb-10">{ebooks.length} titles, and counting.</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        {ebooks.map((book) => (
          <BookCard key={book.slug} book={book} />
        ))}
      </div>
    </section>
  );
}
