"use client";
import React, { useEffect } from "react";
import Link from "next/link";

export default function MenuDrawer({ open, setOpen }) {
  const waHref = `https://wa.me/5491154661749?text=${encodeURIComponent('Hola, me interesa La Guarida, me podrias dar informacion?')}`

  useEffect(() => {
    try {
      if (open) {
        document.body.classList.add("menu-open");
      } else {
        document.body.classList.remove("menu-open");
      }
    } catch { /* empty */ }

    return () => {
      try {
        document.body.classList.remove("menu-open");
      } catch { /* empty */ }
    };
  }, [open]);

  return (
    <div className={`fixed inset-0 z-40 ${open ? "" : "pointer-events-none"}`}>
      <div
        aria-hidden={!open}
        role="button"
        tabIndex={0}
        aria-label="Cerrar menú"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(false) } }}
        onClick={() => setOpen(false)}
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
      />

      <nav
        className={`fixed top-0 left-0 bottom-0 w-72 max-w-[80%] bg-white dark:bg-neutral-900 border-r border-gray-200 dark:border-neutral-800 transform transition-transform duration-300 shadow-lg ${open ? "translate-x-0" : "-translate-x-full"}`}
        aria-hidden={!open}
      >
        <div className="h-14 flex items-center px-4 border-b border-gray-100 dark:border-neutral-800">
          <button onClick={() => setOpen(false)} aria-label="Cerrar" className="text-neutral-900 dark:text-neutral-100">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <ul className="p-4 space-y-2">
          <li>
            <Link href="/" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800">
              Inicio
            </Link>
          </li>
          <li>
            <Link href="/#seleccion-destacada" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800">
              Catálogo
            </Link>
          </li>
          <li>
            <Link href="/#about-section" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800">
              Sobre nosotros
            </Link>
          </li>
          <li>
            <a href={waHref} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800">
              Chat / Contacto
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
}
