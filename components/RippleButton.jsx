"use client";
/* eslint-disable react/no-unknown-property */
import React from "react";

// RippleButton: simple press / ripple effect using minimal JS + Tailwind.
// Notes: Implemented with a small JS ripple to avoid a large dependency.
// For more advanced, physics-based motion use Framer Motion (recommended):
// - Framer Motion would provide easier control over spring/decay and orchestrated sequences.
// - Tailwind transitions are excellent for simple color/scale changes and perform well natively.

export default function RippleButton({ children, className = "", href, onClick, ...props }) {
  // Render as anchor if href provided, otherwise as button
  const Component = href ? "a" : "button";

  function handleClick(e) {
    // create ripple element
    const el = e.currentTarget;
    const circle = document.createElement("span");
    const diameter = Math.max(el.clientWidth, el.clientHeight);
    const radius = diameter / 2;
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - el.getBoundingClientRect().left - radius}px`;
    circle.style.top = `${e.clientY - el.getBoundingClientRect().top - radius}px`;
    circle.className = "ripple";
    const ripple = el.getElementsByClassName("ripple")[0];
    if (ripple) ripple.remove();
    el.appendChild(circle);

    if (onClick) onClick(e);
  }

  return (
    <Component
      {...props}
      href={href}
      onClick={handleClick}
      className={`relative overflow-hidden inline-flex items-center justify-center ${className}`}
    >
      {children}

      <style jsx>{`
        .ripple{ 
          position: absolute;
          border-radius: 50%;
          transform: scale(0);
          background: rgba(255,255,255,0.15);
          animation: ripple 650ms linear;
          pointer-events:none;
        }

        @keyframes ripple {
          to { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </Component>
  );
}
