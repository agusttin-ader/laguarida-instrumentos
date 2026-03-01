"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import supabase from "../lib/supabase/client";
import {
  GENERAL_WHATSAPP_MESSAGE,
  HYBRID_CHAT_OPTIONS,
  WHATSAPP_NUMBER,
} from "../lib/chat/hybridSupportConfig";

const VISITOR_KEY = "lg-chat-visitor-id";

function buildWaHref(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function createVisitorId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `visitor-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function HybridSupportChat() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mode, setMode] = useState("faq");
  const [messages, setMessages] = useState([]);
  const [visitorId, setVisitorId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [liveMessages, setLiveMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loadingLive, setLoadingLive] = useState(false);
  const [sending, setSending] = useState(false);
  const [liveError, setLiveError] = useState("");
  const [liveContextProduct, setLiveContextProduct] = useState("");
  const channelRef = useRef(null);
  const liveEndRef = useRef(null);

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
    try {
      const existing = localStorage.getItem(VISITOR_KEY);
      if (existing) {
        setVisitorId(existing);
        return;
      }
      const generated = createVisitorId();
      localStorage.setItem(VISITOR_KEY, generated);
      setVisitorId(generated);
    } catch {
      setVisitorId(createVisitorId());
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    function handleToggle() {
      setOpen((prev) => !prev);
    }
    function handleOpenLive(e) {
      const productName = String(e?.detail?.productName || "").trim();
      setLiveContextProduct(productName);
      setMode("live");
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

  useEffect(() => {
    if (!open || mode !== "live") return;
    if (!liveEndRef.current) return;
    liveEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [open, mode, liveMessages]);

  useEffect(() => {
    if (!open || mode !== "live" || !visitorId) return;
    let cancelled = false;

    async function startLiveSession() {
      setLoadingLive(true);
      setLiveError("");
      try {
        const productHint =
          liveContextProduct ||
          (pathname && pathname.startsWith("/guitars/")
            ? pathname.split("/").filter(Boolean).pop()
            : "");
        const res = await fetch("/api/chat/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ visitorId, productName: productHint || "" }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || "No se pudo iniciar el chat");
        if (cancelled) return;
        setSessionId(data?.session?.id || "");
      } catch (err) {
        if (!cancelled) setLiveError(err instanceof Error ? err.message : String(err));
      } finally {
        if (!cancelled) setLoadingLive(false);
      }
    }

    startLiveSession();
    return () => {
      cancelled = true;
    };
  }, [open, mode, visitorId, pathname, liveContextProduct]);

  useEffect(() => {
    if (!open || mode !== "live" || !sessionId || !visitorId) return;
    let cancelled = false;

    async function loadMessages() {
      try {
        const params = new URLSearchParams({ sessionId, visitorId });
        const res = await fetch(`/api/chat/messages?${params.toString()}`, { credentials: "include" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || "No se pudieron cargar mensajes");
        if (cancelled) return;
        setLiveMessages(Array.isArray(data?.messages) ? data.messages : []);
      } catch (err) {
        if (!cancelled) setLiveError(err instanceof Error ? err.message : String(err));
      }
    }

    loadMessages();
    return () => {
      cancelled = true;
    };
  }, [open, mode, sessionId, visitorId]);

  useEffect(() => {
    if (!open || mode !== "live" || !sessionId) return;
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const channel = supabase
      .channel(`chat-live-${sessionId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `session_id=eq.${sessionId}` },
        (payload) => {
          const incoming = payload?.new;
          if (!incoming) return;
          setLiveMessages((prev) => {
            if (prev.some((m) => m.id === incoming.id)) return prev;
            return [...prev, incoming];
          });
        }
      )
      .subscribe();

    channelRef.current = channel;
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [open, mode, sessionId]);

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

  async function sendLiveMessage() {
    const text = String(draft || "").trim();
    if (!text || !sessionId || !visitorId || sending) return;
    setSending(true);
    setLiveError("");
    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ sessionId, sender: "user", body: text, visitorId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "No se pudo enviar el mensaje");
      setDraft("");
      const created = data?.message;
      if (created?.id) {
        setLiveMessages((prev) => {
          if (prev.some((m) => m.id === created.id)) return prev;
          return [...prev, created];
        });
      }
    } catch (err) {
      setLiveError(err instanceof Error ? err.message : String(err));
    } finally {
      setSending(false);
    }
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
              <div className="mt-1 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setMode("faq")}
                  className={`text-[10px] uppercase tracking-[0.12em] px-2 py-1 rounded-md border transition-colors ${
                    mode === "faq"
                      ? "border-[#d4a43b]/45 text-[#f0d39d] bg-[#d4a43b]/12"
                      : "border-white/15 text-white/60 hover:text-white/85"
                  }`}
                >
                  FAQ
                </button>
                <button
                  type="button"
                  onClick={() => setMode("live")}
                  className={`text-[10px] uppercase tracking-[0.12em] px-2 py-1 rounded-md border transition-colors ${
                    mode === "live"
                      ? "border-[#d4a43b]/45 text-[#f0d39d] bg-[#d4a43b]/12"
                      : "border-white/15 text-white/60 hover:text-white/85"
                  }`}
                >
                  En vivo
                </button>
              </div>
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

          {mode === "faq" ? (
            <>
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
                <button
                  type="button"
                  onClick={() => setMode("live")}
                  className="col-span-2 min-h-[42px] rounded-xl bg-[#5c78c4]/22 border border-[#5c78c4]/45 text-[#c8d6ff] text-sm font-semibold hover:bg-[#5c78c4]/30 transition-colors"
                >
                  Hablar con asesor en vivo
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="max-h-[320px] overflow-y-auto px-3 py-3 space-y-2 bg-black/15">
                {loadingLive ? (
                  <div className="rounded-xl px-3 py-2 text-sm text-white/80 border border-white/10 bg-white/[0.06]">
                    Conectando chat en vivo...
                  </div>
                ) : null}
                {!loadingLive && liveMessages.length === 0 ? (
                  <div className="rounded-xl px-3 py-2 text-sm text-white/80 border border-white/10 bg-white/[0.06]">
                    Escribinos y te respondemos por este chat en tiempo real.
                  </div>
                ) : null}
                {liveMessages.map((m) => (
                  <div
                    key={m.id}
                    className={`rounded-xl px-3 py-2 text-sm leading-relaxed ${
                      m.sender === "admin"
                        ? "bg-white/10 text-white/92 border border-white/10"
                        : "bg-[#d4a43b]/16 text-[#f3d399] border border-[#d4a43b]/35 ml-5"
                    }`}
                  >
                    {m.body}
                  </div>
                ))}
                {liveError ? (
                  <div className="rounded-xl px-3 py-2 text-sm text-rose-200 border border-rose-300/25 bg-rose-500/12">
                    {liveError}
                  </div>
                ) : null}
                <div ref={liveEndRef} />
              </div>
              <div className="px-3 py-3 border-t border-white/10 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        sendLiveMessage();
                      }
                    }}
                    placeholder="Escribí tu consulta..."
                    className="flex-1 min-h-[42px] rounded-xl border border-white/15 bg-black/25 px-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#d4a43b]/45"
                  />
                  <button
                    type="button"
                    onClick={sendLiveMessage}
                    disabled={sending || !draft.trim() || !sessionId}
                    className="min-h-[42px] px-3 rounded-xl bg-[#d4a43b]/18 border border-[#d4a43b]/45 text-[#f3d399] text-sm font-semibold hover:bg-[#d4a43b]/26 transition-colors disabled:opacity-50"
                  >
                    Enviar
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMode("faq")}
                    className="min-h-[38px] rounded-xl border border-white/15 text-white/78 text-xs hover:bg-white/5 transition-colors"
                  >
                    Volver a FAQ
                  </button>
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Continuar por WhatsApp"
                    className="min-h-[38px] rounded-xl bg-[#d4a43b]/18 border border-[#d4a43b]/45 text-[#f3d399] text-xs font-semibold inline-flex items-center justify-center hover:bg-[#d4a43b]/26 transition-colors"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            </>
          )}
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
