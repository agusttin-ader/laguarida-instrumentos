"use client";
import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

function IconHome() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 11.5L12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-8.5z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconGrid() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="13" y="3" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="3" y="13" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="13" y="13" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function IconHeart() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.8 7.6c0 5.8-8.8 11.4-8.8 11.4S3.2 13.4 3.2 7.6C3.2 5 5 3.2 7.6 3.2c1.7 0 3.3.9 4.4 2.3 1.1-1.4 2.7-2.3 4.4-2.3 2.6 0 4.4 1.8 4.4 4.4z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconChat() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3.2a8.8 8.8 0 0 0-7.56 13.3L3.2 20.8l4.44-1.16A8.8 8.8 0 1 0 12 3.2Z" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.36 8.9c.1-.22.18-.23.34-.24h.28c.1 0 .24.04.3.17.12.26.4 1 .44 1.08.04.08.06.18 0 .28-.06.1-.1.16-.2.24-.1.08-.2.18-.28.24-.1.1-.2.2-.08.4.12.2.54.9 1.16 1.44.8.7 1.46.9 1.66 1 .2.1.32.08.44-.04.12-.12.5-.58.64-.78.14-.2.28-.16.46-.1.2.08 1.2.56 1.4.66.2.1.34.14.38.22.04.08.04.5-.12.98-.16.48-.92.92-1.26.98-.34.06-.76.1-1.24-.06-.3-.1-.68-.22-1.18-.44-2.08-.9-3.44-3.02-3.54-3.16-.1-.14-.84-1.12-.84-2.14 0-1.02.54-1.52.74-1.72Z" fill="currentColor" />
    </svg>
  );
}

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const itemClass = "flex flex-col items-center justify-center min-h-touch py-2 text-sm transition-colors";
  const activeClass = "text-[#f7efe0]";
  const mutedClass = "text-gray-400 hover:text-white";

  function smoothScrollTo(sectionId) {
    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function handleHomeNav(e) {
    e.preventDefault();
    if (isHome) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    try { sessionStorage.setItem("pending-scroll-target", "home-top"); } catch { /* empty */ }
    router.push("/");
  }

  function handleSectionNav(e, sectionId) {
    e.preventDefault();
    if (isHome) {
      smoothScrollTo(sectionId);
      return;
    }
    try { sessionStorage.setItem("pending-scroll-target", sectionId); } catch { /* empty */ }
    router.push("/");
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#121316]/92 backdrop-blur-xl h-[68px] flex items-center justify-around px-3 pb-[env(safe-area-inset-bottom)]" aria-label="Navegación principal">
      <Link href="/" onClick={handleHomeNav} aria-label="Inicio" className={`${itemClass} ${isHome ? activeClass : mutedClass}`}>
        <IconHome className="flex-shrink-0" />
        <span className="text-[11px] mt-1 font-medium">Inicio</span>
      </Link>

      <Link href="/#seleccion-destacada" onClick={(e) => handleSectionNav(e, "seleccion-destacada")} aria-label="Catálogo" className={`${itemClass} ${isHome ? activeClass : mutedClass}`}>
        <IconGrid className="flex-shrink-0" />
        <span className="text-[11px] mt-1 font-medium">Catálogo</span>
      </Link>

      <Link href="/#about-section" onClick={(e) => handleSectionNav(e, "about-section")} aria-label="Sobre nosotros" className={`${itemClass} ${isHome ? activeClass : mutedClass}`}>
        <IconHeart className="flex-shrink-0" />
        <span className="text-[11px] mt-1 font-medium">Sobre</span>
      </Link>

      <a href="https://wa.me/5491154661749" target="_blank" rel="noopener noreferrer" aria-label="Chat por WhatsApp" className={`${itemClass} ${mutedClass}`}>
        <IconChat className="flex-shrink-0" />
        <span className="text-[11px] mt-1 font-medium">Chat</span>
      </a>
    </nav>
  );
}
