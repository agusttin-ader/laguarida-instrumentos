"use client";
import React, { useState } from "react";
import SearchAutoSuggest from "./SearchAutoSuggest";
import FilterModal from "./FilterModal";
import useScrollDirection from "../hooks/useScrollDirection";

// FilterBar: compact bar with search autosuggest and a button to open the full-screen filter modal.
// - SearchAutoSuggest handles inline search with auto-suggestions.
// - FilterModal slides up from bottom. Tailwind transitions used; Framer Motion can be
//   used instead for spring-based motion.

export default function FilterBar({ categories = [], onFilter }) {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState({ categories: [], priceMin: "", priceMax: "" });
  const dir = useScrollDirection();

  function applyFilters(newFilters) {
    setFilters(newFilters);
    onFilter?.(newFilters);
  }

  return (
    <div className={`sticky top-14 z-40 bg-white dark:bg-black/80 px-4 py-3 border-b border-gray-100 dark:border-neutral-800 flex gap-3 items-center transition-transform duration-300 ${dir === 'down' ? '-translate-y-full' : 'translate-y-0'}`}>
      <div className="flex-1">
        <SearchAutoSuggest
          suggestions={categories}
          placeholder="Buscar instrumentos o modelos"
          onSelect={(q) => onFilter?.({ ...filters, q })}
        />
      </div>

      <button
        onClick={() => setOpen(true)}
        className="ml-3 inline-flex items-center gap-2 px-3 py-2 border rounded-md text-sm text-neutral-900 dark:text-neutral-100"
        aria-expanded={open}
        aria-controls="filter-modal"
      >
        Filtros
      </button>

      <FilterModal open={open} setOpen={setOpen} categories={categories} filters={filters} onApply={applyFilters} />
    </div>
  );
}
