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
              Selección destacada
            </Link>
          </li>
          <li>
            <Link href="/#about-section" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800">
              Sobre nosotros
            </Link>
          </li>
          <li>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat por WhatsApp"
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center w-10 h-10 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M12 3.2a8.8 8.8 0 0 0-7.56 13.3L3.2 20.8l4.44-1.16A8.8 8.8 0 1 0 12 3.2Z" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9.36 8.9c.1-.22.18-.23.34-.24h.28c.1 0 .24.04.3.17.12.26.4 1 .44 1.08.04.08.06.18 0 .28-.06.1-.1.16-.2.24-.1.08-.2.18-.28.24-.1.1-.2.2-.08.4.12.2.54.9 1.16 1.44.8.7 1.46.9 1.66 1 .2.1.32.08.44-.04.12-.12.5-.58.64-.78.14-.2.28-.16.46-.1.2.08 1.2.56 1.4.66.2.1.34.14.38.22.04.08.04.5-.12.98-.16.48-.92.92-1.26.98-.34.06-.76.1-1.24-.06-.3-.1-.68-.22-1.18-.44-2.08-.9-3.44-3.02-3.54-3.16-.1-.14-.84-1.12-.84-2.14 0-1.02.54-1.52.74-1.72Z" fill="currentColor" />
              </svg>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
}
