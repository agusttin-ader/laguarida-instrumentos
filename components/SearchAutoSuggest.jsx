"use client";
import React, { useState, useEffect, useRef } from "react";

// SearchAutoSuggest: simple autosuggest input.
// - Uses local `suggestions` prop to filter suggestions.
// - Debounces input to avoid excessive work. For async suggestions, replace
//   filter logic with fetch and use `loading` state + Skeleton components.
// - For animated dropdowns, Framer Motion can provide smoother entrance/exit.

export default function SearchAutoSuggest({ suggestions = [], placeholder = "Buscar...", onSelect }) {
  const [value, setValue] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (!value) {
        setResults([]);
        setOpen(false);
        return;
      }
      const q = value.toLowerCase();
      const matches = suggestions.filter((s) => s.toLowerCase().includes(q)).slice(0, 6);
      setResults(matches);
      setOpen(matches.length > 0);
    }, 200);

    return () => clearTimeout(handler);
  }, [value, suggestions]);

  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => value && results.length && setOpen(true)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-md border bg-neutral-50 dark:bg-neutral-800 text-sm"
        aria-autocomplete="list"
        aria-expanded={open}
      />

      {open && (
        <ul role="listbox" className="absolute left-0 right-0 mt-2 bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-md shadow-md z-40 overflow-hidden">
          {results.map((r) => (
            <li
              key={r}
              role="option"
              onClick={() => {
                setValue(r);
                setOpen(false);
                onSelect?.(r);
              }}
              className="px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
            >
              {r}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
