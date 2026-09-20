"use client";

import { useEffect, useState } from "react";
import AdminGate from "@/components/AdminGate";
import { formatPrice } from "@/lib/format";

export default function SalesPage() {
  return <AdminGate>{(password) => <SalesList password={password} />}</AdminGate>;
}

function SalesList({ password }) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not load sales.");
        return data;
      })
      .then((data) => setItems(data.items))
      .catch((err) => setError(err.message));
  }, [password]);

  const total = items ? items.reduce((sum, o) => sum + o.amount, 0) : 0;

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="font-serif text-2xl mb-1">Sales</h1>
      {items && items.length > 0 && (
        <p className="text-stone text-sm mb-8">
          {items.length} orders · {formatPrice(total, items[0].currency)} total
        </p>
      )}

      {error && <p className="text-sm text-burgundy">{error}</p>}
      {!items && !error && <p className="text-sm text-stone">Loading…</p>}
      {items && items.length === 0 && <p className="text-sm text-stone">No sales yet.</p>}

      {items && items.length > 0 && (
        <ul className="space-y-2">
          {items.map((order) => (
            <li key={order.reference} className="border border-charcoal/15 px-4 py-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-serif">{order.ebooks?.title || order.reference}</span>
                <span className="text-burgundy">{formatPrice(order.amount, order.currency)}</span>
              </div>
              <div className="text-stone text-xs mt-1">
                {order.email}
                {order.phone ? ` · ${order.phone}` : ""} ·{" "}
                {new Date(order.created_at).toLocaleDateString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
