"use client";
import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const iconStroke = 1.8;

function IconHome() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 11.5L12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-8.5z" stroke="currentColor" strokeWidth={iconStroke} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconGrid() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="8" height="8" rx="1" stroke="currentColor" strokeWidth={iconStroke} />
      <rect x="13" y="3" width="8" height="8" rx="1" stroke="currentColor" strokeWidth={iconStroke} />
      <rect x="3" y="13" width="8" height="8" rx="1" stroke="currentColor" strokeWidth={iconStroke} />
      <rect x="13" y="13" width="8" height="8" rx="1" stroke="currentColor" strokeWidth={iconStroke} />
    </svg>
  );
}

function IconTag() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 10.586V5a1 1 0 011-1h5.586a1 1 0 01.707.293l8.5 8.5a1 1 0 010 1.414l-5.586 5.586a1 1 0 01-1.414 0l-8.5-8.5A1 1 0 014 10.586z" stroke="currentColor" strokeWidth={iconStroke} strokeLinejoin="round" />
      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
    </svg>
  );
}

function IconHeart() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.8 7.6c0 5.8-8.8 11.4-8.8 11.4S3.2 13.4 3.2 7.6C3.2 5 5 3.2 7.6 3.2c1.7 0 3.3.9 4.4 2.3 1.1-1.4 2.7-2.3 4.4-2.3 2.6 0 4.4 1.8 4.4 4.4z" stroke="currentColor" strokeWidth={iconStroke} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconInfo() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={iconStroke} />
      <path d="M12 10v6M12 8v0" stroke="currentColor" strokeWidth={iconStroke} strokeLinecap="round" />
    </svg>
  );
}

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isFavoritos = pathname === "/favoritos";
  const itemClass = "flex-1 flex flex-col items-center justify-center min-w-0 min-h-[48px] py-2.5 text-[11px] sm:text-xs font-medium bottom-nav-item active:scale-[0.97] transition-transform touch-manipulation";
  const activeClass = "text-white";
  const mutedClass = "text-white/92 hover:text-white";

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
    <nav className="bottom-nav-dock md:hidden fixed bottom-0 left-0 right-0 z-[var(--z-bottom-nav)] border-t border-white/15 bg-[var(--dark-bg-surface)]/65 backdrop-blur-xl min-h-[68px] flex items-stretch px-1 pt-1 pb-[env(safe-area-inset-bottom)]" aria-label="Navegación inferior">
      <Link href="/" onClick={handleHomeNav} aria-label="Inicio" className={`${itemClass} ${isHome ? activeClass : mutedClass}`}>
        <IconHome className="flex-shrink-0" />
        <span className="mt-1 whitespace-nowrap">Inicio</span>
      </Link>

      <Link href="/#seleccion-destacada" onClick={(e) => handleSectionNav(e, "seleccion-destacada")} aria-label="Selección destacada" className={`${itemClass} ${isHome ? activeClass : mutedClass}`}>
        <IconGrid className="flex-shrink-0" />
        <span className="mt-1 whitespace-nowrap">Selección</span>
      </Link>

      <Link href="/#low-cost" onClick={(e) => handleSectionNav(e, "low-cost")} aria-label="Low cost" className={`${itemClass} ${isHome ? activeClass : mutedClass}`}>
        <IconTag className="flex-shrink-0" />
        <span className="mt-1 whitespace-nowrap">Low cost</span>
      </Link>

      <Link href="/favoritos" aria-label="Tu selección" className={`${itemClass} ${isFavoritos ? activeClass : mutedClass}`}>
        <IconHeart className="flex-shrink-0" />
        <span className="mt-1 whitespace-nowrap">Favoritos</span>
      </Link>

      <Link href="/#about-section" onClick={(e) => handleSectionNav(e, "about-section")} aria-label="Sobre nosotros" className={`${itemClass} ${isHome ? activeClass : mutedClass}`}>
        <IconInfo className="flex-shrink-0" />
        <span className="mt-1 whitespace-nowrap">Sobre</span>
      </Link>
    </nav>
  );
}
