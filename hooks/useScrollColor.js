"use client";
import { useEffect, useState } from "react";

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
