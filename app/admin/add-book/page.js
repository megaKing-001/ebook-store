"use client";

import { useState } from "react";

const emptyForm = {
  slug: "",
  title: "",
  subtitle: "",
  author: "",
  price: "",
  currency: "NGN",
  description: "",
  long_description: "",
  pages: ""
};

export default function AddBookPage() {
  const [password, setPassword] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [coverFile, setCoverFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  function updateField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);

    if (!coverFile || !pdfFile) {
      setMessage({ type: "error", text: "Please choose both a cover image and a PDF file." });
      return;
    }

    setSubmitting(true);
    try {
      const body = new FormData();
      body.append("password", password);
      Object.entries(form).forEach(([key, value]) => body.append(key, value));
      body.append("cover", coverFile);
      body.append("pdf", pdfFile);

      const res = await fetch("/api/admin/add-book", { method: "POST", body });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Something went wrong.");

      setMessage({ type: "success", text: `"${form.title}" was added to the shop.` });
      setForm(emptyForm);
      setCoverFile(null);
      setPdfFile(null);
      e.target.reset();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-16">
      <h1 className="font-serif text-2xl mb-1">Add a book</h1>
      <p className="text-stone text-sm mb-8">This page is only for you — keep the link and password private.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Admin password">
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-charcoal/25 bg-white px-3 py-2.5 text-sm"
          />
        </Field>

        <Field label="Slug (used in the URL, e.g. my-new-book)">
          <input
            required
            value={form.slug}
            onChange={(e) => updateField("slug", e.target.value)}
            className="w-full border border-charcoal/25 bg-white px-3 py-2.5 text-sm"
          />
        </Field>

        <Field label="Title">
          <input
            required
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
            className="w-full border border-charcoal/25 bg-white px-3 py-2.5 text-sm"
          />
        </Field>

        <Field label="Subtitle (optional)">
          <input
            value={form.subtitle}
            onChange={(e) => updateField("subtitle", e.target.value)}
            className="w-full border border-charcoal/25 bg-white px-3 py-2.5 text-sm"
          />
        </Field>

        <Field label="Author">
          <input
            required
            value={form.author}
            onChange={(e) => updateField("author", e.target.value)}
            className="w-full border border-charcoal/25 bg-white px-3 py-2.5 text-sm"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Price (₦, whole naira)">
            <input
              type="number"
              required
              min="0"
              value={form.price}
              onChange={(e) => updateField("price", e.target.value)}
              className="w-full border border-charcoal/25 bg-white px-3 py-2.5 text-sm"
            />
          </Field>
          <Field label="Pages">
            <input
              type="number"
              min="1"
              value={form.pages}
              onChange={(e) => updateField("pages", e.target.value)}
              className="w-full border border-charcoal/25 bg-white px-3 py-2.5 text-sm"
            />
          </Field>
        </div>

        <Field label="Short description (shows on shop cards)">
          <textarea
            rows={2}
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            className="w-full border border-charcoal/25 bg-white px-3 py-2.5 text-sm"
          />
        </Field>

        <Field label="Full description (shows on the product page)">
          <textarea
            rows={4}
            value={form.long_description}
            onChange={(e) => updateField("long_description", e.target.value)}
            className="w-full border border-charcoal/25 bg-white px-3 py-2.5 text-sm"
          />
        </Field>

        <Field label="Cover image">
          <input
            type="file"
            accept="image/*"
            required
            onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
            className="w-full text-sm"
          />
        </Field>

        <Field label="Ebook PDF">
          <input
            type="file"
            accept="application/pdf"
            required
            onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
            className="w-full text-sm"
          />
        </Field>

        {message && (
          <p className={`text-sm ${message.type === "error" ? "text-burgundy" : "text-green-700"}`}>
            {message.text}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-burgundy text-parchment px-6 py-3 text-sm hover:bg-burgundy/90 transition-colors disabled:opacity-60"
        >
          {submitting ? "Adding book…" : "Add book to shop"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm mb-1.5">{label}</label>
      {children}
    </div>
  );
}
