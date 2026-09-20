"use client";

import { useState } from "react";

export default function FreeLinkPage() {
  const [password, setPassword] = useState("");
  const [slug, setSlug] = useState("");
  const [label, setLabel] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setResult(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/create-access-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, slug: slug.trim(), label: label.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const fullUrl =
    result && typeof window !== "undefined" ? `${window.location.origin}${result.url}` : result?.url;

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <h1 className="font-serif text-2xl mb-1">Generate a free access link</h1>
      <p className="text-stone text-sm mb-8">
        Creates a link that opens a book or course for free, without payment — good for gifting or previews.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1.5">Admin password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-charcoal/25 bg-white px-3 py-2.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm mb-1.5">Book/course slug</label>
          <input
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="breaking-the-cycle"
            className="w-full border border-charcoal/25 bg-white px-3 py-2.5 text-sm"
          />
          <p className="text-xs text-stone mt-1.5">The slug is the part of the product URL after /product/.</p>
        </div>

        <div>
          <label className="block text-sm mb-1.5">Who is this for? (optional, appears as a watermark)</label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. John Adeyemi, or a promo name"
            className="w-full border border-charcoal/25 bg-white px-3 py-2.5 text-sm"
          />
        </div>

        {error && <p className="text-sm text-burgundy">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-burgundy text-parchment px-6 py-3 text-sm hover:bg-burgundy/90 transition-colors disabled:opacity-60"
        >
          {submitting ? "Generating…" : "Generate link"}
        </button>
      </form>

      {result && (
        <div className="mt-8 border border-charcoal/15 p-4">
          <p className="text-sm mb-2">
            Free link for <span className="font-serif italic">{result.title}</span>:
          </p>
          <p className="text-xs break-all bg-parchmentDark px-3 py-2">{fullUrl}</p>
        </div>
      )}
    </div>
  );
}
