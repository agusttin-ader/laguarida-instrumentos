"use client"
/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-vars, no-empty */

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import normalizeProduct from '../lib/utils/normalizeProduct'
import imageService from '../lib/utils/imageService'
import ImageWithSkeleton from './ImageWithSkeleton'
import PullToRefresh from './PullToRefresh'
import { useToast } from './ToastContext'
import { hapticLight } from '../lib/haptics'
export default function AdminProducts({ showNewProductHeroSection = true }) {
  const router = useRouter()
  const quickInputRef = React.useRef(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [listOpen, setListOpen] = useState(false)
  const [activityOpen, setActivityOpen] = useState(false)
  const [success, setSuccess] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [quickOpen, setQuickOpen] = useState(false)
  const [quickQ, setQuickQ] = useState('')
  const [recentActivity, setRecentActivity] = useState([])
  const [adminQ, setAdminQ] = useState('')
  const [actionProduct, setActionProduct] = useState(null)
  const longPressTimerRef = React.useRef(null)
  const longPressSuppressRef = React.useRef(false)
  const { toast } = useToast()

  const filteredItems = React.useMemo(() => {
    if (!Array.isArray(items)) return []
    if (!adminQ || String(adminQ).trim() === '') return items
    const ql = String(adminQ).trim().toLowerCase()
    return items.filter((p) => (String(p.name || p.slug || '')).toLowerCase().includes(ql))
  }, [items, adminQ])

  useEffect(() => {
    load()
    async function loadActivity() {
      try {
        const res = await fetch('/api/admin/activity', { credentials: 'include' })
        if (res.ok) {
          const list = await res.json()
          setRecentActivity(Array.isArray(list) ? list : [])
          return
        }
      } catch { /* empty */ }
      try {
        const raw = localStorage.getItem('admin:recent-activity:v1')
        if (raw) {
          const parsed = JSON.parse(raw)
          const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000
          const now = Date.now()
          const cleaned = Array.isArray(parsed)
            ? parsed.filter((a) => a.ts && now - a.ts <= THIRTY_DAYS)
            : []
          setRecentActivity(cleaned)
        }
      } catch { /* empty */ }
    }
    loadActivity()
  }, [])

  useEffect(() => {
    function onKeyDown(e) {
      const key = String(e.key || '').toLowerCase()
      if ((e.metaKey || e.ctrlKey) && key === 'k') {
        e.preventDefault()
        setQuickOpen((v) => !v)
        if (!quickOpen) setQuickQ('')
        return
      }
      if (key === 'escape' && quickOpen) {
        e.preventDefault()
        setQuickOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [quickOpen])

  useEffect(() => {
    if (!quickOpen) return
    const t = setTimeout(() => quickInputRef.current?.focus(), 10)
    return () => clearTimeout(t)
  }, [quickOpen])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/products', { credentials: 'include' })
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      const data = await res.json()
      setItems(Array.isArray(data) ? data.map((d) => normalizeProduct(d)) : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id, name) {
    const label = name || id
    if (!confirm(`¿Eliminar "${label}"? Esta acción no se puede deshacer.`)) return
    setDeletingId(id)
    setError(null)
    try {
      const res = await fetch(`/api/products?id=${encodeURIComponent(id)}`, { method: 'DELETE', credentials: 'include' })
      if (!res.ok) {
        const txt = await res.text().catch(() => '')
        throw new Error(`${res.status} ${res.statusText} ${txt}`)
      }
      await load()
      addRecentActivity('delete', label, id)
      toast('Producto eliminado', 'success')
      hapticLight()
      setSuccess('Producto eliminado')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
      toast(msg, 'error')
    } finally {
      setDeletingId(null)
    }
  }

  async function addRecentActivity(type, label, productId = null) {
    const stamp = Date.now()
    const time = new Date(stamp).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    const entry = {
      id: `local-${stamp}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      label,
      ts: stamp,
      time,
    }
    setRecentActivity((prev) => [entry, ...prev].slice(0, 30))
    try {
      const res = await fetch('/api/admin/activity', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, label, product_id: productId || undefined }),
      })
      if (res.ok) {
        const data = await res.json()
        setRecentActivity((prev) => {
          const withoutLocal = prev.filter((a) => a.id !== entry.id)
          return [{ ...data, id: data.id }, ...withoutLocal].slice(0, 30)
        })
      }
    } catch { /* empty */ }
  }

  const quickActions = React.useMemo(() => ([
    {
      id: 'create',
      label: 'Crear producto',
      hint: 'Abrir el formulario de alta',
      run: () => router.push('/admin/productos/nuevo'),
    },
    {
      id: 'toggle-list',
      label: listOpen ? 'Ocultar productos' : 'Mostrar productos',
      hint: 'Alternar visibilidad de la lista',
      run: () => setListOpen((v) => !v),
    },
    {
      id: 'focus-search',
      label: 'Buscar productos',
      hint: 'Enfocar campo de búsqueda',
      run: () => {
        setListOpen(true)
        setTimeout(() => {
          const el = document.getElementById('admin-search-input')
          if (el) el.focus()
        }, 30)
      },
    },
    {
      id: 'reload',
      label: 'Recargar productos',
      hint: 'Volver a consultar API',
      run: () => load(),
    },
    {
      id: 'clear-search',
      label: 'Limpiar búsqueda',
      hint: 'Vaciar filtro actual',
      run: () => setAdminQ(''),
    },
  ]), [listOpen, router])

  const quickFiltered = React.useMemo(() => {
    const q = String(quickQ || '').trim().toLowerCase()
    if (!q) return quickActions
    return quickActions.filter((a) =>
      String(a.label || '').toLowerCase().includes(q)
      || String(a.hint || '').toLowerCase().includes(q),
    )
  }, [quickQ, quickActions])

  function runQuickAction(action) {
    if (!action || typeof action.run !== 'function') return
    setQuickOpen(false)
    setQuickQ('')
    action.run()
  }

  function openRowActionMenu(p) {
    hapticLight()
    setActionProduct(p)
  }

  function closeRowActionMenu() {
    setActionProduct(null)
  }

  function handleRowEdit(e, p) {
    if (longPressSuppressRef.current) {
      longPressSuppressRef.current = false
      e.preventDefault()
      e.stopPropagation()
      return
    }
    router.push(`/admin/productos/${encodeURIComponent(p.id)}/editar`)
  }

  function handleRowDelete(e, id, name) {
    if (longPressSuppressRef.current) {
      longPressSuppressRef.current = false
      e.preventDefault()
      e.stopPropagation()
      return
    }
    handleDelete(id, name)
  }

  const LONG_PRESS_MS = 500
  function handleRowTouchStart(p) {
    longPressTimerRef.current = setTimeout(() => {
      longPressTimerRef.current = null
      longPressSuppressRef.current = true
      openRowActionMenu(p)
    }, LONG_PRESS_MS)
  }
  function handleRowTouchEnd() {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }

  return (
    <PullToRefresh onRefresh={load}>
      <div className="w-full space-y-5 pb-24 md:space-y-7 md:pb-14">
        {actionProduct ? (
          <div className="fixed inset-0 z-[96] flex items-end justify-center px-0 sm:items-center sm:px-4">
            <button
              type="button"
              aria-label="Cerrar menú"
              className="absolute inset-0 bg-black/50 no-custom-btn"
              onClick={closeRowActionMenu}
            />
            <div className="relative w-full rounded-t-3xl border border-white/12 border-b-0 bg-[#1a1f2e] pb-4 shadow-[0_-8px_40px_rgba(0,0,0,0.45)] sm:max-w-sm sm:rounded-2xl sm:border-b sm:pb-4" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))' }}>
              <div className="border-b border-white/10 px-4 pb-2 pt-4">
                <p className="truncate text-sm font-medium text-slate-100">{actionProduct.name || actionProduct.slug || actionProduct.id}</p>
                <p className="mt-0.5 text-xs text-slate-400">Elegí una acción</p>
              </div>
              <div className="space-y-1.5 p-3">
                <button
                  type="button"
                  className="admin-btn-interact admin-desk-btn-secondary no-custom-btn flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm"
                  onClick={() => { hapticLight(); router.push(`/admin/productos/${encodeURIComponent(actionProduct.id)}/editar`); closeRowActionMenu() }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  Editar
                </button>
                <button
                  type="button"
                  className="admin-btn-interact admin-desk-btn-danger no-custom-btn flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm disabled:opacity-60"
                  disabled={deletingId === actionProduct.id}
                  onClick={() => { hapticLight(); handleDelete(actionProduct.id, actionProduct.name); closeRowActionMenu() }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4m1 4h.01M12 4h.01" /></svg>
                  {deletingId === actionProduct.id ? 'Eliminando…' : 'Eliminar'}
                </button>
                <button
                  type="button"
                  className="admin-btn-interact admin-desk-btn-ghost no-custom-btn w-full rounded-xl px-4 py-3 text-sm text-slate-300"
                  onClick={closeRowActionMenu}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {quickOpen ? (
          <div className="fixed inset-0 z-[95] flex items-start justify-center px-4 pt-20 md:pt-28">
            <button
              type="button"
              aria-label="Cerrar acciones rápidas"
              className="absolute inset-0 bg-black/50 no-custom-btn"
              onClick={() => setQuickOpen(false)}
            />
            <div className="relative w-full max-w-xl rounded-2xl border border-white/12 bg-[#1a1f2e] shadow-[0_24px_56px_rgba(0,0,0,0.45)]">
              <div className="border-b border-white/10 px-4 py-3">
                <div className="mb-2 flex items-center gap-2 text-xs text-slate-400">
                  <span>Acciones rápidas</span>
                  <span className="ml-auto">⌘/Ctrl + K</span>
                </div>
                <input
                  ref={quickInputRef}
                  value={quickQ}
                  onChange={(e) => setQuickQ(e.target.value)}
                  placeholder="Buscar acción..."
                  className="admin-desk-input"
                />
              </div>
              <div className="max-h-[44vh] overflow-y-auto p-2">
                {quickFiltered.length === 0 ? (
                  <div className="px-3 py-3 text-sm text-slate-400">No hay acciones para ese filtro.</div>
                ) : (
                  quickFiltered.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => runQuickAction(a)}
                      className="no-custom-btn w-full rounded-xl border border-transparent px-3 py-2 text-left transition-colors hover:border-white/15 hover:bg-white/[0.06]"
                    >
                      <div className="text-sm font-medium text-slate-100">{a.label}</div>
                      <div className="mt-0.5 text-xs text-slate-400">{a.hint}</div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : null}

        {showNewProductHeroSection ? (
          <section className="admin-desk-card rounded-2xl p-4 sm:p-6 md:p-7">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h2 className="admin-desk-section-title">Nuevo producto</h2>
                <p className="admin-desk-section-desc">Abrí el formulario en página completa para cargar fotos, precio y ficha. Si había un borrador sin publicar, se restaura al entrar en alta.</p>
              </div>
              <div className="flex w-full items-center gap-2 md:w-auto">
                <button
                  type="button"
                  className="admin-btn-interact admin-desk-btn-primary no-custom-btn inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold shadow-lg shadow-indigo-500/35 md:w-auto"
                  onClick={() => router.push('/admin/productos/nuevo')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m-7-7h14" /></svg>
                  Crear producto
                </button>
              </div>
            </div>
            {error ? <div className="mt-3 rounded-lg border border-rose-500/35 bg-rose-950/55 p-3 text-sm text-rose-100">{error}</div> : null}
            {success ? <div className="mt-3 rounded-lg border border-emerald-500/35 bg-emerald-950/45 p-3 text-sm text-emerald-100">{success}</div> : null}
          </section>
        ) : null}

        {!showNewProductHeroSection && (error || success) ? (
          <section className="admin-desk-card rounded-2xl p-4 sm:p-6 md:p-7">
            {error ? <div className="rounded-lg border border-rose-500/35 bg-rose-950/55 p-3 text-sm text-rose-100">{error}</div> : null}
            {success ? <div className={`rounded-lg border border-emerald-500/35 bg-emerald-950/45 p-3 text-sm text-emerald-100 ${error ? 'mt-3' : ''}`}>{success}</div> : null}
          </section>
        ) : null}

        <section className="admin-desk-card rounded-2xl p-4 sm:p-6 md:p-7">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="admin-desk-section-title">Actividad reciente</h2>
              <p className="admin-desk-section-desc">Últimos cambios (sincronizado entre dispositivos)</p>
            </div>
            <button type="button" onClick={() => setActivityOpen((v) => !v)} className="admin-btn-interact admin-desk-btn-secondary no-custom-btn inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm md:w-auto">
              {activityOpen ? 'Ocultar' : 'Mostrar'}
              <svg className={`h-4 w-4 transition-transform ${activityOpen ? 'rotate-180' : 'rotate-0'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          <div className={`overflow-hidden transition-all duration-300 ease-out ${activityOpen ? 'mt-4 max-h-[800px]' : 'max-h-0'}`}>
            {recentActivity.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-white/12 bg-white/[0.04] px-4 py-8 text-center">
                <span className="mb-2 text-3xl opacity-50" aria-hidden>📋</span>
                <p className="text-sm text-slate-400">Aún no hay cambios recientes.</p>
                <p className="mt-1 text-xs text-slate-400">Creá o editá un producto para ver la actividad de todos los dispositivos.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentActivity.map((a) => (
                  <div key={a.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5">
                    <p className="truncate text-sm text-slate-200">
                      {a.type === 'create' ? 'Creaste' : a.type === 'update' ? 'Actualizaste' : 'Eliminaste'}{' '}
                      <span className="font-semibold text-white">{a.label}</span>
                    </p>
                    <span className="whitespace-nowrap text-[11px] text-slate-400">{a.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="admin-desk-card rounded-2xl p-4 sm:p-6 md:p-7">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="admin-desk-section-title">Catálogo</h2>
                {!loading && items.length > 0 ? (
                  <span className="rounded-md border border-white/12 bg-white/10 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-slate-200">
                    {filteredItems.length === items.length
                      ? `${items.length} ítems`
                      : `${filteredItems.length} de ${items.length}`}
                  </span>
                ) : null}
              </div>
              <p className="admin-desk-section-desc">
                Buscá por nombre. En móvil: mantené presionada una fila para el menú. En escritorio: clic derecho.
              </p>
            </div>
            <div className="flex w-full shrink-0 items-center gap-2 md:w-auto">
              <button type="button" onClick={() => setListOpen((v) => !v)} className="admin-btn-interact admin-desk-btn-secondary no-custom-btn inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm md:w-auto">
                {listOpen ? 'Ocultar' : 'Mostrar'}
                <svg className={`h-4 w-4 transition-transform ${listOpen ? 'rotate-180' : 'rotate-0'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-300">Buscar</label>
            <div className="relative" role="search">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" /></svg>
              </span>
              <input
                id="admin-search-input"
                aria-label="Buscar producto por nombre"
                value={adminQ}
                onChange={(e) => setAdminQ(e.target.value)}
                placeholder="Nombre o parte del nombre…"
                className="admin-desk-input rounded-xl py-3 pr-3 text-[15px] sm:text-sm"
                style={{ paddingLeft: '2.65rem' }}
              />
            </div>
          </div>
          {loading ? (
            <div className="mt-4 space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3.5">
                  <div className="h-12 w-12 animate-pulse rounded-lg bg-white/15" />
                  <div className="min-w-0 flex-1">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-white/15" />
                    <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-white/10" />
                  </div>
                </div>
              ))}
            </div>
          ) : null}
          {!loading && items.length === 0 ? (
            <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-white/12 bg-white/[0.04] px-4 py-10 text-center">
              <span className="mb-3 text-4xl opacity-50" aria-hidden>🎸</span>
              <p className="text-sm font-medium text-slate-300">No hay productos</p>
              <p className="mt-1 text-xs text-slate-400">Usá &quot;Crear producto&quot; para cargar el primer ítem del catálogo.</p>
            </div>
          ) : null}
          <div className={`mt-4 divide-y divide-white/10 overflow-hidden rounded-xl border border-white/12 bg-[#141a24] transition-all duration-300 ease-out ${listOpen ? 'max-h-[2000px] py-0' : 'max-h-0 border-transparent'}`}>
            {filteredItems.map((p) => {
              const imgSrc = imageService.resolve(p.image_url || (p.images && p.images[0]))
              return (
                <div
                  key={p.id}
                  className="admin-item flex touch-manipulation flex-col gap-3 px-3 py-4 transition-colors duration-200 hover:bg-white/[0.04] sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-3.5"
                  onContextMenu={(e) => { e.preventDefault(); openRowActionMenu(p) }}
                  onTouchStart={() => handleRowTouchStart(p)}
                  onTouchEnd={handleRowTouchEnd}
                  onTouchMove={handleRowTouchEnd}
                  onTouchCancel={handleRowTouchEnd}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/12 bg-[#131820] shadow-inner sm:h-12 sm:w-12 md:h-14 md:w-14">
                      {imgSrc ? (
                        <ImageWithSkeleton src={imgSrc} alt={p.name || p.slug || 'Imagen'} width={56} height={56} quality={62} disableClientPreview />
                      ) : (
                        <div className="image-placeholder h-full w-full" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="break-words font-medium leading-tight text-slate-100">{p.name || p.slug || p.id}</div>
                      <div className="text-sm text-slate-300">{p.price || '-'}</div>
                    </div>
                  </div>
                  <div className="grid w-full grid-cols-2 items-center gap-2 sm:flex sm:w-auto">
                    <button type="button" onClick={(e) => handleRowEdit(e, p)} className="admin-btn-interact admin-desk-btn-secondary no-custom-btn inline-flex items-center justify-center gap-1.5 whitespace-nowrap px-2.5 py-2 text-[13px] sm:px-3 sm:py-1.5 sm:text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20h9" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z" /></svg>
                      Editar
                    </button>
                    <button type="button" className="admin-btn-interact admin-desk-btn-danger no-custom-btn inline-flex items-center justify-center gap-1.5 whitespace-nowrap px-2.5 py-2 text-[13px] disabled:cursor-not-allowed disabled:opacity-60 sm:px-3 sm:py-1.5 sm:text-sm" onClick={(e) => handleRowDelete(e, p.id, p.name)} disabled={deletingId === p.id}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 7h12M9 7V5h6v2m-7 3v7m4-7v7m4-7v7M5 7l1 13h12l1-13" /></svg>
                      {deletingId === p.id ? 'Eliminando' : 'Eliminar'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </PullToRefresh>
  )
}
