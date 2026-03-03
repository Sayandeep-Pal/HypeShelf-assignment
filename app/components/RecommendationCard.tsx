// app/components/RecommendationCard.tsx
"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Recommendation {
  _id: Id<"recommendations">;
  title: string;
  genre: string;
  link: string;
  blurb: string;
  authorId: string;
  authorName: string;
  isStaffPick?: boolean;
}

interface RecommendationCardProps {
  rec: Recommendation;
  /** Clerk user ID of the currently signed-in user */
  currentUserId?: string;
  /** Role resolved from the Convex `users` table */
  role?: "admin" | "user" | null;
  /** When true hides all interactive controls (used on public page) */
  readOnly?: boolean;
}

// ─── Genre colour map ─────────────────────────────────────────────────────────

const GENRE_COLORS: Record<string, string> = {
  Action:        "bg-red-100 text-red-700 border-red-200",
  Comedy:        "bg-yellow-100 text-yellow-700 border-yellow-200",
  Horror:        "bg-gray-800 text-gray-100 border-gray-700",
  "Sci-Fi":      "bg-blue-100 text-blue-700 border-blue-200",
  Drama:         "bg-purple-100 text-purple-700 border-purple-200",
  Thriller:      "bg-orange-100 text-orange-700 border-orange-200",
  Romance:       "bg-pink-100 text-pink-700 border-pink-200",
  Documentary:   "bg-green-100 text-green-700 border-green-200",
  Animation:     "bg-teal-100 text-teal-700 border-teal-200",
  Fantasy:       "bg-violet-100 text-violet-700 border-violet-200",
  Music:         "bg-indigo-100 text-indigo-700 border-indigo-200",
  Other:         "bg-gray-100 text-gray-700 border-gray-200",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function RecommendationCard({
  rec,
  currentUserId,
  role,
  readOnly = false,
}: RecommendationCardProps) {
  const remove          = useMutation(api.recommendations.remove);
  const toggleStaffPick = useMutation(api.recommendations.toggleStaffPick);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pickLoading,  setPickLoading]  = useState(false);

  const isAdmin  = role === "admin";
  const isOwner  = rec.authorId === currentUserId;
  const canDelete = isAdmin || isOwner;

  const handleDelete = async () => {
    if (!confirm(`Delete "${rec.title}"?`)) return;
    setIsDeleting(true);
    try {
      await remove({ id: rec._id });
    } catch (err: unknown) {
      alert((err as Error).message ?? "Delete failed.");
      setIsDeleting(false);
    }
    // Note: no need to reset — the card will unmount when Convex removes the record
  };

  const handleToggleStaffPick = async () => {
    setPickLoading(true);
    try {
      await toggleStaffPick({ id: rec._id, isStaffPick: !rec.isStaffPick });
    } catch (err: unknown) {
      alert((err as Error).message ?? "Failed to update staff pick.");
    } finally {
      setPickLoading(false);
    }
  };

  const genreClass =
    GENRE_COLORS[rec.genre] ?? "bg-gray-100 text-gray-700 border-gray-200";

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <h3 className="font-bold text-gray-900 text-base leading-snug truncate">
            {rec.title}
          </h3>
          {rec.isStaffPick && (
            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-amber-200 whitespace-nowrap">
              ⭐ Staff Pick
            </span>
          )}
        </div>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full border whitespace-nowrap shrink-0 ${genreClass}`}
        >
          {rec.genre}
        </span>
      </div>

      {/* Blurb */}
      <p className="text-gray-600 text-sm leading-relaxed">{rec.blurb}</p>

      {/* Footer row */}
      <div className="flex items-center justify-between gap-2 text-sm">
        <a
          href={rec.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
        >
          Check it out →
        </a>
        <span className="text-xs text-gray-400 shrink-0">
          by {rec.authorName}
        </span>
      </div>

      {/* Action row — only visible when authenticated */}
      {!readOnly && (isAdmin || canDelete) && (
        <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
          {/* Staff pick toggle — admins only */}
          {isAdmin && (
            <button
              onClick={handleToggleStaffPick}
              disabled={pickLoading}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-colors disabled:opacity-50 cursor-pointer ${
                rec.isStaffPick
                  ? "border-amber-300 text-amber-700 hover:bg-amber-50"
                  : "border-gray-200 text-gray-500 hover:border-amber-300 hover:text-amber-700"
              }`}
            >
              {pickLoading
                ? "…"
                : rec.isStaffPick
                ? "Remove Staff Pick"
                : "⭐ Staff Pick"}
            </button>
          )}

          {/* Delete — visible to owner or admin */}
          {canDelete && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="ml-auto text-xs px-2.5 py-1 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
