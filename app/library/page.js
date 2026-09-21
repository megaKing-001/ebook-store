"use client";

import { useState } from "react";
import BackButton from "@/components/BackButton";

const TYPE_VERB = { ebook: "Read", video: "Watch", audio: "Listen" };

export default function LibraryPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setItems(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setItems(data.items);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <BackButton fallbackHref="/" />
      <h1 className="font-serif text-2xl mb-1">My Library</h1>
      <p className="text-stone text-sm mb-8">
        Enter the email you used at checkout to find everything you&apos;ve bought.
      </p>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-8">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="flex-1 border border-charcoal/25 bg-white px-3 py-2.5 text-sm"
        />
        <button
          type="submit"
          disabled={submitting}
          className="bg-burgundy text-parchment px-5 py-2.5 text-sm hover:bg-burgundy/90 transition-colors disabled:opacity-60"
        >
          {submitting ? "Looking…" : "Find"}
        </button>
      </form>

      {error && <p className="text-sm text-burgundy">{error}</p>}

      {items && items.length === 0 && (
        <p className="text-sm text-stone">No purchases found for that email.</p>
      )}

      {items && items.length > 0 && (
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.slug}
              className="flex items-center justify-between border border-charcoal/15 px-4 py-3"
            >
              <span className="font-serif">{item.title}</span>
              <a href={item.accessUrl} className="text-sm underline underline-offset-4">
                {TYPE_VERB[item.type] || "Open"}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
