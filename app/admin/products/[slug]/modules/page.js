"use client";

import { useEffect, useState } from "react";
import AdminGate from "@/components/AdminGate";

export default function ModulesPage({ params }) {
  return <AdminGate>{(password) => <ModulesManager password={password} slug={params.slug} />}</AdminGate>;
}

function ModulesManager({ password, slug }) {
  const [modules, setModules] = useState(null);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState("video");
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function loadModules() {
    fetch("/api/admin/modules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, slug })
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not load modules.");
        return data;
      })
      .then((data) => setModules(data.items))
      .catch((err) => setError(err.message));
  }

  useEffect(loadModules, [password, slug]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!file || !title) return;
    setSubmitting(true);
    setError("");

    try {
      const body = new FormData();
      body.append("password", password);
      body.append("slug", slug);
      body.append("title", title);
      body.append("type", type);
      body.append("file", file);

      const res = await fetch("/api/admin/add-module", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");

      setTitle("");
      setFile(null);
      e.target.reset();
      loadModules();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    await fetch("/api/admin/delete-module", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, id })
    });
    loadModules();
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-16">
      <h1 className="font-serif text-2xl mb-1">Modules</h1>
      <p className="text-stone text-sm mb-8">{slug}</p>

      {error && <p className="text-sm text-burgundy mb-4">{error}</p>}

      {modules === null && <p className="text-sm text-stone mb-8">Loading…</p>}

      {modules && modules.length > 0 && (
        <ul className="space-y-2 mb-8">
          {modules.map((m, i) => (
            <li
              key={m.id}
              className="flex items-center justify-between border border-charcoal/15 px-4 py-3 text-sm"
            >
              <span>
                {i + 1}. {m.title} <span className="text-xs text-brass uppercase ml-1">{m.type}</span>
              </span>
              <button onClick={() => handleDelete(m.id)} className="text-burgundy text-xs underline">
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      {modules && modules.length === 0 && (
        <p className="text-sm text-stone mb-8">
          No modules yet. This product still works as a single item until you add at least one module.
        </p>
      )}

      <form onSubmit={handleAdd} className="space-y-4 border-t border-charcoal/10 pt-6">
        <p className="text-sm">Add a module</p>

        <div>
          <label className="block text-sm mb-1.5">Title</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Module 1: Getting Started"
            className="w-full border border-charcoal/25 bg-white px-3 py-2.5 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm mb-1.5">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full border border-charcoal/25 bg-white px-3 py-2.5 text-sm"
          >
            <option value="video">Video</option>
            <option value="audio">Audio</option>
            <option value="ebook">Ebook (PDF)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1.5">File</label>
          <input
            type="file"
            required
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-burgundy text-parchment px-6 py-3 text-sm hover:bg-burgundy/90 transition-colors disabled:opacity-60"
        >
          {submitting ? "Adding…" : "Add module"}
        </button>
      </form>
    </div>
  );
}
