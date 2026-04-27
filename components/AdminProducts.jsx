"use client"
/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-vars, no-empty */

import React, { useCallback, useDeferredValue, useEffect, useMemo, useState, startTransition } from 'react'
import { useRouter } from 'next/navigation'
import normalizeProduct from '../lib/utils/normalizeProduct'
import imageService from '../lib/utils/imageService'
import PullToRefresh from './PullToRefresh'
import { useToast } from './ToastContext'
import { hapticLight } from '../lib/haptics'

const ACTIVITY_FETCH_LIMIT = 200
const CATALOG_PAGE_SIZE = 35
const LS_DEBOUNCE_MS = 450

function useDebouncedLocalStorage(key, value) {
  useEffect(() => {
    if (typeof window === 'undefined') return
    const t = setTimeout(() => {
      try {
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
      } catch { /* empty */ }
    }, LS_DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [key, value])
}

function csvEscape(value) {
  const s = String(value ?? '')
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

const PRODUCT_STATUS_OPTIONS = [
  { value: 'available', label: 'Disponible' },
  { value: 'reserved', label: 'Reservada' },
  { value: 'sold', label: 'Vendida' },
]
const PIPELINE_OPTIONS = [
  { value: 'new', label: 'Nuevo lead' },
  { value: 'responded', label: 'Respondido' },
  { value: 'negotiation', label: 'Negociación' },
  { value: 'closed', label: 'Cerrado' },
]

const DEFAULT_OPS_STATIC = Object.freeze({ status: 'available', pipeline: 'new' })

const AdminCatalogRow = React.memo(function AdminCatalogRow({
  product: p,
  ops,
  deletingId,
  onRowEdit,
  onRowDelete,
  onStatusChange,
  onPipelineChange,
  onContextMenu,
  onTouchStart,
  onTouchEnd,
  onTouchMove,
  onTouchCancel,
}) {
  const imgSrc = imageService.resolve(p.image_url || (p.images && p.images[0]))
  return (
    <div
      className="admin-item flex touch-manipulation flex-col gap-3 px-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-3.5"
      onContextMenu={onContextMenu}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchMove={onTouchMove}
      onTouchCancel={onTouchCancel}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/12 bg-[#131820] shadow-inner sm:h-12 sm:w-12 md:h-14 md:w-14">
          {imgSrc ? (
            <img
              src={imgSrc}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
              width={56}
              height={56}
            />
          ) : (
            <div className="image-placeholder h-full w-full" />
          )}
        </div>
        <div className="min-w-0">
          <div className="break-words font-medium leading-tight text-slate-100">{p.name || p.slug || p.id}</div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="text-sm text-slate-300">{p.price || '-'}</span>
            {p.low_cost ? (
              <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
                Low cost
              </span>
            ) : null}
          </div>
        </div>
      </div>
      <div className="grid w-full grid-cols-2 items-center gap-2 sm:flex sm:w-auto">
        <select
          value={ops.status}
          onChange={(e) => onStatusChange(p.id, e.target.value)}
          className="admin-desk-input h-auto min-h-0 px-2.5 py-2 text-[12px] sm:text-xs"
        >
          {PRODUCT_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          value={ops.pipeline}
          onChange={(e) => onPipelineChange(p.id, e.target.value)}
          className="admin-desk-input h-auto min-h-0 px-2.5 py-2 text-[12px] sm:text-xs"
        >
          {PIPELINE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={(e) => onRowEdit(e, p)}
          className="admin-btn-interact admin-desk-btn-secondary no-custom-btn inline-flex items-center justify-center gap-1.5 whitespace-nowrap px-2.5 py-2 text-[13px] sm:px-3 sm:py-1.5 sm:text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20h9" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z" /></svg>
          Editar
        </button>
        <button
          type="button"
          className="admin-btn-interact admin-desk-btn-danger no-custom-btn inline-flex items-center justify-center gap-1.5 whitespace-nowrap px-2.5 py-2 text-[13px] disabled:cursor-not-allowed disabled:opacity-60 sm:px-3 sm:py-1.5 sm:text-sm"
          onClick={(e) => onRowDelete(e, p.id, p.name)}
          disabled={deletingId === p.id}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 7h12M9 7V5h6v2m-7 3v7m4-7v7m4-7v7M5 7l1 13h12l1-13" /></svg>
          {deletingId === p.id ? 'Procesando' : 'Vendido/Eliminar'}
        </button>
      </div>
    </div>
  )
}, (a, b) =>
  a.product.id === b.product.id
  && a.ops.status === b.ops.status
  && a.ops.pipeline === b.ops.pipeline
  && a.deletingId === b.deletingId)

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
  const [opsByProduct, setOpsByProduct] = useState({})
  const [tasks, setTasks] = useState([])
  const [newTaskText, setNewTaskText] = useState('')
  const [newTaskProductId, setNewTaskProductId] = useState('')
  const [saleDraft, setSaleDraft] = useState({ productId: '', buyer: '', channel: 'WhatsApp', finalPrice: '', notes: '' })
  const [salesByProduct, setSalesByProduct] = useState({})
  const [historyByProduct, setHistoryByProduct] = useState({})
  const [historyProductId, setHistoryProductId] = useState('')
  const [toolsOpen, setToolsOpen] = useState(false)
  const [catalogVisible, setCatalogVisible] = useState(CATALOG_PAGE_SIZE)
  const longPressTimerRef = React.useRef(null)
  const longPressSuppressRef = React.useRef(false)
  const { toast } = useToast()
  const deferredAdminQ = useDeferredValue(adminQ)

  useDebouncedLocalStorage('admin:ops-by-product:v1', opsByProduct)
  useDebouncedLocalStorage('admin:tasks:v1', tasks)
  useDebouncedLocalStorage('admin:sales-by-product:v1', salesByProduct)
  useDebouncedLocalStorage('admin:history-by-product:v1', historyByProduct)

  const filteredItems = useMemo(() => {
    if (!Array.isArray(items)) return []
    if (!deferredAdminQ || String(deferredAdminQ).trim() === '') return items
    const ql = String(deferredAdminQ).trim().toLowerCase()
    return items.filter((p) => {
      const hay = [
        p.name,
        p.slug,
        p.model,
        p.brand,
      ]
        .map((v) => String(v || '').toLowerCase())
        .join(' ')
      return hay.includes(ql)
    })
  }, [items, deferredAdminQ])

  const productSelectOptions = useMemo(
    () => items.map((p) => ({ id: p.id, label: p.name || p.slug || p.id })),
    [items],
  )

  const productNameById = useMemo(() => {
    const m = new Map()
    for (const p of items) m.set(String(p.id), p.name || p.slug || p.id)
    return m
  }, [items])

  useEffect(() => {
    setCatalogVisible(CATALOG_PAGE_SIZE)
  }, [adminQ, items.length])

  const pagedCatalogItems = useMemo(
    () => filteredItems.slice(0, catalogVisible),
    [filteredItems, catalogVisible],
  )

  const dashboardStats = useMemo(() => {
    const total = items.length
    const lowCost = items.filter((p) => p.low_cost === true).length
    const missingPrice = items.filter((p) => !String(p.price || '').trim()).length
    const missingImage = items.filter((p) => !(p.image_url || (Array.isArray(p.images) && p.images[0]))).length
    const shortDescription = items.filter((p) => String(p.description || '').trim().length > 0 && String(p.description || '').trim().length < 80).length
    return { total, lowCost, missingPrice, missingImage, shortDescription }
  }, [items])

  const qualityAlerts = useMemo(() => {
    return items
      .map((p) => {
        const reasons = []
        if (!String(p.price || '').trim()) reasons.push('sin precio')
        if (!String(p.description || '').trim()) reasons.push('sin descripción')
        if (String(p.description || '').trim().length > 0 && String(p.description || '').trim().length < 80) reasons.push('descripción corta')
        if (!(p.image_url || (Array.isArray(p.images) && p.images[0]))) reasons.push('sin imagen')
        if (!String(p.model || '').trim()) reasons.push('sin modelo')
        return reasons.length
          ? {
              id: p.id,
              label: p.name || p.slug || p.id,
              reasons,
            }
          : null
      })
      .filter(Boolean)
      .slice(0, 8)
  }, [items])

  const load = useCallback(async () => {
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
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const opsRaw = localStorage.getItem('admin:ops-by-product:v1')
      const tasksRaw = localStorage.getItem('admin:tasks:v1')
      const salesRaw = localStorage.getItem('admin:sales-by-product:v1')
      const historyRaw = localStorage.getItem('admin:history-by-product:v1')
      if (opsRaw) setOpsByProduct(JSON.parse(opsRaw) || {})
      if (tasksRaw) setTasks(Array.isArray(JSON.parse(tasksRaw)) ? JSON.parse(tasksRaw) : [])
      if (salesRaw) setSalesByProduct(JSON.parse(salesRaw) || {})
      if (historyRaw) setHistoryByProduct(JSON.parse(historyRaw) || {})
    } catch { /* empty */ }
  }, [])

  useEffect(() => {
    load()
    let cancelled = false
    async function loadActivity() {
      try {
        const res = await fetch(`/api/admin/activity?limit=${ACTIVITY_FETCH_LIMIT}`, { credentials: 'include' })
        if (cancelled) return
        if (res.ok) {
          const list = await res.json()
          setRecentActivity(Array.isArray(list) ? list : [])
          return
        }
      } catch { /* empty */ }
      if (cancelled) return
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
    const schedule =
      typeof window !== 'undefined' && typeof window.requestIdleCallback === 'function'
        ? window.requestIdleCallback(() => { loadActivity() }, { timeout: 1800 })
        : setTimeout(loadActivity, 400)
    return () => {
      cancelled = true
      if (typeof window !== 'undefined' && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(schedule)
      } else {
        clearTimeout(schedule)
      }
    }
  }, [load])

  const monthlyStats = useMemo(() => {
    if (!toolsOpen) return []
    const byMonth = new Map()
    for (const a of recentActivity) {
      if (!a?.ts) continue
      const d = new Date(a.ts)
      if (Number.isNaN(d.getTime())) continue
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (!byMonth.has(key)) {
        byMonth.set(key, { month: key, create: 0, update: 0, delete: 0, total: 0 })
      }
      const row = byMonth.get(key)
      if (a.type === 'create') row.create += 1
      if (a.type === 'update') row.update += 1
      if (a.type === 'delete') row.delete += 1
      row.total += 1
    }
    return [...byMonth.values()].sort((a, b) => (a.month < b.month ? 1 : -1))
  }, [recentActivity, toolsOpen])

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

  function goToEdit(productId) {
    if (!productId) return
    router.push(`/admin/productos/${encodeURIComponent(productId)}/editar`)
  }

  function exportCatalogCsv() {
    const headers = [
      'id',
      'slug',
      'name',
      'price',
      'brand',
      'model',
      'low_cost',
      'image_url',
      'description',
    ]
    const rows = items.map((p) => [
      p.id,
      p.slug,
      p.name,
      p.price,
      p.brand || '',
      p.model || '',
      p.low_cost ? 'true' : 'false',
      p.image_url || '',
      String(p.description || '').replace(/\s+/g, ' ').trim(),
    ])
    const csv = [headers, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `catalogo-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    toast('CSV exportado', 'success')
  }

  function exportMonthlyStatsCsv() {
    const headers = ['mes', 'altas', 'ediciones', 'ventas', 'total_movimientos']
    const rows = monthlyStats.map((m) => [m.month, m.create, m.update, m.delete, m.total])
    const csv = [headers, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `estadisticas-mensuales-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    toast('Estadísticas mensuales exportadas', 'success')
  }

  function addProductHistory(productId, message) {
    if (!productId || !message) return
    const entry = {
      id: `h-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ts: Date.now(),
      message,
    }
    setHistoryByProduct((prev) => ({
      ...prev,
      [productId]: [entry, ...(Array.isArray(prev[productId]) ? prev[productId] : [])].slice(0, 80),
    }))
  }

  function updateProductOps(productId, partial) {
    if (!productId) return
    setOpsByProduct((prev) => {
      const current = prev[productId] || DEFAULT_OPS_STATIC
      const next = { ...current, ...partial }
      return { ...prev, [productId]: next }
    })
  }

  function setProductStatus(productId, value) {
    updateProductOps(productId, { status: value })
    const p = items.find((x) => String(x.id) === String(productId))
    addProductHistory(productId, `Estado cambiado a ${PRODUCT_STATUS_OPTIONS.find((o) => o.value === value)?.label || value}.`)
    if (p) addRecentActivity('update', `${p.name || p.slug || p.id} · estado ${value}`, productId)
  }

  function setProductPipeline(productId, value) {
    updateProductOps(productId, { pipeline: value })
    const p = items.find((x) => String(x.id) === String(productId))
    addProductHistory(productId, `Pipeline: ${PIPELINE_OPTIONS.find((o) => o.value === value)?.label || value}.`)
    if (p) addRecentActivity('update', `${p.name || p.slug || p.id} · pipeline ${value}`, productId)
  }

  function addTask() {
    const text = String(newTaskText || '').trim()
    if (!text) return
    const task = {
      id: `t-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      text,
      productId: newTaskProductId || null,
      done: false,
      createdAt: Date.now(),
    }
    setTasks((prev) => [task, ...prev].slice(0, 120))
    if (task.productId) addProductHistory(task.productId, `Nueva tarea: ${text}`)
    setNewTaskText('')
    setNewTaskProductId('')
    toast('Tarea creada', 'success')
  }

  function toggleTaskDone(taskId) {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)))
  }

  function removeTask(taskId) {
    setTasks((prev) => prev.filter((t) => t.id !== taskId))
  }

  function saveSaleRecord() {
    const productId = saleDraft.productId
    if (!productId) {
      toast('Seleccioná un producto para registrar venta', 'error')
      return
    }
    const record = {
      buyer: String(saleDraft.buyer || '').trim(),
      channel: String(saleDraft.channel || '').trim() || 'WhatsApp',
      finalPrice: String(saleDraft.finalPrice || '').trim(),
      notes: String(saleDraft.notes || '').trim(),
      soldAt: Date.now(),
    }
    setSalesByProduct((prev) => ({ ...prev, [productId]: record }))
    updateProductOps(productId, { status: 'sold', pipeline: 'closed' })
    addProductHistory(productId, `Venta registrada (${record.channel}${record.finalPrice ? ` · ${record.finalPrice}` : ''}).`)
    const p = items.find((x) => String(x.id) === String(productId))
    if (p) addRecentActivity('delete', p.name || p.slug || p.id, productId)
    setSaleDraft({ productId: '', buyer: '', channel: 'WhatsApp', finalPrice: '', notes: '' })
    toast('Venta registrada', 'success')
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

  const quickActions = useMemo(() => ([
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
      run: () => startTransition(() => setListOpen((v) => !v)),
    },
    {
      id: 'focus-search',
      label: 'Buscar productos',
      hint: 'Enfocar campo de búsqueda',
      run: () => {
        startTransition(() => setListOpen(true))
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
      id: 'export-csv',
      label: 'Exportar catálogo CSV',
      hint: 'Descargar backup del catálogo',
      run: () => exportCatalogCsv(),
    },
    {
      id: 'clear-search',
      label: 'Limpiar búsqueda',
      hint: 'Vaciar filtro actual',
      run: () => setAdminQ(''),
    },
  ]), [listOpen, router, items, load])

  const quickFiltered = useMemo(() => {
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
    goToEdit(p.id)
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
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="admin-desk-section-title">Resumen del catálogo</h2>
              <p className="admin-desk-section-desc">Estado general, pendientes y exportación rápida.</p>
            </div>
            <button
              type="button"
              onClick={exportCatalogCsv}
              className="admin-btn-interact admin-desk-btn-secondary no-custom-btn inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm md:w-auto"
            >
              Exportar CSV
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3">
              <p className="text-[11px] uppercase tracking-wide text-slate-400">Total</p>
              <p className="mt-1 text-lg font-semibold text-slate-100">{dashboardStats.total}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3">
              <p className="text-[11px] uppercase tracking-wide text-slate-400">Low Cost</p>
              <p className="mt-1 text-lg font-semibold text-slate-100">{dashboardStats.lowCost}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3">
              <p className="text-[11px] uppercase tracking-wide text-slate-400">Sin precio</p>
              <p className="mt-1 text-lg font-semibold text-amber-300">{dashboardStats.missingPrice}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3">
              <p className="text-[11px] uppercase tracking-wide text-slate-400">Sin imagen</p>
              <p className="mt-1 text-lg font-semibold text-amber-300">{dashboardStats.missingImage}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3">
              <p className="text-[11px] uppercase tracking-wide text-slate-400">Desc. corta</p>
              <p className="mt-1 text-lg font-semibold text-amber-300">{dashboardStats.shortDescription}</p>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-white/10 bg-[#141a24]">
            <div className="border-b border-white/10 px-4 py-2.5">
              <p className="text-sm font-medium text-slate-200">Pendientes de calidad</p>
            </div>
            {qualityAlerts.length === 0 ? (
              <p className="px-4 py-4 text-sm text-emerald-300">Todo en orden por ahora.</p>
            ) : (
              <div className="divide-y divide-white/10">
                {qualityAlerts.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => goToEdit(a.id)}
                    className="no-custom-btn flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-white/[0.04]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-100">{a.label}</p>
                      <p className="mt-1 text-xs text-amber-300">{a.reasons.join(' · ')}</p>
                    </div>
                    <span className="shrink-0 text-xs text-slate-400">Editar</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="admin-desk-card rounded-2xl p-4 sm:p-6 md:p-7">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="admin-desk-section-title">Herramientas</h2>
              <p className="admin-desk-section-desc">Tareas, venta, historial y estadísticas mensuales. Van ocultas por defecto para aligerar la carga del panel.</p>
            </div>
            <button
              type="button"
              onClick={() => startTransition(() => setToolsOpen((v) => !v))}
              className="admin-btn-interact admin-desk-btn-secondary no-custom-btn inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm md:w-auto"
            >
              {toolsOpen ? 'Ocultar herramientas' : 'Mostrar herramientas'}
              <svg className={`h-4 w-4 transition-transform ${toolsOpen ? 'rotate-180' : 'rotate-0'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          {toolsOpen ? (
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-[#141a24] p-4">
              <h3 className="text-sm font-semibold text-slate-100">Recordatorios y tareas</h3>
              <div className="mt-3 grid grid-cols-1 gap-2">
                <input
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  placeholder="Ej: subir foto trasera de la PRS"
                  className="admin-desk-input"
                />
                <select
                  value={newTaskProductId}
                  onChange={(e) => setNewTaskProductId(e.target.value)}
                  className="admin-desk-input"
                >
                  <option value="">Sin producto asociado</option>
                  {productSelectOptions.map((o) => (
                    <option key={o.id} value={o.id}>{o.label}</option>
                  ))}
                </select>
                <button type="button" onClick={addTask} className="admin-desk-btn-primary no-custom-btn px-4 py-2.5 text-sm">Agregar tarea</button>
              </div>
              <div className="mt-3 max-h-[280px] space-y-2 overflow-y-auto">
                {tasks.length === 0 ? (
                  <p className="text-xs text-slate-400">No hay tareas todavía.</p>
                ) : tasks.map((t) => (
                  <div key={t.id} className="flex items-start gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                    <input type="checkbox" checked={Boolean(t.done)} onChange={() => toggleTaskDone(t.id)} className="mt-0.5 h-4 w-4" />
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm ${t.done ? 'line-through text-slate-500' : 'text-slate-200'}`}>{t.text}</p>
                      {t.productId ? (
                        <p className="mt-0.5 text-[11px] text-slate-400">
                          {productNameById.get(String(t.productId)) || t.productId}
                        </p>
                      ) : null}
                    </div>
                    <button type="button" onClick={() => removeTask(t.id)} className="no-custom-btn text-xs text-rose-300">Quitar</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#141a24] p-4">
              <h3 className="text-sm font-semibold text-slate-100">Ficha de comprador / venta</h3>
              <div className="mt-3 grid grid-cols-1 gap-2">
                <select value={saleDraft.productId} onChange={(e) => setSaleDraft((prev) => ({ ...prev, productId: e.target.value }))} className="admin-desk-input">
                  <option value="">Seleccionar producto</option>
                  {productSelectOptions.map((o) => (
                    <option key={o.id} value={o.id}>{o.label}</option>
                  ))}
                </select>
                <input value={saleDraft.buyer} onChange={(e) => setSaleDraft((prev) => ({ ...prev, buyer: e.target.value }))} placeholder="Comprador (opcional)" className="admin-desk-input" />
                <input value={saleDraft.finalPrice} onChange={(e) => setSaleDraft((prev) => ({ ...prev, finalPrice: e.target.value }))} placeholder="Monto final (opcional)" className="admin-desk-input" />
                <input value={saleDraft.channel} onChange={(e) => setSaleDraft((prev) => ({ ...prev, channel: e.target.value }))} placeholder="Canal (WhatsApp/IG/etc.)" className="admin-desk-input" />
                <textarea value={saleDraft.notes} onChange={(e) => setSaleDraft((prev) => ({ ...prev, notes: e.target.value }))} placeholder="Notas internas" className="admin-desk-input" rows={3} />
                <button type="button" onClick={saveSaleRecord} className="admin-desk-btn-primary no-custom-btn px-4 py-2.5 text-sm">Registrar venta</button>
              </div>
            </div>
              </div>

          <div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="admin-desk-section-title">Historial por producto</h2>
              <p className="admin-desk-section-desc">Cambios de estado, pipeline, tareas y ventas.</p>
            </div>
            <select
              value={historyProductId}
              onChange={(e) => setHistoryProductId(e.target.value)}
              className="admin-desk-input md:max-w-sm"
            >
              <option value="">Seleccionar producto</option>
              {productSelectOptions.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          </div>
          <div className="mt-3 rounded-xl border border-white/10 bg-[#141a24] p-3">
            {!historyProductId ? (
              <p className="text-sm text-slate-400">Elegí un producto para ver el historial.</p>
            ) : (
              <div className="space-y-2">
                {(historyByProduct[historyProductId] || []).length === 0 ? (
                  <p className="text-sm text-slate-400">Todavía no hay eventos registrados para este producto.</p>
                ) : (
                  (historyByProduct[historyProductId] || []).map((e) => (
                    <div key={e.id} className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                      <p className="text-sm text-slate-200">{e.message}</p>
                      <p className="mt-0.5 text-[11px] text-slate-400">{new Date(e.ts).toLocaleString('es-AR')}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          </div>

          <div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="admin-desk-section-title">Estadísticas mensuales</h2>
              <p className="admin-desk-section-desc">Movimientos por mes (altas, ediciones y ventas).</p>
            </div>
            <button
              type="button"
              onClick={exportMonthlyStatsCsv}
              className="admin-btn-interact admin-desk-btn-secondary no-custom-btn inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm md:w-auto"
            >
              Exportar tabla mensual
            </button>
          </div>
          <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-white/[0.04] text-slate-300">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Mes</th>
                  <th className="px-4 py-2.5 font-semibold">Altas</th>
                  <th className="px-4 py-2.5 font-semibold">Ediciones</th>
                  <th className="px-4 py-2.5 font-semibold">Ventas</th>
                  <th className="px-4 py-2.5 font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-slate-200">
                {monthlyStats.length === 0 ? (
                  <tr>
                    <td className="px-4 py-4 text-slate-400" colSpan={5}>Sin datos aún para estadísticas mensuales.</td>
                  </tr>
                ) : (
                  monthlyStats.map((m) => (
                    <tr key={m.month}>
                      <td className="px-4 py-2.5">{m.month}</td>
                      <td className="px-4 py-2.5">{m.create}</td>
                      <td className="px-4 py-2.5">{m.update}</td>
                      <td className="px-4 py-2.5">{m.delete}</td>
                      <td className="px-4 py-2.5 font-semibold">{m.total}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          </div>
            </div>
          ) : null}
        </section>

        <section className="admin-desk-card rounded-2xl p-4 sm:p-6 md:p-7">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="admin-desk-section-title">Actividad reciente</h2>
              <p className="admin-desk-section-desc">Últimos cambios (sincronizado entre dispositivos)</p>
            </div>
            <button type="button" onClick={() => startTransition(() => setActivityOpen((v) => !v))} className="admin-btn-interact admin-desk-btn-secondary no-custom-btn inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm md:w-auto">
              {activityOpen ? 'Ocultar' : 'Mostrar'}
              <svg className={`h-4 w-4 transition-transform ${activityOpen ? 'rotate-180' : 'rotate-0'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          {activityOpen ? (
            <div className="mt-4">
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
                        {a.type === 'create' ? 'Creaste' : a.type === 'update' ? 'Actualizaste' : 'Vendiste'}{' '}
                        <span className="font-semibold text-white">{a.label}</span>
                      </p>
                      <span className="whitespace-nowrap text-[11px] text-slate-400">{a.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
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
              <button type="button" onClick={() => startTransition(() => setListOpen((v) => !v))} className="admin-btn-interact admin-desk-btn-secondary no-custom-btn inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm md:w-auto">
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
          {listOpen && !loading && items.length > 0 ? (
            <>
              <div className="mt-4 divide-y divide-white/10 overflow-hidden rounded-xl border border-white/12 bg-[#141a24] py-0">
                {pagedCatalogItems.map((p) => {
                  const ops = opsByProduct[p.id] || DEFAULT_OPS_STATIC
                  return (
                    <AdminCatalogRow
                      key={p.id}
                      product={p}
                      ops={ops}
                      deletingId={deletingId}
                      onRowEdit={handleRowEdit}
                      onRowDelete={handleRowDelete}
                      onStatusChange={setProductStatus}
                      onPipelineChange={setProductPipeline}
                      onContextMenu={(e) => { e.preventDefault(); openRowActionMenu(p) }}
                      onTouchStart={() => handleRowTouchStart(p)}
                      onTouchEnd={handleRowTouchEnd}
                      onTouchMove={handleRowTouchEnd}
                      onTouchCancel={handleRowTouchEnd}
                    />
                  )
                })}
              </div>
              {filteredItems.length > pagedCatalogItems.length ? (
                <button
                  type="button"
                  onClick={() => startTransition(() => setCatalogVisible((n) => n + CATALOG_PAGE_SIZE))}
                  className="admin-btn-interact admin-desk-btn-secondary no-custom-btn mt-3 w-full rounded-xl px-4 py-3 text-sm"
                >
                  Cargar más
                  <span className="ml-1.5 tabular-nums text-slate-400">
                    ({filteredItems.length - pagedCatalogItems.length} restantes)
                  </span>
                </button>
              ) : null}
            </>
          ) : null}
        </section>
      </div>
    </PullToRefresh>
  )
}
