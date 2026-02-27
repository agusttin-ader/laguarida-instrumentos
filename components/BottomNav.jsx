"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
      <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function BottomNav() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const itemClass = "flex flex-col items-center justify-center min-h-touch py-2 text-sm transition-colors";
  const activeClass = "text-[#f7efe0]";
  const mutedClass = "text-gray-400 hover:text-white";

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#121316]/92 backdrop-blur-xl h-[68px] flex items-center justify-around px-3 pb-[env(safe-area-inset-bottom)]" aria-label="Navegación principal">
      <Link href="/" aria-label="Inicio" className={`${itemClass} ${isHome ? activeClass : mutedClass}`}>
        <IconHome className="flex-shrink-0" />
        <span className="text-[11px] mt-1 font-medium">Inicio</span>
      </Link>

      <Link href="/#seleccion-destacada" aria-label="Catálogo" className={`${itemClass} ${isHome ? activeClass : mutedClass}`}>
        <IconGrid className="flex-shrink-0" />
        <span className="text-[11px] mt-1 font-medium">Catálogo</span>
      </Link>

      <Link href="/#about-section" aria-label="Sobre nosotros" className={`${itemClass} ${isHome ? activeClass : mutedClass}`}>
        <IconHeart className="flex-shrink-0" />
        <span className="text-[11px] mt-1 font-medium">Sobre</span>
      </Link>

      <a href="https://wa.me/541168696491" aria-label="Chat por WhatsApp" className={`${itemClass} ${mutedClass}`}>
        <IconChat className="flex-shrink-0" />
        <span className="text-[11px] mt-1 font-medium">Chat</span>
      </a>
    </nav>
  );
}
