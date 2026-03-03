// app/components/GenreFilter.tsx
"use client";

export const GENRES = [
  "All",
  "Action",
  "Comedy",
  "Horror",
  "Sci-Fi",
  "Drama",
  "Thriller",
  "Romance",
  "Documentary",
  "Animation",
  "Fantasy",
  "Music",
  "Other",
] as const;

interface GenreFilterProps {
  selected: string;
  onChange: (genre: string) => void;
  counts?: Record<string, number>;
}

export function GenreFilter({ selected, onChange, counts }: GenreFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {GENRES.map((genre) => {
        const count = genre === "All" ? undefined : counts?.[genre];
        return (
          <button
            key={genre}
            onClick={() => onChange(genre)}
            className={`text-sm px-3 py-1.5 rounded-full border font-medium transition-colors cursor-pointer ${
              selected === genre
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-indigo-400 hover:text-indigo-600"
            }`}
          >
            {genre}
            {count !== undefined && (
              <span className="ml-1.5 opacity-60 text-xs">({count})</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
