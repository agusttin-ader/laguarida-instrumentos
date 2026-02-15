"use client";
import { useEffect, useState } from "react";

// useScrollColor: returns true when page is scrolled past threshold.
// Usage: in header components to toggle classes for smooth color transitions.
// Implementation uses plain scroll listener + requestAnimationFrame for perf.
// Animation approach: Tailwind's `transition-colors` is used to smoothly interpolate
// between background colors. For more advanced motion (parallax, spring), consider
// Framer Motion and its `useViewportScroll` / `useTransform` utilities.

export default function useScrollColor(threshold = 32) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let raf = null;

    function onScroll() {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setScrolled(window.scrollY > threshold);
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [threshold]);

  return scrolled;
}
