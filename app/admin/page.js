"use client";

import AdminGate from "@/components/AdminGate";

export default function AdminHomePage() {
  return (
    <AdminGate>
      {() => (
        <div className="max-w-md mx-auto px-6 py-16">
          <h1 className="font-serif text-2xl mb-6">Admin</h1>
          <div className="space-y-3">
            <a href="/admin/add-book" className="block bg-burgundy text-parchment px-5 py-3 text-sm text-center">
              Add a product
            </a>
            <a href="/admin/products" className="block bg-ink text-parchment px-5 py-3 text-sm text-center">
              Manage products
            </a>
            <a href="/admin/sales" className="block bg-ink text-parchment px-5 py-3 text-sm text-center">
              View sales
            </a>
            <a href="/admin/free-link" className="block bg-ink text-parchment px-5 py-3 text-sm text-center">
              Generate a free access link
            </a>
          </div>
        </div>
      )}
    </AdminGate>
  );
}
