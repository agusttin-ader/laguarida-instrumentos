"use client";
import React, { useEffect, useState } from "react";

// FilterModal: full-screen modal sliding up from bottom with category & price filters.
// - Adds `modal-open` class on body to allow other UI (e.g., FloatingWhatsApp) to hide.
// - Uses Tailwind transitions for the slide; Framer Motion recommended for physics-based springs.

export default function FilterModal({ open, setOpen, categories = [], filters = {}, onApply }) {
  const [local, setLocal] = useState(filters || { categories: [], priceMin: "", priceMax: "" });

  useEffect(() => setLocal(filters || { categories: [], priceMin: "", priceMax: "" }), [filters]);

  useEffect(() => {
    try {
      if (open) document.body.classList.add("modal-open");
      else document.body.classList.remove("modal-open");
    } catch { /* empty */ }

    return () => {
      try {
        document.body.classList.remove("modal-open");
      } catch { /* empty */ }
    };
  }, [open]);

  function toggleCategory(cat) {
    setLocal((s) => ({
      ...s,
      categories: s.categories.includes(cat) ? s.categories.filter((c) => c !== cat) : [...s.categories, cat],
    }));
  }

  function apply() {
    onApply?.(local);
  }

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}>
      <div
        role="button"
        tabIndex={0}
        aria-label="Cerrar filtros"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(false) } }}
        onClick={() => setOpen(false)}
        className={`absolute inset-0 bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
      />

      <div
        className={`absolute left-0 right-0 bottom-0 bg-white dark:bg-neutral-900 rounded-t-xl shadow-xl transition-transform duration-300 ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ height: "85vh" }}
      >
        <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-neutral-800">
          <h3 className="text-lg font-semibold">Filtrar</h3>
          <button onClick={() => setOpen(false)} className="text-sm px-3 py-2">Cerrar</button>
        </div>

        <div className="p-4 overflow-auto h-[calc(85vh-64px)]">
          <section>
            <h4 className="font-medium mb-2">Categorías</h4>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`px-3 py-1 rounded-full border ${
                    local.categories.includes(cat)
                      ? "bg-[#C8102E] text-white border-transparent"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </section>

          <section className="mt-4">
            <h4 className="font-medium mb-2">Precio</h4>
            <div className="flex gap-2">
              <input
                type="number"
                value={local.priceMin}
                onChange={(e) => setLocal({ ...local, priceMin: e.target.value })}
                placeholder="Min"
                className="w-1/2 px-3 py-2 border rounded-md bg-neutral-50 dark:bg-neutral-800"
              />
              <input
                type="number"
                value={local.priceMax}
                onChange={(e) => setLocal({ ...local, priceMax: e.target.value })}
                placeholder="Max"
                className="w-1/2 px-3 py-2 border rounded-md bg-neutral-50 dark:bg-neutral-800"
              />
            </div>
          </section>
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-neutral-800 flex gap-2">
          <button
            onClick={() => setLocal({ categories: [], priceMin: "", priceMax: "" })}
            className="flex-1 py-3 rounded-md border"
          >
            Limpiar
          </button>
          <button
            onClick={() => {
              apply();
              setOpen(false);
            }}
            className="flex-1 py-3 rounded-md bg-[#C8102E] text-white"
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
}
