"use client";
import React from "react";

// SkeletonProductCard: lightweight skeleton used while lists fetch data.
// Implemented with Tailwind utility classes (animated pulse).
// If you prefer a more expressive entrance animation, use Framer Motion's
// layout and animate variants for staggered reveals.

export default function SkeletonProductCard() {
  return (
    <div className="w-full bg-white dark:bg-[#1e1e22] rounded-2xl border border-transparent overflow-hidden shadow-sm">
      <div className="w-full bg-[#242428] animate-pulse" style={{ aspectRatio: '4/3' }} />
      <div className="p-4">
        <div className="h-4 bg-[#242428] rounded w-3/4 animate-pulse" />
        <div className="mt-3 h-3 bg-[#242428] rounded w-1/3 animate-pulse" />
      </div>
    </div>
  );
}
