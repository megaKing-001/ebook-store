"use client";

import { useEffect, useState } from "react";
import AdminGate from "@/components/AdminGate";
import { formatPrice } from "@/lib/format";

export default function ProductsPage() {
  return <AdminGate>{(password) => <ProductsList password={password} />}</AdminGate>;
}

function ProductsList({ password }) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not load products.");
        return data;
      })
      .then((data) => setItems(data.items))
      .catch((err) => setError(err.message));
  }, [password]);

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="font-serif text-2xl mb-1">Manage products</h1>
      <p className="text-stone text-sm mb-8">Tap any product to edit its details or replace its files.</p>

      {error && <p className="text-sm text-burgundy">{error}</p>}
      {!items && !error && <p className="text-sm text-stone">Loading…</p>}

      {items && items.length === 0 && <p className="text-sm text-stone">No products yet.</p>}

      {items && items.length > 0 && (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.slug} className="flex items-center gap-2">
              <a
                href={`/admin/products/${item.slug}/edit`}
                className="flex-1 flex items-center justify-between border border-charcoal/15 px-4 py-3 hover:bg-parchmentDark transition-colors"
              >
                <span>
                  <span className="font-serif">{item.title}</span>
                  <span className="text-xs uppercase tracking-wide text-brass ml-2">{item.type}</span>
                </span>
                <span className="text-sm text-burgundy">{formatPrice(item.price, item.currency)}</span>
              </a>
              <a
                href={`/admin/products/${item.slug}/modules`}
                className="text-xs border border-charcoal/15 px-3 py-3 hover:bg-parchmentDark transition-colors"
              >
                Modules
              </a>
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-stone mt-8">
        <a href="/admin/add-book" className="underline">
          Add a new product instead
        </a>
      </p>
    </div>
  );
}
