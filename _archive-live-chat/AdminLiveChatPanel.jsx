"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import supabase from "../lib/supabase/client";

const NOTIFICATION_TITLE = "La Guarida - Nuevo mensaje";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) output[i] = rawData.charCodeAt(i);
  return output;
}

function tryShowNewMessageNotification(payload, selectedSessionId) {
  if (typeof window === "undefined" || !window.Notification) return;
  if (Notification.permission !== "granted") return;
  const isFromUser = payload?.sender === "user";
  if (!isFromUser) return;
  const tabHidden = document.visibilityState === "hidden";
  const isOtherSession = payload?.session_id && payload.session_id !== selectedSessionId;
  if (!tabHidden && !isOtherSession) return;
  const body = (payload?.body || "").trim().slice(0, 80);
  try {
    new Notification(NOTIFICATION_TITLE, {
      body: body ? body : "Un visitante escribió en el chat.",
      tag: "laguarida-chat-" + (payload?.session_id || ""),
    });
  } catch {
    // ignore
  }
}

export default function AdminLiveChatPanel() {
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState("sessions");
  const [readSessionIds, setReadSessionIds] = useState(() => []);
  const endRef = useRef(null);
  const channelRef = useRef(null);
  const selectedSessionIdRef = useRef(selectedSessionId);
  const sessionsRef = useRef(sessions);
  const loadingSessionsRef = useRef(false);
  selectedSessionIdRef.current = selectedSessionId;
  sessionsRef.current = sessions;

  const selectedSession = useMemo(
    () => sessions.find((s) => s.id === selectedSessionId) || null,
    [sessions, selectedSessionId]
  );
  const unreadCount = useMemo(
    () =>
      sessions.filter(
        (s) => s.status !== "closed" && !readSessionIds.includes(s.id)
      ).length,
    [sessions, readSessionIds]
  );

  async function loadSessions(options = {}) {
    const silent = options?.silent === true;
    if (silent && loadingSessionsRef.current) return;
    loadingSessionsRef.current = true;
    if (!silent) {
      setLoadingSessions(true);
      setError("");
    }
    try {
      const res = await fetch("/api/chat/sessions", { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "No se pudieron cargar sesiones");
      const items = Array.isArray(data?.sessions) ? data.sessions : [];
      setSessions(items);
      if (!selectedSessionId && items.length) {
        setSelectedSessionId(items[0].id);
      } else if (selectedSessionId && !items.some((s) => s.id === selectedSessionId)) {
        setSelectedSessionId(items[0]?.id || "");
      }
    } catch (err) {
      if (!silent) setError(err instanceof Error ? err.message : String(err));
    } finally {
      loadingSessionsRef.current = false;
      if (!silent) setLoadingSessions(false);
    }
  }

  function sortSessions(list = []) {
    return [...list].sort((a, b) => {
      const aTime = new Date(a?.last_message_at || a?.updated_at || 0).getTime();
      const bTime = new Date(b?.last_message_at || b?.updated_at || 0).getTime();
      return bTime - aTime;
    });
  }

  function upsertSessionInState(incoming) {
    if (!incoming?.id) return;
    setSessions((prev) => {
      const idx = prev.findIndex((s) => s.id === incoming.id);
      if (idx === -1) return sortSessions([incoming, ...prev]);
      const next = [...prev];
      next[idx] = { ...next[idx], ...incoming };
      return sortSessions(next);
    });
  }

  async function loadMessages(sessionId) {
    if (!sessionId) {
      setMessages([]);
      return;
    }
    setLoadingMessages(true);
    setError("");
    try {
      const params = new URLSearchParams({ sessionId });
      const res = await fetch(`/api/chat/messages?${params.toString()}`, { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "No se pudieron cargar mensajes");
      setMessages(Array.isArray(data?.messages) ? data.messages : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoadingMessages(false);
    }
  }

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const POLL_MS = 5000;
    const id = setInterval(() => {
      if (cancelled) return;
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      loadSessions({ silent: true });
    }, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !window.Notification || !navigator.serviceWorker) return;
    let cancelled = false;
    (async () => {
      try {
        let permission = Notification.permission;
        if (permission === "default") permission = await Notification.requestPermission();
        if (permission !== "granted" || cancelled) return;
        const res = await fetch("/api/push-vapid-public", { credentials: "include" });
        const data = await res.json().catch(() => ({}));
        const publicKey = data?.publicKey;
        if (!res.ok || !publicKey || cancelled) return;
        const reg = await navigator.serviceWorker.ready;
        if (cancelled) return;
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
        if (cancelled) return;
        await fetch("/api/push-subscribe", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subscription: sub.toJSON() }),
        });
      } catch {
        // ignore
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    loadMessages(selectedSessionId);
  }, [selectedSessionId]);

  useEffect(() => {
    if (!selectedSessionId) return;
    if (sessions.some((s) => s.id === selectedSessionId)) return;
    setSelectedSessionId(sessions[0]?.id || "");
  }, [sessions, selectedSessionId]);

  useEffect(() => {
    if (!endRef.current) return;
    endRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  useEffect(() => {
    if (!selectedSessionId) return;
    let cancelled = false;
    const POLL_MS = 4000;
    function poll() {
      if (cancelled) return;
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      fetch(`/api/chat/messages?sessionId=${encodeURIComponent(selectedSessionId)}`, {
        credentials: "include",
      })
        .then((res) => res.json().catch(() => ({})))
        .then((data) => {
          if (cancelled) return;
          const list = Array.isArray(data?.messages) ? data.messages : [];
          setMessages((prev) => {
            const next = list;
            const isUnchanged =
              prev.length === next.length && next.every((m, i) => m.id === prev[i]?.id);
            if (isUnchanged) return prev;
            if (document.visibilityState === "hidden") {
              const newUserMsg = next.find(
                (m) => m.sender === "user" && !prev.some((p) => p.id === m.id)
              );
              if (newUserMsg) tryShowNewMessageNotification(newUserMsg, selectedSessionIdRef.current);
            }
            return next;
          });
        })
        .catch(() => {});
    }
    const id = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [selectedSessionId]);

  useEffect(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    const channel = supabase
      .channel("admin-live-chat")
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_sessions" }, (payload) => {
        if (payload.eventType === "DELETE") {
          const removedId = payload?.old?.id;
          if (!removedId) return;
          setSessions((prev) => prev.filter((s) => s.id !== removedId));
          return;
        }
        const incoming = payload?.new;
        if (incoming) upsertSessionInState(incoming);
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, (payload) => {
        const incoming = payload?.new;
        if (!incoming) return;
        tryShowNewMessageNotification(incoming, selectedSessionIdRef.current);
        if (!sessionsRef.current.some((s) => s.id === incoming.session_id)) {
          loadSessions({ silent: true });
        }
        if (incoming.session_id === selectedSessionId) {
          setMessages((prev) => (prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming]));
        }
        setSessions((prev) => {
          const idx = prev.findIndex((s) => s.id === incoming.session_id);
          if (idx === -1) return prev;
          const next = [...prev];
          next[idx] = {
            ...next[idx],
            last_message_preview: incoming.body,
            last_message_at: incoming.created_at,
            status: "open",
          };
          return sortSessions(next);
        });
      })
      .subscribe();
    channelRef.current = channel;
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [selectedSessionId]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  async function sendReply() {
    const body = String(reply || "").trim();
    if (!body || !selectedSessionId || sending) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ sessionId: selectedSessionId, sender: "admin", body }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "No se pudo enviar respuesta");
      setReply("");
      if (data?.message?.id) {
        setMessages((prev) => (prev.some((m) => m.id === data.message.id) ? prev : [...prev, data.message]));
      }
      setSessions((prev) => {
        const idx = prev.findIndex((s) => s.id === selectedSessionId);
        if (idx === -1) return prev;
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          last_message_preview: body.slice(0, 140),
          last_message_at: new Date().toISOString(),
          status: "open",
        };
        return sortSessions(next);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSending(false);
    }
  }

  async function closeSession() {
    if (!selectedSessionId) return;
    setError("");
    try {
      const res = await fetch("/api/chat/sessions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: selectedSessionId, status: "closed" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "No se pudo cerrar la conversación");
      if (data?.session?.id) upsertSessionInState(data.session);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  function handleSelectSession(id) {
    setSelectedSessionId(id);
    setMobileTab("chat");
    setReadSessionIds((prev) =>
      prev.includes(id) ? prev : [...prev, id]
    );
  }

  useEffect(() => {
    if (!mobileOpen) return;
    setReadSessionIds((prev) => {
      const next = new Set(prev);
      sessions.forEach((s) => next.add(s.id));
      return [...next];
    });
  }, [mobileOpen, sessions]);

  return (
    <section className="p-4 md:p-5 admin-premium-card">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="section-title-minimal text-[1.08rem] text-white">Chat en vivo</h2>
        <button
          type="button"
          onClick={loadSessions}
          className="admin-premium-btn-secondary text-xs px-3 py-1.5 no-custom-btn"
        >
          Actualizar
        </button>
      </div>

      {error ? (
        <div className="mb-3 rounded-xl border border-rose-400/25 bg-rose-500/12 text-rose-200 text-sm px-3 py-2">
          {error}
        </div>
      ) : null}

      <div className="lg:hidden mb-3 rounded-xl border border-white/10 bg-black/20 p-3">
        <p className="text-sm text-white/75 mb-2">
          En mobile abrí una vista dedicada para gestionar conversaciones.
        </p>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="no-custom-btn inline-flex items-center justify-center gap-2 min-h-[42px] px-4 rounded-xl border border-[#d4a43b]/40 bg-[#d4a43b]/15 text-[#f3d399] text-sm font-semibold"
        >
          Abrir chat mobile
          {unreadCount > 0 ? (
            <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] rounded-full bg-[#d4a43b] text-[#151821] text-[11px] font-bold px-1.5">
              {unreadCount}
            </span>
          ) : null}
        </button>
      </div>

      <div
        className={`lg:hidden fixed inset-0 z-[70] transition-opacity duration-250 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          aria-label="Cerrar chat mobile"
          className={`absolute inset-0 bg-black/55 transition-opacity duration-250 ${mobileOpen ? "opacity-100" : "opacity-0"}`}
        />
        <div
          className={`absolute inset-x-0 bottom-0 h-[92dvh] bg-[#0b0f17] rounded-t-2xl border-t border-white/10 shadow-[0_-14px_36px_rgba(0,0,0,0.45)] flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            mobileOpen ? "translate-y-0" : "translate-y-[104%]"
          }`}
        >
          <div className="h-full flex flex-col">
            <div className="sticky top-0 z-10 px-4 py-3 border-b border-white/10 bg-[#0b0f17]/92 backdrop-blur-sm flex items-center justify-between">
              <p className="text-white font-semibold">Chat en vivo</p>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="no-custom-btn w-9 h-9 rounded-lg border border-white/15 text-white/80"
                aria-label="Cerrar chat mobile"
              >
                ×
              </button>
            </div>

            <div className="px-3 py-2 border-b border-white/10 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileTab("sessions")}
                className={`no-custom-btn flex-1 min-h-[38px] rounded-lg border text-xs uppercase tracking-[0.12em] ${
                  mobileTab === "sessions"
                    ? "border-[#d4a43b]/40 bg-[#d4a43b]/12 text-[#f3d399]"
                    : "border-white/15 text-white/70"
                }`}
              >
                Conversaciones
              </button>
              <button
                type="button"
                onClick={() => setMobileTab("chat")}
                className={`no-custom-btn flex-1 min-h-[38px] rounded-lg border text-xs uppercase tracking-[0.12em] ${
                  mobileTab === "chat"
                    ? "border-[#d4a43b]/40 bg-[#d4a43b]/12 text-[#f3d399]"
                    : "border-white/15 text-white/70"
                }`}
              >
                Chat
              </button>
            </div>

            {mobileTab === "sessions" ? (
              <div className="flex-1 overflow-y-auto divide-y divide-white/10">
                {loadingSessions ? (
                  <div className="px-4 py-3 text-sm text-white/70">Cargando conversaciones...</div>
                ) : null}
                {!loadingSessions && sessions.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-white/55">No hay conversaciones activas.</div>
                ) : null}
                {sessions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSelectSession(s.id)}
                    className={`no-custom-btn !rounded-none w-full text-left px-4 py-3 border-l-2 ${
                      selectedSessionId === s.id
                        ? "border-[#d4a43b] bg-[#d4a43b]/10"
                        : "border-transparent bg-transparent"
                    }`}
                  >
                    <p className="text-sm text-white/92 truncate">{s.context_product || "Consulta general"}</p>
                    <p className="text-xs text-white/55 truncate mt-0.5">
                      {s.last_message_preview || "Sin mensajes aún"}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <>
                <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between">
                  <p className="text-sm text-white/80 truncate">
                    {selectedSession ? (selectedSession.context_product || "Consulta general") : "Seleccioná una conversación"}
                  </p>
                  {selectedSession ? (
                    <button
                      type="button"
                      onClick={closeSession}
                      className="no-custom-btn text-xs px-2.5 py-1 rounded-lg border border-white/15 text-white/75"
                    >
                      Cerrar
                    </button>
                  ) : null}
                </div>

                <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
                  {loadingMessages ? (
                    <div className="text-sm text-white/70">Cargando mensajes...</div>
                  ) : null}
                  {!loadingMessages && messages.length === 0 ? (
                    <div className="text-sm text-white/55">No hay mensajes en esta conversación.</div>
                  ) : null}
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`max-w-[92%] rounded-xl px-3 py-2 text-sm ${
                        m.sender === "admin"
                          ? "ml-auto bg-[#d4a43b]/16 border border-[#d4a43b]/35 text-[#f3d399]"
                          : "bg-white/10 border border-white/10 text-white/92"
                      }`}
                    >
                      {m.body}
                    </div>
                  ))}
                  <div ref={endRef} />
                </div>

                <div className="px-3 py-3 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <input
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          sendReply();
                        }
                      }}
                      disabled={!selectedSessionId}
                      placeholder={selectedSessionId ? "Responder..." : "Seleccioná un chat"}
                      className="flex-1 min-h-[42px] rounded-xl border border-white/15 bg-black/25 px-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#d4a43b]/45 disabled:opacity-55"
                    />
                    <button
                      type="button"
                      onClick={sendReply}
                      disabled={!selectedSessionId || !reply.trim() || sending}
                      className="no-custom-btn min-h-[42px] px-4 rounded-xl admin-premium-btn-primary disabled:opacity-55"
                    >
                      Enviar
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="hidden lg:grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)] gap-3">
        <div className="rounded-xl border border-white/10 bg-black/20 overflow-hidden">
          <div className="px-3 py-2 border-b border-white/10 text-[11px] uppercase tracking-[0.14em] text-white/60">
            Conversaciones
          </div>
          <div className="max-h-[430px] overflow-y-auto divide-y divide-white/10">
            {loadingSessions ? (
              <div className="px-3 py-3 text-sm text-white/70">Cargando conversaciones...</div>
            ) : null}
            {!loadingSessions && sessions.length === 0 ? (
              <div className="px-3 py-3 text-sm text-white/55">No hay conversaciones activas.</div>
            ) : null}
            {sessions.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSelectSession(s.id)}
                className={`no-custom-btn !rounded-xl w-full text-left px-3 py-2.5 transition-colors border ${
                  selectedSessionId === s.id
                    ? "bg-[#d4a43b]/12 border-[#d4a43b]/30"
                    : "bg-transparent border-transparent hover:bg-white/[0.04] hover:border-white/10"
                }`}
              >
                <p className="text-sm text-white/92 truncate">{s.context_product || "Consulta general"}</p>
                <p className="text-xs text-white/55 truncate mt-0.5">
                  {s.last_message_preview || "Sin mensajes aún"}
                </p>
                <p className="text-[10px] text-white/40 mt-1">
                  {s.status === "closed" ? "Cerrado" : "Abierto"} · visitante {String(s.visitor_id || "").slice(0, 8)}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/20 overflow-hidden flex flex-col min-h-[430px]">
          <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
            <p className="text-sm text-white/85">
              {selectedSession ? (selectedSession.context_product || "Consulta general") : "Seleccioná una conversación"}
            </p>
            {selectedSession ? (
              <button
                type="button"
                onClick={closeSession}
                className="admin-premium-btn-ghost text-xs px-2.5 py-1 no-custom-btn"
              >
                Cerrar chat
              </button>
            ) : null}
          </div>
          <div className="flex-1 px-3 py-3 overflow-y-auto space-y-2">
            {loadingMessages ? (
              <div className="text-sm text-white/70">Cargando mensajes...</div>
            ) : null}
            {!loadingMessages && messages.length === 0 ? (
              <div className="text-sm text-white/55">No hay mensajes en esta conversación.</div>
            ) : null}
            {messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[90%] rounded-xl px-3 py-2 text-sm ${
                  m.sender === "admin"
                    ? "ml-auto bg-[#d4a43b]/16 border border-[#d4a43b]/35 text-[#f3d399]"
                    : "bg-white/10 border border-white/10 text-white/92"
                }`}
              >
                {m.body}
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <div className="px-3 py-3 border-t border-white/10">
            <div className="flex items-center gap-2">
              <input
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    sendReply();
                  }
                }}
                disabled={!selectedSessionId}
                placeholder={selectedSessionId ? "Responder..." : "Seleccioná un chat"}
                className="flex-1 min-h-[42px] rounded-xl border border-white/15 bg-black/25 px-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#d4a43b]/45 disabled:opacity-55"
              />
              <button
                type="button"
                onClick={sendReply}
                disabled={!selectedSessionId || !reply.trim() || sending}
                className="min-h-[42px] px-4 rounded-xl admin-premium-btn-primary no-custom-btn disabled:opacity-55"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
