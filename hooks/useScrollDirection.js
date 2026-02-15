"use client";
import { useEffect, useRef, useState } from "react";

// useScrollDirection: returns 'up' or 'down' based on user's scroll.
// Uses a small threshold and requestAnimationFrame for perf.
export default function useScrollDirection({ threshold = 10, initial = "up" } = {}) {
  const [direction, setDirection] = useState(initial);
  const lastY = useRef(typeof window !== "undefined" ? window.scrollY : 0);
  const ticking = useRef(false);

  useEffect(() => {
    function onScroll() {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const dy = y - lastY.current;
        if (Math.abs(dy) > threshold) {
          setDirection(dy > 0 ? "down" : "up");
          lastY.current = y;
        }
        ticking.current = false;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return direction;
}
