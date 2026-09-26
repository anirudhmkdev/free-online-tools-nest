import { useState, useCallback, useEffect } from "react";

interface Props {
  toolSlug: string;
}

const STORAGE_KEY = "fotn-favorites";

function loadFavorites(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

function saveFavorites(favorites: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
}

export default function FavoriteButton({ toolSlug }: Props) {
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    setIsFav(loadFavorites().includes(toolSlug));
  }, [toolSlug]);

  const toggle = useCallback(() => {
    setIsFav((prev) => {
      const favs = loadFavorites();
      if (prev) {
        saveFavorites(favs.filter((s) => s !== toolSlug));
        return false;
      } else {
        saveFavorites([...favs, toolSlug]);
        return true;
      }
    });
  }, [toolSlug]);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={isFav}
      className="favorite-button inline-flex min-h-11 min-w-24 items-center justify-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-colors duration-150 cursor-pointer"
      style={{
        backgroundColor: isFav ? "var(--color-canvas-soft-2)" : "var(--color-canvas)",
        borderColor: isFav ? "var(--color-highlight-pink)" : "var(--color-hairline)",
        color: isFav ? "var(--color-ink)" : "var(--color-mute)",
      }}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill={isFav ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        style={{ color: isFav ? "var(--color-highlight-pink)" : "currentColor" }}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      {isFav ? "Saved" : "Save"}
    </button>
  );
}
