"use client";
import React, { useEffect, useState } from "react";

// FloatingWhatsApp: floating WhatsApp CTA bottom-right with subtle pulse.
// Behavior:
// - Opens wa.me with a prefilled message. If `product` prop is provided, message includes product name.
// - Observes body class changes and hides itself when `menu-open` or `modal-open` is present.
// - Uses Tailwind for layout and simple transitions; for more advanced motion consider Framer Motion.

export default function FloatingWhatsApp({ product = null }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;

    function check() {
      const body = document.body;
      const isHidden = body.classList.contains("menu-open") || body.classList.contains("modal-open");
      setHidden(isHidden);
    }

    check();

    const obs = new MutationObserver(() => check());
    obs.observe(document.body, { attributes: true, attributeFilter: ["class"] });

    return () => obs.disconnect();
  }, []);

  const message = product ? `Hola, quiero info de ${product.name}` : "Hola, quiero info de un producto";
  const href = `https://wa.me/541168696491?text=${encodeURIComponent(message)}`;

  return (
    <div
      aria-hidden={hidden}
      className={`fixed right-4 z-50 ${hidden ? "opacity-0 pointer-events-none scale-95" : "opacity-100"} transition-all duration-300`}
      style={{ bottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp"
        className="relative w-14 h-14 flex items-center justify-center rounded-full btn-gradient text-white focus:outline-none"
        style={{ boxShadow: 'var(--shadow-soft)' }}
      >
        {/* subtle glow behind the button (uses CSS variable opacity) */}
        <span className="absolute -inset-2 rounded-full" style={{ background: 'rgba(200,16,46,0.12)', filter: 'blur(8px)' }} />

        {/* pulse ring: small, subtle */}
        <span className="absolute -inset-3 rounded-full bg-[#C8102E]/10 animate-pulse" />

        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative">
          <path d="M20.5 3.5A11 11 0 0 0 3.2 20.6L2 22l1.4-.4A11 11 0 1 0 20.5 3.5z" fill="#fff" opacity="0.06" />
          <path d="M17.2 14.6c-.3-.1-1.6-.8-1.8-.9-.2-.1-.3-.1-.5.1-.2.3-.6.9-.7 1.1-.1.2-.2.2-.5.1-1.4-.7-2.4-1.6-3.4-3.1-.2-.3 0-.5.1-.6.1-.1.3-.3.5-.5.2-.2.2-.3.3-.5.1-.1 0-.3 0-.4-.1-.2-.5-1.2-.7-1.6-.2-.4-.4-.3-.5-.3-.1 0-.3 0-.5 0-.2 0-.5.1-.7.3-.6.4-1.1 1-1.1 1.6 0 2.7 3.1 5.3 5.6 6.1.8.3 1.4.5 2 .5.8 0 1.4-.3 1.8-.6.4-.3.7-.7.9-1.1.2-.4.1-.7-.1-.8z" fill="#fff" />
        </svg>
      </a>
    </div>
  );
}
