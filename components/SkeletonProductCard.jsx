"use client";
import React from "react";

// SkeletonProductCard: lightweight skeleton used while lists fetch data.
// Implemented with Tailwind utility classes (animated pulse).
// If you prefer a more expressive entrance animation, use Framer Motion's
// layout and animate variants for staggered reveals.

export default function SkeletonProductCard() {
  return (
    <div className="w-full bg-white dark:bg-[#262626] rounded-2xl border border-transparent overflow-hidden shadow-sm">
      <div className="w-full bg-[#2a2a2a] animate-pulse" style={{ aspectRatio: '5/4' }} />
      <div className="p-4">
        <div className="h-4 bg-[#2a2a2a] rounded w-3/4 animate-pulse" />
        <div className="mt-3 h-3 bg-[#2a2a2a] rounded w-1/3 animate-pulse" />
      </div>
    </div>
  );
}
