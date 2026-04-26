"use client";
import React from "react";

// SkeletonProductCard: lightweight skeleton used while lists fetch data.
// Implemented with Tailwind utility classes (animated pulse).
// If you prefer a more expressive entrance animation, use Framer Motion's
// layout and animate variants for staggered reveals.

export default function SkeletonProductCard() {
  return (
    <div className="flex w-full flex-col overflow-hidden rounded-2xl border-0 bg-[var(--dark-bg-card)] md:rounded-3xl">
      <div className="rounded-t-2xl bg-[var(--dark-bg-elevated)] px-4 pb-4 pt-4 md:hidden">
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
      <div className="aspect-[4/5] w-full animate-pulse rounded-b-2xl bg-[var(--dark-surface-2)] md:aspect-[3/4] md:rounded-none" />
    </div>
  );
}
