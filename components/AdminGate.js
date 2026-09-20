"use client";

import { useState } from "react";

export default function AdminGate({ children }) {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setChecking(true);
    try {
      const res = await fetch("/api/admin/check-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (data.ok) {
        setUnlocked(true);
      } else {
        setError("Incorrect password.");
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setChecking(false);
    }
  }

  if (unlocked) return typeof children === "function" ? children(password) : children;

  return (
    <div className="max-w-sm mx-auto px-6 py-24">
      <h1 className="font-serif text-2xl mb-6 text-center">Admin</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          required
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full border border-charcoal/25 bg-white px-3 py-2.5 text-sm"
        />
        {error && <p className="text-sm text-burgundy">{error}</p>}
        <button
          type="submit"
          disabled={checking}
          className="w-full bg-burgundy text-parchment px-6 py-3 text-sm hover:bg-burgundy/90 transition-colors disabled:opacity-60"
        >
          {checking ? "Checking…" : "Unlock"}
        </button>
      </form>
    </div>
  );
}
