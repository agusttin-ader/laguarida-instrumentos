"use client";
import React from "react";
import MobileHeader from "./MobileHeader";
import BottomNav from "./BottomNav";
import FloatingWhatsApp from "./FloatingWhatsApp";

export default function MobileLayout({ children }) {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-neutral-900 dark:text-neutral-100">
      <MobileHeader />

      <main className="pt-14 pb-20">{children}</main>

      <BottomNav />

      <FloatingWhatsApp />
    </div>
  );
}
