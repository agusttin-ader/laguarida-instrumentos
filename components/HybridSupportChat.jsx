"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  GENERAL_WHATSAPP_MESSAGE,
  HYBRID_CHAT_OPTIONS,
  WHATSAPP_NUMBER,
} from "../lib/chat/hybridSupportConfig";

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
        text: "Hola! Soy el asistente de La Guarida. Elegi una consulta frecuente o escribinos por WhatsApp.",
      },
    ]);
  }, [open, messages.length]);

  const waHref = useMemo(
    () => buildWaHref(GENERAL_WHATSAPP_MESSAGE),
    []
  );

  function handleOptionClick(option) {
    setMessages((prev) => [
      ...prev,
      { id: `u-${option.id}-${prev.length}`, role: "user", text: option.label },
      { id: `b-${option.id}-${prev.length}`, role: "bot", text: option.answer },
    ]);
  }

  function handleReset() {
    setMessages([
      {
        id: "welcome",
        role: "bot",
        text: "Hola! Soy el asistente de La Guarida. Elegi una consulta frecuente o escribinos por WhatsApp.",
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
              <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-white/60">
                FAQ + WhatsApp
              </p>
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
                    : "bg-[#d4a43b]/16 text-[#f3d399] border border-[#d4a43b]/35 ml-5"
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
              className="col-span-2 min-h-[42px] rounded-xl bg-[#d4a43b]/18 border border-[#d4a43b]/45 text-[#f3d399] text-sm font-semibold inline-flex items-center justify-center hover:bg-[#d4a43b]/26 transition-colors"
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
            className="no-custom-btn group relative isolate overflow-hidden inline-flex items-center gap-2 min-h-[42px] px-3.5 !rounded-full border border-white/14 !bg-[linear-gradient(145deg,rgba(20,25,37,0.96),rgba(12,15,23,0.95))] !text-[#e9edf7] backdrop-blur-md !shadow-[0_16px_34px_rgba(0,0,0,0.38)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#d4a43b]/48 hover:!shadow-[0_20px_36px_rgba(0,0,0,0.44)]"
          >
            <span className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-white/28 to-transparent" aria-hidden />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden className="text-[#f1d49a]">
              <path d="M6.5 7.4A4.4 4.4 0 0 1 10.9 3h4.2a4.4 4.4 0 0 1 4.4 4.4v5.2a4.4 4.4 0 0 1-4.4 4.4h-2.1l-3.6 3v-3H8.9a4.4 4.4 0 0 1-4.4-4.4V7.4Z" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 9.5h7M9 12.3h5.5" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
            </svg>
            <span className="text-[10px] uppercase tracking-[0.17em] font-semibold">Ayuda</span>
          </button>
        </div>
      )}
    </>
  );
}
