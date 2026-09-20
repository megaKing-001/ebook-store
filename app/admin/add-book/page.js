"use client";

import { useState } from "react";
import AdminGate from "@/components/AdminGate";

const emptyForm = {
  slug: "",
  title: "",
  subtitle: "",
  author: "",
  type: "ebook",
  price: "",
  compareAtPrice: "",
  currency: "NGN",
  description: "",
  long_description: "",
  pages: "",
  bonusType: "",
  bonusTitle: ""
};

export default function AddBookPage() {
  return <AdminGate>{(password) => <AddBookForm password={password} />}</AdminGate>;
}

function AddBookForm({ password }) {
  const [form, setForm] = useState(emptyForm);
  const [coverFile, setCoverFile] = useState(null);
  const [mainFile, setMainFile] = useState(null);
  const [bonusFile, setBonusFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  function updateField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);

    if (!coverFile || !mainFile) {
      setMessage({ type: "error", text: "Please choose a cover image and the main file." });
      return;
    }
    if (form.bonusType && !bonusFile) {
      setMessage({ type: "error", text: "You selected a bonus type but didn't attach a bonus file." });
      return;
    }

    setSubmitting(true);
    try {
      const body = new FormData();
      body.append("password", password);
      Object.entries(form).forEach(([key, value]) => body.append(key, value));
      body.append("cover", coverFile);
      body.append("mainFile", mainFile);
      if (bonusFile) body.append("bonusFile", bonusFile);

      const res = await fetch("/api/admin/add-book", { method: "POST", body });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Something went wrong.");

      setMessage({ type: "success", text: `"${form.title}" was added to the shop.` });
      setForm(emptyForm);
      setCoverFile(null);
      setMainFile(null);
      setBonusFile(null);
      e.target.reset();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  const mainFileAccept = form.type === "ebook" ? "application/pdf" : form.type === "video" ? "video/*" : "audio/*";
  const bonusFileAccept =
    form.bonusType === "ebook" ? "application/pdf" : form.bonusType === "video" ? "video/*" : "audio/*";

  return (
    <div className="max-w-lg mx-auto px-6 py-16">
      <h1 className="font-serif text-2xl mb-1">Add a product</h1>
      <p className="text-stone text-sm mb-8">This page is only for you — keep the link and password private.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Product type">
          <select
            value={form.type}
            onChange={(e) => updateField("type", e.target.value)}
            className="w-full border border-charcoal/25 bg-white px-3 py-2.5 text-sm"
          >
            <option value="ebook">Ebook (PDF)</option>
            <option value="video">Video course</option>
            <option value="audio">Audio course</option>
          </select>
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
          <Field label="Was price (optional, for a discount)">
            <input
              type="number"
              min="0"
              value={form.compareAtPrice}
              onChange={(e) => updateField("compareAtPrice", e.target.value)}
              placeholder="e.g. 10000"
              className="w-full border border-charcoal/25 bg-white px-3 py-2.5 text-sm"
            />
          </Field>
        </div>

        <Field label={form.type === "ebook" ? "Pages" : "Duration in minutes (optional)"}>
          <input
            type="number"
            min="1"
            value={form.pages}
            onChange={(e) => updateField("pages", e.target.value)}
            className="w-full border border-charcoal/25 bg-white px-3 py-2.5 text-sm"
          />
        </Field>

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

        <Field label={form.type === "ebook" ? "Ebook PDF" : form.type === "video" ? "Video file" : "Audio file"}>
          <input
            type="file"
            accept={mainFileAccept}
            required
            onChange={(e) => setMainFile(e.target.files?.[0] || null)}
            className="w-full text-sm"
          />
        </Field>

        <div className="rule pt-4">
          <p className="text-sm mb-3">Bonus item (optional) — buyers get this too</p>

          <Field label="Bonus type">
            <select
              value={form.bonusType}
              onChange={(e) => updateField("bonusType", e.target.value)}
              className="w-full border border-charcoal/25 bg-white px-3 py-2.5 text-sm"
            >
              <option value="">No bonus</option>
              <option value="ebook">Ebook (PDF)</option>
              <option value="video">Video</option>
              <option value="audio">Audio</option>
            </select>
          </Field>

          {form.bonusType && (
            <>
              <div className="mt-4">
                <Field label="Bonus title">
                  <input
                    value={form.bonusTitle}
                    onChange={(e) => updateField("bonusTitle", e.target.value)}
                    placeholder="e.g. Bonus: 5 Extra Prayers"
                    className="w-full border border-charcoal/25 bg-white px-3 py-2.5 text-sm"
                  />
                </Field>
              </div>
              <div className="mt-4">
                <Field label="Bonus file">
                  <input
                    type="file"
                    accept={bonusFileAccept}
                    onChange={(e) => setBonusFile(e.target.files?.[0] || null)}
                    className="w-full text-sm"
                  />
                </Field>
              </div>
            </>
          )}
        </div>

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
          {submitting ? "Adding…" : "Add to shop"}
        </button>
      </form>

      <p className="text-xs text-stone mt-6">
        Need a free preview link for something you just added?{" "}
        <a href="/admin/free-link" className="underline">
          Generate one here
        </a>
        .
      </p>
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
