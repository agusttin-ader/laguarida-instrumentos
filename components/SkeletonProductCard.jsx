"use client";
import React from "react";

// SkeletonProductCard: lightweight skeleton used while lists fetch data.
// Implemented with Tailwind utility classes (animated pulse).
// If you prefer a more expressive entrance animation, use Framer Motion's
// layout and animate variants for staggered reveals.

export default function SkeletonProductCard() {
  return (
    <div className="w-full flex flex-col rounded-lg overflow-hidden bg-[var(--dark-bg-card)] border border-[var(--dark-border)]">
      <div className="md:hidden px-4 pt-4 pb-4 bg-[var(--dark-bg-elevated)] border-b border-[var(--dark-border)] rounded-t-lg">
        <div className="flex items-start justify-between gap-2">
          <div className="h-5 bg-[var(--dark-surface-2)] rounded w-3/4 animate-pulse" />
          <div className="h-5 w-16 bg-[var(--dark-surface-2)] rounded-full animate-pulse shrink-0" />
        </div>
        <div className="mt-2 h-3.5 bg-[var(--dark-surface-2)] rounded w-full animate-pulse" />
        <div className="mt-2 h-3.5 bg-[var(--dark-surface-2)] rounded w-2/3 animate-pulse" />
        <div className="mt-3 flex flex-row items-center justify-between gap-3">
          <div className="h-5 w-20 bg-[var(--dark-surface-2)] rounded animate-pulse" />
          <div className="h-11 w-28 bg-[var(--dark-surface-2)] rounded-xl animate-pulse" />
        </div>
      </div>
      <div className="w-full bg-[var(--dark-surface-2)] animate-pulse aspect-[4/3] md:aspect-[5/4] rounded-b-lg md:rounded-none" />
    </div>
  );
}
