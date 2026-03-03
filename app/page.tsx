// app/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

import { Navbar } from "./components/Navbar";
import { GenreFilter } from "./components/GenreFilter";
import { RecommendationCard } from "./components/RecommendationCard";
import { AddRecommendationForm } from "./components/AddRecommendationForm";

// ─────────────────────────────────────────────────────────────────────────────

export default function Home() {
  const { isSignedIn, user } = useUser();

  // ── Data ──────────────────────────────────────────────────────────────────
  // Public-page preview (latest 5 lightweight query)
  const latestRecs = useQuery(api.recommendations.getPublicLatest);
  // Full list — only fetched when authenticated.
  // skipToken tells Convex to pause the subscription without returning undefined-as-arg.
  const allRecs = useQuery(
    api.recommendations.getAll,
    isSignedIn ? {} : "skip"
  );
  const role = useQuery(
    api.users.getCurrentUserRole,
    isSignedIn ? {} : "skip"
  );
  const upsertUser = useMutation(api.users.upsertUser);

  // ── State ─────────────────────────────────────────────────────────────────
  const [genreFilter, setGenreFilter] = useState("All");
  const [showAddForm, setShowAddForm] = useState(false);

  // Ensure a user row exists in Convex as soon as someone signs in
  useEffect(() => {
    if (isSignedIn) {
      upsertUser({}).catch(console.error);
    }
  }, [isSignedIn, upsertUser]);

  // Client-side filtering
  const filteredRecs = useMemo(
    () =>
      (allRecs ?? []).filter(
        (rec: NonNullable<typeof allRecs>[number]) =>
          genreFilter === "All" || rec.genre === genreFilter
      ),
    [allRecs, genreFilter]
  );

  // Genre count map for filter pill badges
  const genreCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const rec of allRecs ?? []) {
      counts[rec.genre] = (counts[rec.genre] ?? 0) + 1;
    }
    return counts;
  }, [allRecs]);

  // ─────────────────────────────────────────────────────────────────────────
  // PUBLIC VIEW
  // ─────────────────────────────────────────────────────────────────────────
  if (!isSignedIn) {
    return (
      <>
        <Navbar />

        {/* Hero */}
        <section className="bg-linear-to-br from-indigo-600 via-indigo-500 to-purple-600 text-white">
          <div className="max-w-3xl mx-auto px-6 py-24 text-center">
            <div className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-6 backdrop-blur-sm">
              🔥 Shared by friends, for friends
            </div>
            <h1 className="text-5xl sm:text-6xl font-black mb-5 tracking-tight leading-tight">
              Your crew&apos;s<br />
              <span className="text-yellow-300">best picks</span>, collected.
            </h1>
            <p className="text-lg text-indigo-100 mb-10 max-w-md mx-auto">
              Collect and share the stuff you&apos;re hyped about — movies, shows, docs, anything. One shelf, all your friends.
            </p>
            <SignInButton mode="modal">
              <button className="bg-white text-indigo-700 font-bold px-8 py-3.5 rounded-xl text-base hover:bg-indigo-50 transition-colors shadow-xl cursor-pointer">
                Sign in to add yours →
              </button>
            </SignInButton>
          </div>
        </section>

        {/* Latest public picks preview */}
        <section className="max-w-3xl mx-auto px-6 py-14">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Latest Hype 🔥</h2>
            <span className="text-sm text-gray-400">Showing latest 5</span>
          </div>

          {latestRecs === undefined ? (
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : latestRecs.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-5xl mb-4">📚</p>
              <p className="font-medium">The shelf is empty. Sign in and kick things off!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {latestRecs.map((rec) => (
                <RecommendationCard key={rec._id} rec={rec} readOnly />
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="mt-10 text-center">
            <SignInButton mode="modal">
              <button className="text-indigo-600 font-semibold hover:underline text-sm cursor-pointer">
                Sign in to see everything &amp; add your picks →
              </button>
            </SignInButton>
          </div>
        </section>
      </>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // AUTHENTICATED VIEW
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <Navbar />

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Admin badge */}
        {role === "admin" && (
          <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium px-4 py-2.5 rounded-xl inline-flex items-center gap-2">
            🛡️ Admin mode — you can delete any pick and set Staff Picks.
          </div>
        )}

        {/* Add section */}
        <div className="mb-8">
          {showAddForm ? (
            <AddRecommendationForm
              onSuccess={() => setShowAddForm(false)}
              onCancel={() => setShowAddForm(false)}
            />
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full border-2 border-dashed border-indigo-200 hover:border-indigo-400 text-indigo-400 hover:text-indigo-600 rounded-xl py-4 text-sm font-medium transition-colors cursor-pointer"
            >
              + Add something to the shelf
            </button>
          )}
        </div>

        {/* Section heading + genre filter */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-gray-900">The Shelf</h2>
            {allRecs !== undefined && (
              <span className="text-sm text-gray-400">
                {filteredRecs.length}{" "}
                {filteredRecs.length === 1 ? "pick" : "picks"}
                {genreFilter !== "All" && ` in ${genreFilter}`}
              </span>
            )}
          </div>
          <GenreFilter
            selected={genreFilter}
            onChange={setGenreFilter}
            counts={genreCounts}
          />
        </div>

        {/* Recommendation list */}
        {allRecs === undefined ? (
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-36 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredRecs.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-4">🔍</p>
            <p className="font-medium">
              {genreFilter === "All"
                ? "Nothing on the shelf yet — add the first pick!"
                : `No ${genreFilter} picks yet.`}
            </p>
            {genreFilter !== "All" && (
              <button
                onClick={() => setGenreFilter("All")}
                className="mt-3 text-indigo-500 hover:underline text-sm cursor-pointer"
              >
                Clear filter
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredRecs.map((rec) => (
              <RecommendationCard
                key={rec._id}
                rec={rec}
                currentUserId={user?.id}
                role={role}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
