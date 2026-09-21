"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { formatPrice } from "@/lib/format";

function CheckoutForm() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");

  const [book, setBook] = useState(null);
  const [loadingBook, setLoadingBook] = useState(true);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [alreadyOwned, setAlreadyOwned] = useState(null);

  useEffect(() => {
    if (!slug) {
      setLoadingBook(false);
      return;
    }
    supabase
      .from("ebooks")
      .select("*")
      .eq("slug", slug)
      .single()
      .then(({ data }) => {
        setBook(data || null);
        setLoadingBook(false);
      });
  }, [slug]);

  if (loadingBook) {
    return <div className="max-w-md mx-auto px-6 py-24 text-center text-stone">Loading…</div>;
  }

  if (!book) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <p className="text-stone">We couldn&apos;t find that title.</p>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: book.slug, email, phone })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong starting checkout.");
      }

      if (data.alreadyOwned) {
        setAlreadyOwned({ accessUrl: data.accessUrl });
        setSubmitting(false);
        return;
      }

      window.location.href = data.authorizationUrl;
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <h1 className="font-serif text-2xl mb-1">Checkout</h1>
      <p className="text-stone text-sm mb-8">You&apos;re about to purchase:</p>

      <div className="flex items-center justify-between border border-charcoal/15 px-4 py-3 mb-8">
        <span className="font-serif">{book.title}</span>
        <span className="text-burgundy text-sm">{formatPrice(book.price, book.currency)}</span>
      </div>

      {alreadyOwned ? (
        <div className="border border-brass/40 bg-parchmentDark px-4 py-4 text-center">
          <p className="text-sm mb-3">You already own this — no need to pay again.</p>
          <a
            href={alreadyOwned.accessUrl}
            className="inline-block bg-burgundy text-parchment px-6 py-3 text-sm hover:bg-burgundy/90 transition-colors"
          >
            Open now
          </a>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm mb-1.5">
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full border border-charcoal/25 bg-white px-3 py-2.5 text-sm"
          />
          <p className="text-xs text-stone mt-1.5">Your access link will be tied to this address.</p>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm mb-1.5">
            Phone number
          </label>
          <input
            id="phone"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="080..."
            className="w-full border border-charcoal/25 bg-white px-3 py-2.5 text-sm"
          />
        </div>

        {error && <p className="text-sm text-burgundy">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-burgundy text-parchment px-6 py-3 text-sm hover:bg-burgundy/90 transition-colors disabled:opacity-60"
        >
          {submitting ? "Redirecting to Paystack…" : `Pay ${formatPrice(book.price, book.currency)}`}
        </button>
      </form>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutForm />
    </Suspense>
  );
}
