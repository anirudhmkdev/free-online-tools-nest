import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useId,
  useMemo,
} from "react";
import {
  findSearchEntries,
  readSearchData,
  serializeSearchData,
} from "../helpers/search";
import type { Lang } from "../i18n/ui";

// Vite removes this branch and its editorial-data imports from the client build.
const serverSearch = import.meta.env.SSR
  ? await import("../data/search")
  : undefined;

interface Props {
  lang?: Lang;
}
export default function CmdKSearch({ lang = "en" }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const listId = useId();
  const data = useMemo(
    () =>
      serverSearch
        ? serverSearch.buildSearchData(lang, lang === "en")
        : readSearchData()!,
    [lang],
  );
  const { entries: allResults, labels } = data;

  useEffect(() => {
    function rememberFocus() {
      const active = document.activeElement as HTMLElement | null;
      const menu = active?.closest<HTMLDialogElement>("#mobile-menu");
      returnFocusRef.current =
        menu && !menu.open
          ? document.getElementById("mobile-menu-btn")
          : active;
    }
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (!open) rememberFocus();
        setOpen((prev) => !prev);
      }
    }
    function openHandler() {
      if (!open) rememberFocus();
      setOpen(true);
    }
    document.addEventListener("keydown", handler);
    document.addEventListener("open-cmdk", openHandler);
    return () => {
      document.removeEventListener("keydown", handler);
      document.removeEventListener("open-cmdk", openHandler);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    setQuery("");
    setSelectedIndex(0);
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      const target = returnFocusRef.current;
      (target?.isConnected && target.getClientRects().length
        ? target
        : document.getElementById("cmd-k-trigger")
      )?.focus({ preventScroll: true });
    };
  }, [open]);

  const matches = findSearchEntries(allResults, query);

  const navigate = useCallback((url: string) => {
    setOpen(false);
    window.location.href = url;
  }, []);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(0, Math.min(i + 1, matches.length - 1)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && matches[selectedIndex]) {
      e.preventDefault();
      navigate(matches[selectedIndex].url);
    }
  }

  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.children[selectedIndex] as
      | HTMLElement
      | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex, query, open]);

  return (
    <>
      <script
        id="site-search-data"
        type="application/json"
        dangerouslySetInnerHTML={{ __html: serializeSearchData(data) }}
      />
      <dialog
        ref={dialogRef}
        className="fixed inset-0 m-0 h-full max-h-none w-full max-w-none border-0 bg-transparent p-4 pt-[15vh] text-ink open:flex items-start justify-center backdrop:bg-black/40 backdrop:backdrop-blur-sm"
        aria-label={labels.title}
        onCancel={(event) => {
          event.preventDefault();
          setOpen(false);
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) setOpen(false);
        }}
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const controls = [
            ...event.currentTarget.querySelectorAll<HTMLElement>(
              'input, button:not([tabindex="-1"])',
            ),
          ];
          const first = controls[0],
            last = controls[controls.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
      >
        <div
          ref={overlayRef}
          className="flex max-h-[80dvh] w-full max-w-lg flex-col bg-canvas rounded-xl shadow-modal border border-hairline overflow-hidden motion-safe:animate-[fade-in-up_150ms_ease-out]"
        >
          <div className="relative border-b border-hairline">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 text-mute pointer-events-none"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={open}
              aria-controls={listId}
              aria-activedescendant={
                matches[selectedIndex]
                  ? `${listId}-${selectedIndex}`
                  : undefined
              }
              placeholder={labels.placeholder}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={onKeyDown}
              className="w-full h-12 pl-12 pr-14 bg-transparent text-base text-ink placeholder:text-mute outline-none"
              aria-label={labels.title}
              autoComplete="off"
            />
            <button
              type="button"
              className="absolute right-1 top-0.5 flex h-11 w-11 items-center justify-center rounded-lg text-body hover:bg-canvas-soft-2"
              aria-label={labels.close}
              onClick={() => setOpen(false)}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            </button>
          </div>

          {matches.length === 0 && (
            <div
              role="status"
              className="break-words px-3 py-8 text-center text-sm text-mute"
            >
              {labels.noResults.replace("{query}", query)}
            </div>
          )}
          <div
            id={listId}
            ref={listRef}
            className="min-h-0 max-h-80 overflow-y-auto p-2"
            role="listbox"
            aria-label={labels.title}
          >
            {matches.map((result, i) => (
              <button
                key={result.url}
                id={`${listId}-${i}`}
                type="button"
                tabIndex={-1}
                role="option"
                aria-selected={i === selectedIndex}
                onClick={() => navigate(result.url)}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setSelectedIndex(i)}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left transition-colors duration-75 cursor-pointer ${
                  i === selectedIndex
                    ? "bg-canvas-soft-2"
                    : "hover:bg-canvas-soft-2"
                }`}
              >
                <span className="text-lg shrink-0" aria-hidden="true">
                  {result.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-ink">
                    {result.name}
                  </div>
                  <div className="text-xs text-mute truncate">
                    {result.description}
                  </div>
                </div>
                <span className="text-[10px] font-mono uppercase text-mute shrink-0 px-1.5 py-0.5 rounded bg-canvas-soft border border-hairline">
                  {result.type === "category" ? labels.category : labels.tool}
                </span>
              </button>
            ))}
          </div>
        </div>
      </dialog>
    </>
  );
}
