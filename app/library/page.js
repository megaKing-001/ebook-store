"use client";

import { useState, useEffect, useCallback } from "react";
import BackButton from "@/components/BackButton";

const TYPE_VERB = { ebook: "Read", video: "Watch", audio: "Listen" };
const STORAGE_KEY = "quietshelf_library_email";

export default function LibraryPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");

  const lookup = useCallback(async (lookupEmail) => {
    setError("");
    setItems(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: lookupEmail })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setItems(data.items);
      try {
        window.localStorage.setItem(STORAGE_KEY, lookupEmail);
      } catch {
        // localStorage unavailable — non-fatal, just means it won't be remembered
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }, []);

  useEffect(() => {
    let remembered = "";
    try {
      remembered = window.localStorage.getItem(STORAGE_KEY) || "";
    } catch {
      remembered = "";
    }
    if (remembered) {
      setEmail(remembered);
      lookup(remembered);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    lookup(email);
  }

  function handleForget() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setEmail("");
    setItems(null);
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <BackButton fallbackHref="/" />
      <h1 className="font-serif text-2xl mb-1">My Library</h1>
      <p className="text-stone text-sm mb-8">
        Enter the email you used at checkout to find everything you&apos;ve bought.
      </p>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-2">
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

      {items && (
        <button type="button" onClick={handleForget} className="text-xs text-stone/60 hover:text-stone underline mb-6">
          Not you? Forget this email on this device
        </button>
      )}
      {!items && <div className="mb-6" />}

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
