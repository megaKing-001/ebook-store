"use client";

import { useEffect, useState } from "react";
import AdminGate from "@/components/AdminGate";

export default function EditProductPage({ params }) {
  return <AdminGate>{(password) => <EditForm password={password} slug={params.slug} />}</AdminGate>;
}

function EditForm({ password, slug }) {
  const [form, setForm] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [mainFile, setMainFile] = useState(null);
  const [bonusFile, setBonusFile] = useState(null);
  const [introVideo, setIntroVideo] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetch("/api/admin/get-product", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, slug })
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not load this product.");
        return data.item;
      })
      .then((item) => {
        setForm({
          title: item.title || "",
          subtitle: item.subtitle || "",
          author: item.author || "",
          type: item.type || "ebook",
          price: item.price ? item.price / 100 : "",
          compareAtPrice: item.compare_at_price ? item.compare_at_price / 100 : "",
          description: item.description || "",
          long_description: item.long_description || "",
          pages: item.pages || "",
          bonusType: item.bonus_type || "",
          bonusTitle: item.bonus_title || ""
        });
      })
      .catch((err) => setLoadError(err.message));
  }, [password, slug]);

  function updateField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    setSubmitting(true);

    try {
      const body = new FormData();
      body.append("password", password);
      body.append("slug", slug);
      Object.entries(form).forEach(([key, value]) => body.append(key, value));
      if (coverFile) body.append("cover", coverFile);
      if (mainFile) body.append("mainFile", mainFile);
      if (bonusFile) body.append("bonusFile", bonusFile);
      if (introVideo) body.append("introVideo", introVideo);

      const res = await fetch("/api/admin/update-product", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");

      setMessage({ type: "success", text: "Saved." });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  if (loadError) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <p className="text-burgundy text-sm">{loadError}</p>
      </div>
    );
  }

  if (!form) {
    return <div className="max-w-md mx-auto px-6 py-24 text-center text-stone text-sm">Loading…</div>;
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-16">
      <h1 className="font-serif text-2xl mb-1">Edit product</h1>
      <p className="text-stone text-sm mb-8">{slug}</p>

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

        <Field label="Title">
          <input
            required
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
            className="w-full border border-charcoal/25 bg-white px-3 py-2.5 text-sm"
          />
        </Field>

        <Field label="Subtitle">
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
          <Field label="Price (₦)">
            <input
              type="number"
              required
              min="0"
              value={form.price}
              onChange={(e) => updateField("price", e.target.value)}
              className="w-full border border-charcoal/25 bg-white px-3 py-2.5 text-sm"
            />
          </Field>
          <Field label="Was price (optional)">
            <input
              type="number"
              min="0"
              value={form.compareAtPrice}
              onChange={(e) => updateField("compareAtPrice", e.target.value)}
              className="w-full border border-charcoal/25 bg-white px-3 py-2.5 text-sm"
            />
          </Field>
        </div>

        <Field label={form.type === "ebook" ? "Pages" : "Duration in minutes"}>
          <input
            type="number"
            min="1"
            value={form.pages}
            onChange={(e) => updateField("pages", e.target.value)}
            className="w-full border border-charcoal/25 bg-white px-3 py-2.5 text-sm"
          />
        </Field>

        <Field label="Short description">
          <textarea
            rows={2}
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            className="w-full border border-charcoal/25 bg-white px-3 py-2.5 text-sm"
          />
        </Field>

        <Field label="Full description">
          <textarea
            rows={4}
            value={form.long_description}
            onChange={(e) => updateField("long_description", e.target.value)}
            className="w-full border border-charcoal/25 bg-white px-3 py-2.5 text-sm"
          />
        </Field>

        <Field label="Short intro video (optional, shown at the top of the product page — leave blank to keep current)">
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setIntroVideo(e.target.files?.[0] || null)}
            className="w-full text-sm"
          />
        </Field>

        <Field label="Replace cover image (leave blank to keep current)">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
            className="w-full text-sm"
          />
        </Field>

        <Field label="Replace main file (leave blank to keep current)">
          <input
            type="file"
            onChange={(e) => setMainFile(e.target.files?.[0] || null)}
            className="w-full text-sm"
          />
        </Field>

        <div className="rule pt-4">
          <p className="text-sm mb-3">Bonus item</p>
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
                    className="w-full border border-charcoal/25 bg-white px-3 py-2.5 text-sm"
                  />
                </Field>
              </div>
              <div className="mt-4">
                <Field label="Replace bonus file (leave blank to keep current)">
                  <input
                    type="file"
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
          {submitting ? "Saving…" : "Save changes"}
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
