"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  GENERAL_WHATSAPP_MESSAGE,
  HYBRID_CHAT_OPTIONS,
  WHATSAPP_NUMBER,
} from "../lib/chat/hybridSupportConfig";

const WELCOME_MESSAGE =
  "Hola! Soy el asistente de La Guarida. Elegi una consulta frecuente o escribinos por WhatsApp.";
const MAX_MESSAGES = 40;

function buildWaHref(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export default function HybridSupportChat() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    function check() {
      const body = document.body;
      const isHidden =
        body.classList.contains("menu-open") || body.classList.contains("modal-open");
      setHidden(isHidden);
    }
    check();
    const obs = new MutationObserver(() => check());
    obs.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    function handleToggle() {
      setOpen((prev) => !prev);
    }
    function handleOpenLive() {
      // Live chat is intentionally disabled for now; open FAQ assistant instead.
      setOpen(true);
    }
    function handleClose() {
      setOpen(false);
    }
    window.addEventListener("hybrid-chat:toggle", handleToggle);
    window.addEventListener("hybrid-chat:open-live", handleOpenLive);
    window.addEventListener("hybrid-chat:close", handleClose);
    return () => {
      window.removeEventListener("hybrid-chat:toggle", handleToggle);
      window.removeEventListener("hybrid-chat:open-live", handleOpenLive);
      window.removeEventListener("hybrid-chat:close", handleClose);
    };
  }, []);

  useEffect(() => {
    if (!open || messages.length > 0) return;
    setMessages([
      {
        id: "welcome",
        role: "bot",
        text: WELCOME_MESSAGE,
      },
    ]);
  }, [open, messages.length]);

  const waHref = useMemo(
    () => buildWaHref(GENERAL_WHATSAPP_MESSAGE),
    []
  );

  function handleOptionClick(option) {
    setMessages((prev) => {
      const next = [
        ...prev,
        { id: `u-${option.id}-${prev.length}`, role: "user", text: option.label },
        { id: `b-${option.id}-${prev.length}`, role: "bot", text: option.answer },
      ];
      // Keep the chat lightweight across long sessions.
      return next.length > MAX_MESSAGES ? next.slice(next.length - MAX_MESSAGES) : next;
    });
  }

  function handleReset() {
    setMessages([
      {
        id: "welcome",
        role: "bot",
        text: WELCOME_MESSAGE,
      },
    ]);
  }

  if (hidden) return null;

  return (
    <>
      {open ? (
        <div
          className="fixed z-50 right-1/2 translate-x-1/2 bottom-[calc(5rem+env(safe-area-inset-bottom))] md:right-5 md:translate-x-0 md:bottom-5 w-[min(92vw,360px)] rounded-2xl border border-white/10 bg-[#151821]/95 backdrop-blur-xl shadow-[0_20px_46px_rgba(0,0,0,0.42)] overflow-hidden"
          role="dialog"
          aria-label="Asistente de consultas"
        >
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Asistente La Guarida</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-lg border border-white/15 text-white/75 hover:text-white hover:bg-white/8 transition-colors"
              aria-label="Cerrar asistente"
            >
              ×
            </button>
          </div>

          <div className="max-h-[280px] overflow-y-auto px-3 py-3 space-y-2 bg-black/15">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`rounded-xl px-3 py-2 text-sm leading-relaxed ${
                  m.role === "bot"
                    ? "bg-white/10 text-white/90 border border-white/10"
                    : "bg-[var(--vintage-gold-soft)] text-[#f3d399] border border-[var(--vintage-gold)]/35 ml-5"
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>

          <div className="px-3 py-3 border-t border-white/10">
            <p className="text-[11px] uppercase tracking-[0.14em] text-white/55 mb-2">
              Consultas frecuentes
            </p>
            <div className="grid grid-cols-2 gap-2">
              {HYBRID_CHAT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleOptionClick(opt)}
                  className="text-[13px] px-3 py-2 rounded-xl border border-white/20 text-white/88 bg-white/[0.06] hover:bg-white/[0.11] transition-colors text-left leading-tight min-h-[42px]"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="px-3 pb-3 grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="min-h-[42px] rounded-xl border border-white/15 text-white/80 text-sm hover:bg-white/5 transition-colors"
            >
              Reiniciar
            </button>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Continuar por WhatsApp"
              className="col-span-2 min-h-[42px] rounded-xl bg-[var(--vintage-gold-soft)] border border-[var(--vintage-gold)]/45 text-[#f3d399] text-sm font-semibold inline-flex items-center justify-center hover:bg-[var(--vintage-gold-soft-hover)] transition-colors"
            >
              Otra consulta por WhatsApp
            </a>
          </div>
        </div>
      ) : (
        <div className="hidden md:block fixed z-50 right-5 bottom-5" style={{ left: "auto" }}>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Abrir asistente de ayuda"
            className="no-custom-btn group relative isolate inline-flex items-center justify-center w-12 h-12 rounded-2xl border border-white/16 bg-[#141926]/92 text-[#e9edf7] backdrop-blur-xl shadow-[0_12px_28px_rgba(0,0,0,0.38)] transition-all duration-300 motion-reduce:transition-none hover:-translate-y-0.5 hover:border-[var(--vintage-gold)]/50 hover:bg-[#1a2132] hover:shadow-[0_16px_30px_rgba(0,0,0,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vintage-gold)]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f131d]"
          >
            <span className="pointer-events-none absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.8)]" aria-hidden />
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden className="text-[#f1d49a]">
              <path d="M6.5 7.4A4.4 4.4 0 0 1 10.9 3h4.2a4.4 4.4 0 0 1 4.4 4.4v5.2a4.4 4.4 0 0 1-4.4 4.4h-2.1l-3.6 3v-3H8.9a4.4 4.4 0 0 1-4.4-4.4V7.4Z" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 9.5h7M9 12.3h5.5" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
            </svg>
            <span className="pointer-events-none absolute right-[calc(100%+10px)] top-1/2 -translate-y-1/2 rounded-lg border border-white/12 bg-[#141926]/95 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-white/85 opacity-0 translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0">
              Ayuda
            </span>
          </button>
        </div>
      )}
    </>
  );
}
