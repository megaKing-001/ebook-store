"use client";

import { useState } from "react";

const TYPE_VERB = { ebook: "Read", video: "Watch", audio: "Listen" };

export default function LibraryPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [items, setItems] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setItems(null);
    setIsAdmin(false);
    setSubmitting(true);

    try {
      const res = await fetch("/api/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");

      if (data.isAdmin) {
        setIsAdmin(true);
      } else {
        setItems(data.items);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (isAdmin) {
    return (
      <div className="max-w-md mx-auto px-6 py-16">
        <h1 className="font-serif text-2xl mb-6">Admin tools</h1>
        <div className="space-y-3">
          <a href="/admin/add-book" className="block bg-burgundy text-parchment px-5 py-3 text-sm text-center">
            Add a product
          </a>
          <a href="/admin/free-link" className="block bg-ink text-parchment px-5 py-3 text-sm text-center">
            Generate a free access link
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <h1 className="font-serif text-2xl mb-1">My Library</h1>
      <p className="text-stone text-sm mb-8">
        Enter the email you used at checkout to find everything you&apos;ve bought.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3 mb-8">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full border border-charcoal/25 bg-white px-3 py-2.5 text-sm"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (leave blank unless you're the owner)"
          className="w-full border border-charcoal/25 bg-white px-3 py-2.5 text-sm"
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-burgundy text-parchment px-5 py-2.5 text-sm hover:bg-burgundy/90 transition-colors disabled:opacity-60"
        >
          {submitting ? "Looking…" : "Continue"}
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
