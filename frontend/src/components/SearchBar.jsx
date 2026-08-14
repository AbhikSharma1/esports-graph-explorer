import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { api } from "../api";

const labelMeta = {
  Player:     { color: "text-indigo-400",  bg: "bg-indigo-500/10 border-indigo-500/20" },
  Team:       { color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20"   },
  Tournament: { color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20"},
  GameRole:   { color: "text-pink-400",    bg: "bg-pink-500/10 border-pink-500/20"     },
};

export function SearchBar({ onSelect }) {
  const [query, setQuery]       = useState("");
  const [results, setResults]   = useState([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen]         = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef  = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handler(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleChange(e) {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    if (!val.trim()) { setResults([]); setOpen(false); return; }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      setOpen(true);
      try {
        const data = await api.search(val.trim());
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 280);
  }

  function clear() {
    setQuery("");
    setResults([]);
    setOpen(false);
  }

  return (
    <div ref={wrapperRef} className="relative w-72">
      {/* Input */}
      <div className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl border transition-all duration-200 ${
        open
          ? "bg-[#0f1220] border-indigo-500/40 shadow-[0_0_0_3px_rgba(99,102,241,0.1)]"
          : "bg-white/[0.04] border-white/[0.08] hover:border-white/20"
      }`}>
        <Search size={14} className={open ? "text-indigo-400" : "text-slate-500"} />
        <input
          value={query}
          onChange={handleChange}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search players, teams..."
          className="bg-transparent text-sm text-white placeholder-slate-600 outline-none flex-1 min-w-0"
        />
        {query && (
          <button onClick={clear} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X size={13} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full mt-2 w-full bg-[#0c0f1e] border border-white/[0.08] rounded-xl shadow-2xl z-50 overflow-hidden">
          {searching ? (
            <div className="flex items-center gap-2 px-4 py-3">
              <div className="w-3 h-3 border border-indigo-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-slate-500">Searching...</span>
            </div>
          ) : results.length === 0 ? (
            <p className="text-xs text-slate-600 px-4 py-3">No results found</p>
          ) : (
            results.map((r) => {
              const meta = labelMeta[r.labels[0]] || { color: "text-slate-400", bg: "bg-white/5 border-white/10" };
              return (
                <button
                  key={r.id}
                  onClick={() => { onSelect(r); clear(); }}
                  className="w-full text-left px-4 py-2.5 hover:bg-white/[0.04] flex items-center gap-3 transition-colors border-b border-white/[0.04] last:border-0"
                >
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${meta.color} ${meta.bg}`}>
                    {r.labels[0]}
                  </span>
                  <span className="text-sm text-slate-200 truncate">
                    {r.props.name || r.props.title}
                  </span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
