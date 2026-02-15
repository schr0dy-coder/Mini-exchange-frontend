import { useState, useEffect, useRef } from "react";
import { getSymbols } from "../api/api";

const DEBOUNCE_MS = 200;

export default function SymbolSearch({ value, onChange, placeholder = "Search symbol…" }) {
  const [query, setQuery] = useState("");
  const [symbols, setSymbols] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      getSymbols(query)
        .then((list) => setSymbols(Array.isArray(list) ? list : []))
        .catch((err) => {
          setError(err.message || "Failed to load symbols");
          setSymbols([]);
        })
        .finally(() => {
          setLoading(false);
          debounceRef.current = null;
        });
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, open]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayValue = open ? query : (value || "");
  const showDropdown = open && (query !== "" || symbols.length > 0);

  return (
    <div className="relative w-full max-w-xs" ref={containerRef}>
      <div className="flex rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-bg)] overflow-hidden focus-within:border-[var(--color-border-focus)] transition-colors">
        <span className="flex items-center px-3 text-[var(--color-text-muted)] text-sm shrink-0">
          Symbol
        </span>
        <input
          type="text"
          value={displayValue}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setOpen(false);
              setQuery("");
            }
          }}
          placeholder={placeholder}
          className="flex-1 min-w-0 py-2 pr-3 bg-transparent text-[var(--color-text)] placeholder-[var(--color-text-muted)] text-sm outline-none"
        />
      </div>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg z-20 max-h-60 overflow-y-auto animate-fade-in">
          {loading ? (
            <div className="px-4 py-3 text-sm text-[var(--color-text-muted)]">
              Searching…
            </div>
          ) : error ? (
            <div className="px-4 py-3 text-sm text-red-400">{error}</div>
          ) : symbols.length === 0 ? (
            <div className="px-4 py-3 text-sm text-[var(--color-text-muted)]">
              No symbols found
            </div>
          ) : (
            <ul className="py-1">
              {symbols.map((name) => (
                <li key={name}>
                  <button
                    type="button"
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      value === name
                        ? "bg-[var(--color-accent)]/20 text-[var(--color-accent)]"
                        : "text-[var(--color-text)] hover:bg-[var(--color-surface-elevated)]"
                    }`}
                    onClick={() => {
                      onChange(name);
                      setQuery("");
                      setOpen(false);
                    }}
                  >
                    {name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
