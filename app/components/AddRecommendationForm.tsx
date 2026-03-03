// app/components/AddRecommendationForm.tsx
"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const GENRES = [
  "Action", "Comedy", "Horror", "Sci-Fi", "Drama",
  "Thriller", "Romance", "Documentary", "Animation", "Fantasy", "Music", "Other",
];

interface AddRecommendationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AddRecommendationForm({
  onSuccess,
  onCancel,
}: AddRecommendationFormProps) {
  const add = useMutation(api.recommendations.add);

  const [form, setForm] = useState({
    title: "",
    genre: "Action",
    link: "",
    blurb: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.title.trim()) { setError("Title is required."); return; }
    if (!form.blurb.trim()) { setError("Blurb is required."); return; }
    if (!form.link.trim())  { setError("Link is required."); return; }

    // Basic URL sanity check
    try { new URL(form.link); } catch {
      setError("Link must be a valid URL (include https://)."); return;
    }

    setIsSubmitting(true);
    try {
      await add(form);
      setForm({ title: "", genre: "Action", link: "", blurb: "" });
      onSuccess?.();
    } catch (err: unknown) {
      setError((err as Error).message ?? "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900">Add to the Shelf</h3>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 text-sm cursor-pointer"
          >
            ✕ Cancel
          </button>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Title */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            value={form.title}
            onChange={set("title")}
            placeholder="e.g. Interstellar"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {/* Genre */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Genre
          </label>
          <select
            value={form.genre}
            onChange={set("genre")}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            {GENRES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Link */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Link <span className="text-red-400">*</span>
        </label>
        <input
          value={form.link}
          onChange={set("link")}
          placeholder="https://www.imdb.com/title/..."
          type="url"
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      {/* Blurb */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Why are you hyped? <span className="text-red-400">*</span>
        </label>
        <textarea
          value={form.blurb}
          onChange={set("blurb")}
          placeholder="A short, honest pitch for your friends..."
          rows={2}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? "Adding…" : "Add to Shelf"}
        </button>
      </div>
    </form>
  );
}
