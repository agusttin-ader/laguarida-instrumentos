"use client";
import React from "react";
import Link from "next/link";

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
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-black/95 border-t border-gray-200 dark:border-neutral-800 h-16 flex items-center justify-around px-2">
      <Link href="/" aria-label="Inicio" className="flex flex-col items-center text-sm text-neutral-900 dark:text-neutral-100">
        <IconHome />
        <span className="text-[11px] mt-1">Inicio</span>
      </Link>

      <Link href="/categories" aria-label="Categorías" className="flex flex-col items-center text-sm text-neutral-900 dark:text-neutral-100">
        <IconGrid />
        <span className="text-[11px] mt-1">Categorías</span>
      </Link>

      <Link href="/favorites" aria-label="Favoritos" className="flex flex-col items-center text-sm text-neutral-900 dark:text-neutral-100">
        <IconHeart />
        <span className="text-[11px] mt-1">Favoritos</span>
      </Link>

      <a href="https://wa.me/541168696491" aria-label="Chat" className="flex flex-col items-center text-sm text-neutral-900 dark:text-neutral-100">
        <IconChat />
        <span className="text-[11px] mt-1">Chat</span>
      </a>
    </nav>
  );
}
