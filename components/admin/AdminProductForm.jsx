"use client"
/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-vars, no-empty */

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import normalizeProduct from '../../lib/utils/normalizeProduct'
import ImageWithSkeleton from '../ImageWithSkeleton'
import { useToast } from '../ToastContext'
import { hapticLight } from '../../lib/haptics'
import {
  PRODUCT_CREATE_DRAFT_KEY,
  hasMeaningfulProductCreateDraft,
  formHasBasicExtra,
  formHasTechnical,
} from '../../lib/admin/productCreateDraft'

function ChevronDown({ open, className = 'h-4 w-4' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function generateSlug(text) {
  if (!text) return ''
  const s = text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return s
}

function parsePriceAndCurrency(rawPrice, rawCurrency) {
  if (typeof rawPrice === 'number' && !Number.isNaN(rawPrice)) {
    const c = rawCurrency === 'ARS' ? 'ARS' : 'USD'
    return { amount: String(rawPrice), currency: c }
  }
  const raw = String(rawPrice || '').trim()
  if (!raw) return { amount: '', currency: rawCurrency === 'ARS' ? 'ARS' : 'USD' }
  const upper = raw.toUpperCase()
  const currencyFromText = upper.startsWith('ARS') ? 'ARS' : 'USD'
  const currency = rawCurrency === 'ARS' || rawCurrency === 'USD' ? rawCurrency : currencyFromText
  const amountMatch = raw.match(/[\d.,]+/)
  const amount = amountMatch ? amountMatch[0].replace(',', '.') : ''
  return { amount, currency }
}

async function addRecentActivityClient(type, label, productId = null) {
  const stamp = Date.now()
  try {
    await fetch('/api/admin/activity', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, label, product_id: productId || undefined }),
    })
  } catch { /* empty */ }
}

/**
 * @param {{ mode: 'create' | 'edit', editingId?: string | null }} props
 */
export default function AdminProductForm({ mode, editingId = null }) {
  const router = useRouter()
  const { toast } = useToast()
  const modalFileInputRef = React.useRef(null)
  const modalGalleryInputRef = React.useRef(null)
  const createDraftFormRef = React.useRef(null)

  const [catalogItems, setCatalogItems] = useState([])
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [productLoading, setProductLoading] = useState(() => mode === 'edit' && Boolean(editingId))

  const [form, setForm] = useState({
    name: '',
    slug: '',
    price: '',
    currency: 'USD',
    image_url: '',
    description: '',
    mics: '',
    wood: '',
    model: '',
    images: [],
    low_cost: false,
    scale_length: '',
    neck_profile: '',
    fingerboard_radius: '',
    fingerboard_material: '',
    neck_construction: '',
    nut_width: '',
    frets: '',
    bridge: '',
    tuners: '',
    hardware_finish: '',
    controls: '',
    switching: '',
    origin: '',
    year: '',
    weight: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [modalGalleryPreviews, setModalGalleryPreviews] = useState([])
  const [modalUploadingMain, setModalUploadingMain] = useState(false)
  const [modalGalleryUploading, setModalGalleryUploading] = useState(false)
  const [modalGalleryDragIndex, setModalGalleryDragIndex] = useState(null)
  const [modalGalleryDragOverIndex, setModalGalleryDragOverIndex] = useState(null)
  const [createDraftSavedAt, setCreateDraftSavedAt] = useState(null)
  const [createDraftRecovered, setCreateDraftRecovered] = useState(false)
  const [moreBasicsOpen, setMoreBasicsOpen] = useState(false)
  const [techOpen, setTechOpen] = useState(false)
  const [galleryExtraOpen, setGalleryExtraOpen] = useState(false)

  function populateFromProduct(p) {
    const parsedPrice = parsePriceAndCurrency(p.price, p.currency)
    setForm({
      name: p.name || '',
      slug: p.slug || '',
      price: parsedPrice.amount,
      currency: parsedPrice.currency,
      image_url: p.image_url || '',
      description: p.description || '',
      mics: p.mics || '',
      wood: p.wood || '',
      model: p.model || '',
      images: Array.isArray(p.images) ? p.images.slice() : [],
      low_cost: p.low_cost === true,
      scale_length: p.scale_length || '',
      neck_profile: p.neck_profile || '',
      fingerboard_radius: p.fingerboard_radius || '',
      fingerboard_material: p.fingerboard_material || '',
      neck_construction: p.neck_construction || '',
      nut_width: p.nut_width || '',
      frets: p.frets || '',
      bridge: p.bridge || '',
      tuners: p.tuners || '',
      hardware_finish: p.hardware_finish || '',
      controls: p.controls || '',
      switching: p.switching || '',
      origin: p.origin || '',
      year: p.year != null ? String(p.year) : '',
      weight: p.weight != null ? String(p.weight) : '',
    })
    setMoreBasicsOpen(formHasBasicExtra(p))
    setTechOpen(
      [
        'fingerboard_radius', 'fingerboard_material', 'neck_construction', 'nut_width', 'frets',
        'bridge', 'tuners', 'hardware_finish', 'controls', 'switching', 'origin', 'year', 'weight',
      ].some((k) => {
        const v = p[k]
        if (v == null) return false
        return String(v).trim() !== ''
      })
    )
    setGalleryExtraOpen(false)
    setModalGalleryPreviews([])
    setModalGalleryDragIndex(null)
    setModalGalleryDragOverIndex(null)
  }

  /** Una sola petición a /api/products: catálogo para duplicados + fila en edición. */
  useEffect(() => {
    let cancelled = false
    async function run() {
      setCatalogLoading(true)
      const editing = mode === 'edit' && Boolean(editingId)
      if (editing) setProductLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/products', { credentials: 'include' })
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
        const data = await res.json()
        const list = Array.isArray(data) ? data.map((d) => normalizeProduct(d)) : []
        if (cancelled) return
        setCatalogItems(list)
        if (editing) {
          const p = list.find((x) => String(x.id) === String(editingId))
          if (!p) setError('No se encontró el producto.')
          else populateFromProduct(p)
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err))
      } finally {
        if (!cancelled) {
          setCatalogLoading(false)
          setProductLoading(false)
        }
      }
    }
    run()
    return () => { cancelled = true }
  }, [mode, editingId])

  useEffect(() => {
    if (mode !== 'create') return
    let nextForm = {
      name: '', slug: '', price: '', image_url: '', description: '', mics: '', wood: '', model: '',
      currency: 'USD',
      images: [], low_cost: false,
      scale_length: '', neck_profile: '', fingerboard_radius: '', fingerboard_material: '',
      neck_construction: '', nut_width: '', frets: '', bridge: '', tuners: '', hardware_finish: '',
      controls: '', switching: '', origin: '', year: '', weight: '',
    }
    let recovered = false
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(PRODUCT_CREATE_DRAFT_KEY)
        if (raw) {
          const parsed = JSON.parse(raw)
          if (parsed?.form && hasMeaningfulProductCreateDraft(parsed.form)) {
            nextForm = {
              ...nextForm,
              ...parsed.form,
              images: Array.isArray(parsed.form.images) ? parsed.form.images : [],
            }
            recovered = true
            if (parsed?.savedAt) setCreateDraftSavedAt(parsed.savedAt)
          }
        }
      } catch { /* empty */ }
    }
    setCreateDraftRecovered(recovered)
    setForm(nextForm)
    setMoreBasicsOpen(formHasBasicExtra(nextForm))
    setTechOpen(formHasTechnical(nextForm))
    setGalleryExtraOpen(Array.isArray(nextForm.images) && nextForm.images.length > 0)
    setModalGalleryPreviews([])
  }, [mode])

  useEffect(() => {
    if (mode === 'create') {
      createDraftFormRef.current = form
    } else {
      createDraftFormRef.current = null
    }
  }, [mode, form])

  useEffect(() => {
    if (typeof window === 'undefined' || mode !== 'create') return

    function saveDraftOnUnload() {
      const f = createDraftFormRef.current
      if (!f || !hasMeaningfulProductCreateDraft(f)) return
      try {
        localStorage.setItem(PRODUCT_CREATE_DRAFT_KEY, JSON.stringify({ savedAt: Date.now(), form: f }))
      } catch { /* empty */ }
    }

    window.addEventListener('beforeunload', saveDraftOnUnload)
    window.addEventListener('pagehide', saveDraftOnUnload)
    return () => {
      window.removeEventListener('beforeunload', saveDraftOnUnload)
      window.removeEventListener('pagehide', saveDraftOnUnload)
    }
  }, [mode])

  useEffect(() => {
    if (mode !== 'create' || typeof window === 'undefined') return
    const timer = setTimeout(() => {
      try {
        if (!hasMeaningfulProductCreateDraft(form)) {
          localStorage.removeItem(PRODUCT_CREATE_DRAFT_KEY)
          setCreateDraftSavedAt(null)
          return
        }
        const payload = { savedAt: Date.now(), form }
        localStorage.setItem(PRODUCT_CREATE_DRAFT_KEY, JSON.stringify(payload))
        setCreateDraftSavedAt(payload.savedAt)
      } catch { /* empty */ }
    }, 700)
    return () => clearTimeout(timer)
  }, [mode, form])

  function handleModalChange(e) {
    const { name, value, type } = e.target
    const next = type === 'checkbox' ? e.target.checked : value
    setForm((prev) => ({ ...prev, [name]: next }))
  }

  async function handleSave(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      if (!form.name || !String(form.name).trim()) throw new Error('El nombre es requerido')
      if (form.price === undefined || form.price === null || String(form.price).trim() === '') {
        throw new Error('El precio es requerido')
      }
      const priceNumber = Number(String(form.price).replace(',', '.'))
      if (Number.isNaN(priceNumber)) throw new Error('El precio debe ser un número')
      if (form.currency !== 'USD' && form.currency !== 'ARS') {
        throw new Error('Seleccioná la moneda del precio')
      }

      const genSlug = generateSlug(form.name)
      const nameNormalized = String(form.name).trim().toLowerCase()
      const duplicate = catalogItems.some((it) => {
        if (mode === 'edit' && editingId && String(it.id) === String(editingId)) return false
        const itName = String(it.name || '').trim().toLowerCase()
        const itSlug = String(it.slug || '').trim()
        return itName === nameNormalized || (itSlug && itSlug === genSlug)
      })
      if (duplicate) throw new Error('Dos productos no deben llamarse igual')

      if (modalUploadingMain || modalGalleryUploading) {
        throw new Error('Esperá a que terminen de subir las imágenes antes de guardar.')
      }
      const mainImg = String(form.image_url || '').trim()
      if (mainImg && /^blob:|^data:/i.test(mainImg)) {
        throw new Error('La imagen principal aún no terminó de subirse. Esperá unos segundos e intentá de nuevo.')
      }
      if (Array.isArray(form.images) && form.images.some((u) => /^blob:|^data:/i.test(String(u || '')))) {
        throw new Error('Hay fotos de la galería que aún se están subiendo. Esperá e intentá de nuevo.')
      }

      const payload = {
        name: form.name || undefined,
        slug: genSlug || undefined,
        price: priceNumber,
        currency: form.currency,
        image_url: form.image_url || undefined,
        images: Array.isArray(form.images) && form.images.length ? form.images : undefined,
        description: form.description || undefined,
        mics: form.mics || undefined,
        wood: form.wood || undefined,
        model: form.model || undefined,
        low_cost: Boolean(form.low_cost),
        scale_length: form.scale_length || undefined,
        neck_profile: form.neck_profile || undefined,
        fingerboard_radius: form.fingerboard_radius || undefined,
        fingerboard_material: form.fingerboard_material || undefined,
        neck_construction: form.neck_construction || undefined,
        nut_width: form.nut_width || undefined,
        frets: form.frets || undefined,
        bridge: form.bridge || undefined,
        tuners: form.tuners || undefined,
        hardware_finish: form.hardware_finish || undefined,
        controls: form.controls || undefined,
        switching: form.switching || undefined,
        origin: form.origin || undefined,
        year: form.year && !Number.isNaN(Number(form.year)) ? Number(form.year) : undefined,
        weight: form.weight && !Number.isNaN(Number(String(form.weight).replace(',', '.')))
          ? Number(String(form.weight).replace(',', '.'))
          : undefined,
      }

      let res
      if (mode === 'edit') {
        if (!editingId) throw new Error('Falta el identificador del producto.')
        res = await fetch('/api/products', {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...payload }),
        })
      } else {
        if (!payload.image_url) throw new Error('La imagen principal es requerida')
        res = await fetch('/api/products', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (!res.ok) {
        const txt = await res.text().catch(() => '')
        throw new Error(`${res.status} ${res.statusText} ${txt}`)
      }

      if (mode === 'create' && typeof window !== 'undefined') {
        try { localStorage.removeItem(PRODUCT_CREATE_DRAFT_KEY) } catch { /* empty */ }
        setCreateDraftSavedAt(null)
      }

      const actType = mode === 'edit' ? 'update' : 'create'
      await addRecentActivityClient(actType, form.name || 'Producto', mode === 'edit' ? editingId : null)
      toast(mode === 'edit' ? 'Producto actualizado' : 'Producto creado', 'success')
      hapticLight()
      router.push('/admin/productos/catalogo')
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
      toast(msg, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleModalFileChange(e) {
    const files = e.target.files
    if (!files || !files.length) return
    const file = files[0]
    const tempUrl = URL.createObjectURL(file)
    setForm((prev) => ({ ...prev, image_url: tempUrl }))
    setModalUploadingMain(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const upRes = await fetch('/api/upload-image', { method: 'POST', credentials: 'include', body: fd })
      if (!upRes.ok) {
        const txt = await upRes.text().catch(() => '')
        throw new Error(`Error al subir la imagen: ${upRes.status} ${txt}`)
      }
      const upData = await upRes.json()
      const url = upData?.url
      if (!url) throw new Error('No se obtuvo la URL pública de la imagen')
      setForm((prev) => ({ ...prev, image_url: url }))
      try { URL.revokeObjectURL(tempUrl) } catch { /* empty */ }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setModalUploadingMain(false)
    }
  }

  async function handleModalGalleryChange(e) {
    const list = e.target.files
    if (!list || list.length === 0) return
    setGalleryExtraOpen(true)
    setError(null)
    setModalGalleryUploading(true)
    try {
      const files = Array.from(list)
      const placeholders = files.map((f) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
        let url = null
        try { url = URL.createObjectURL(f) } catch { url = '' }
        return { id, url, name: f.name, uploading: true, __file: f }
      })
      setModalGalleryPreviews((prev) => [...prev, ...placeholders.map((p) => ({ id: p.id, url: p.url, name: p.name, uploading: true }))])

      for (const ph of placeholders) {
        try {
          const fd = new FormData()
          fd.append('file', ph.__file)
          const upRes = await fetch('/api/upload-image', { method: 'POST', credentials: 'include', body: fd })
          if (!upRes.ok) {
            const txt = await upRes.text().catch(() => '')
            throw new Error(`Error al subir una imagen de galería: ${upRes.status} ${txt}`)
          }
          const upData = await upRes.json()
          const url = upData?.url
          if (!url) throw new Error('No se obtuvo la URL pública de una imagen de galería')
          setModalGalleryPreviews((prev) => prev.map((p) => (p.id === ph.id ? { id: p.id, url, name: p.name, uploading: false } : p)))
          setForm((prev) => ({ ...prev, images: Array.isArray(prev.images) ? [...prev.images, url] : [url] }))
        } catch (err) {
          setError(err instanceof Error ? err.message : String(err))
          setModalGalleryPreviews((prev) => prev.filter((p) => p.id !== ph.id))
        } finally {
          try { if (ph.url) URL.revokeObjectURL(ph.url) } catch { /* empty */ }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setModalGalleryUploading(false)
    }
  }

  function handleModalRemoveGallery(index) {
    setForm((prev) => {
      const nextImgs = Array.isArray(prev.images) ? prev.images.slice() : []
      nextImgs.splice(index, 1)
      return { ...prev, images: nextImgs }
    })
    setModalGalleryPreviews((prev) => {
      const next = prev.slice()
      next.splice(index, 1)
      return next
    })
  }

  function reorderArray(arr, from, to) {
    if (!Array.isArray(arr)) return arr
    if (from === to || from < 0 || to < 0 || from >= arr.length || to >= arr.length) return arr
    const next = arr.slice()
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    return next
  }

  const canReorderModalGallery = mode === 'create'
    && Array.isArray(modalGalleryPreviews)
    && modalGalleryPreviews.length > 1
    && modalGalleryPreviews.every((p) => !p.uploading)
    && Array.isArray(form.images)
    && form.images.length === modalGalleryPreviews.length

  function handleGalleryDragStart(index) {
    if (!canReorderModalGallery) return
    setModalGalleryDragIndex(index)
    setModalGalleryDragOverIndex(index)
  }

  function handleGalleryDragOver(e, index) {
    if (!canReorderModalGallery) return
    e.preventDefault()
    if (modalGalleryDragOverIndex !== index) setModalGalleryDragOverIndex(index)
  }

  function handleGalleryDrop(e, dropIndex) {
    if (!canReorderModalGallery) return
    e.preventDefault()
    const from = modalGalleryDragIndex
    if (from === null || from === undefined) return
    if (from === dropIndex) return
    setModalGalleryPreviews((prev) => reorderArray(prev, from, dropIndex))
    setForm((prev) => ({ ...prev, images: reorderArray(prev.images || [], from, dropIndex) }))
  }

  function handleGalleryDragEnd() {
    setModalGalleryDragIndex(null)
    setModalGalleryDragOverIndex(null)
  }

  function goBack() {
    router.push('/admin/productos/catalogo')
  }

  if (catalogLoading || productLoading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#1a1d26]/90 p-8 text-center text-slate-400">
        Cargando…
      </div>
    )
  }

  const subtitle = mode === 'edit'
    ? 'Actualizá la ficha y las fotos; los cambios se reflejan en la tienda al guardar.'
    : createDraftRecovered
      ? 'Borrador recuperado automáticamente.'
      : createDraftSavedAt
        ? 'Borrador guardado automáticamente.'
        : 'Nombre, precio y foto principal alcanzan; el resto es opcional y está agrupado abajo.'

  return (
    <div className="dark overflow-hidden rounded-2xl border border-white/10 bg-[#1a1d26] shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
      <div className="border-b border-white/10 bg-[#1a1d26] px-5 pb-4 pt-5 sm:px-7 sm:pb-5 sm:pt-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
            <span className="inline-flex items-center rounded-full border border-white/12 bg-white/[0.06] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-300">
              {mode === 'edit' ? 'Edición' : 'Alta'}
            </span>
            <h2 id="admin-product-form-title" className="text-xl font-semibold tracking-tight text-slate-50 sm:text-2xl">
              {mode === 'edit' ? 'Editar producto' : 'Nuevo producto'}
            </h2>
            <p className="text-sm leading-snug text-slate-400">{subtitle}</p>
          </div>
        </div>
      </div>

      <div className="bg-[#14161e] px-5 py-5 sm:px-7 sm:py-6">
        {error ? <div className="mb-4 rounded-xl border border-rose-500/35 bg-rose-950/55 p-3 text-sm text-rose-100">{error}</div> : null}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
            <div className="space-y-3 rounded-xl border border-white/10 bg-[#1a1d26]/90 p-4 sm:p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Lo esencial</p>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-200">Nombre</label>
                <input name="name" value={form.name} onChange={handleModalChange} className="admin-desk-input" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-200">Precio</label>
                <input
                  name="price"
                  value={form.price}
                  onChange={handleModalChange}
                  className="admin-desk-input"
                  inputMode="decimal"
                  placeholder="Ej: 1500 o 1500.50"
                />
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-200">
                    <input
                      type="radio"
                      name="currency"
                      value="USD"
                      checked={form.currency === 'USD'}
                      onChange={handleModalChange}
                      className="h-4 w-4"
                      required
                    />
                    <span>USD (dólares)</span>
                  </label>
                  <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-200">
                    <input
                      type="radio"
                      name="currency"
                      value="ARS"
                      checked={form.currency === 'ARS'}
                      onChange={handleModalChange}
                      className="h-4 w-4"
                      required
                    />
                    <span>Pesos argentinos (ARS)</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-200">Descripción</label>
                <textarea name="description" value={form.description} onChange={handleModalChange} className="admin-desk-input" rows="4" placeholder="Opcional en alta; recomendado para la ficha pública." />
              </div>
              <div className="flex items-center gap-2 pt-0.5">
                <input type="checkbox" id="product-form-low-cost" name="low_cost" checked={Boolean(form.low_cost)} onChange={handleModalChange} className="rounded border-white/25 bg-white/5 text-indigo-400 focus:ring-indigo-400" />
                <label htmlFor="product-form-low-cost" className="text-sm font-medium text-slate-200">Incluir en sección Low cost</label>
              </div>

              <button
                type="button"
                onClick={() => setMoreBasicsOpen((v) => !v)}
                className="admin-btn-interact flex w-full items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-left text-sm font-medium text-slate-200 no-custom-btn hover:bg-white/[0.07]"
                aria-expanded={moreBasicsOpen}
              >
                <span>Modelo, madera, pastillas, escala…</span>
                <ChevronDown open={moreBasicsOpen} />
              </button>
              {moreBasicsOpen ? (
                <div className="space-y-3 border-t border-white/10 pt-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-200">Modelo (model)</label>
                    <input name="model" value={form.model} onChange={handleModalChange} className="admin-desk-input" placeholder="Ej: Stratocaster" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-200">Madera del cuerpo (wood)</label>
                    <input name="wood" value={form.wood} onChange={handleModalChange} className="admin-desk-input" placeholder="Ej: Alder" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-200">Micrófonos (mics)</label>
                    <input name="mics" value={form.mics} onChange={handleModalChange} className="admin-desk-input" placeholder="Ej: SSS" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-200">Escala</label>
                    <input name="scale_length" value={form.scale_length} onChange={handleModalChange} className="admin-desk-input" placeholder='Ej: 25.5"' />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-200">Perfil de mástil</label>
                    <input name="neck_profile" value={form.neck_profile} onChange={handleModalChange} className="admin-desk-input" placeholder="Ej: C slim, D moderno" />
                  </div>
                </div>
              ) : null}
            </div>

            <div className="space-y-3 rounded-xl border border-white/10 bg-[#1a1d26]/90 p-4 sm:p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Foto principal</p>
              <p className="text-[11px] text-slate-500">Vista frontal; es la que se muestra primero en la tienda.</p>
              <div>
                {form.image_url ? (
                  <div className="relative mb-2 h-36 w-full overflow-hidden rounded-xl border border-white/10 bg-[#0f1117] sm:h-40">
                    <ImageWithSkeleton src={form.image_url} alt="Imagen principal" fill quality={70} className="h-full w-full" disableClientPreview />
                    {modalUploadingMain ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                        <svg className="h-6 w-6 animate-spin text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
                      </div>
                    ) : null}
                  </div>
                ) : null}
                <input ref={modalFileInputRef} type="file" accept="image/*" onChange={handleModalFileChange} className="hidden" />
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button type="button" className="admin-desk-btn-primary no-custom-btn px-3 py-2" onClick={() => modalFileInputRef.current && modalFileInputRef.current.click()}>Subir imagen</button>
                  <button type="button" className="admin-desk-btn-ghost no-custom-btn px-3 py-2" onClick={() => setForm((prev) => ({ ...prev, image_url: '' }))} disabled={!form.image_url}>Quitar</button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setTechOpen((v) => !v)}
                className="admin-btn-interact flex w-full items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-left text-sm font-medium text-slate-200 no-custom-btn hover:bg-white/[0.07]"
                aria-expanded={techOpen}
              >
                <span>Ficha técnica detallada</span>
                <ChevronDown open={techOpen} />
              </button>
              {techOpen ? (
                <div className="grid grid-cols-1 gap-3 border-t border-white/10 pt-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-200">Radio del diapasón</label>
                    <input name="fingerboard_radius" value={form.fingerboard_radius} onChange={handleModalChange} className="admin-desk-input" placeholder='Ej: 9.5"' />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-200">Madera del diapasón</label>
                    <input name="fingerboard_material" value={form.fingerboard_material} onChange={handleModalChange} className="admin-desk-input" placeholder="Ej: Rosewood, Maple" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-200">Construcción del mástil</label>
                    <input name="neck_construction" value={form.neck_construction} onChange={handleModalChange} className="admin-desk-input" placeholder="Ej: Bolt-on, Set-neck" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-200">Ancho de cejuela</label>
                    <input name="nut_width" value={form.nut_width} onChange={handleModalChange} className="admin-desk-input" placeholder="Ej: 42 mm" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-200">Trastes</label>
                    <input name="frets" value={form.frets} onChange={handleModalChange} className="admin-desk-input" placeholder="Ej: 22 medium jumbo" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-200">Puente</label>
                    <input name="bridge" value={form.bridge} onChange={handleModalChange} className="admin-desk-input" placeholder="Ej: Floyd Rose, hardtail" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-200">Clavijas</label>
                    <input name="tuners" value={form.tuners} onChange={handleModalChange} className="admin-desk-input" placeholder="Ej: Gotoh locking" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-200">Terminación del hardware</label>
                    <input name="hardware_finish" value={form.hardware_finish} onChange={handleModalChange} className="admin-desk-input" placeholder="Ej: Chrome, Gold" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-200">Controles</label>
                    <input name="controls" value={form.controls} onChange={handleModalChange} className="admin-desk-input" placeholder="Ej: 1 volumen, 1 tono, selector 5 posiciones" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-200">Conmutación (switching)</label>
                    <input name="switching" value={form.switching} onChange={handleModalChange} className="admin-desk-input" placeholder="Ej: Push-pull para coil split" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-200">Origen</label>
                    <input name="origin" value={form.origin} onChange={handleModalChange} className="admin-desk-input" placeholder="Ej: Japón, México" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-200">Año</label>
                    <input name="year" value={form.year} onChange={handleModalChange} className="admin-desk-input" placeholder="Ej: 2014" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-200">Peso (kg aprox.)</label>
                    <input name="weight" value={form.weight} onChange={handleModalChange} className="admin-desk-input" placeholder="Ej: 3.6" />
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {mode === 'create' ? (
            <div className="space-y-3 rounded-xl border border-white/10 bg-[#1a1d26]/90 p-4 sm:p-5">
              <button
                type="button"
                onClick={() => setGalleryExtraOpen((v) => !v)}
                className="admin-btn-interact flex w-full items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-left text-sm font-medium text-slate-200 no-custom-btn hover:bg-white/[0.07]"
                aria-expanded={galleryExtraOpen}
              >
                <span>
                  Fotos extra para la ficha
                  {modalGalleryPreviews.length > 0 ? (
                    <span className="ml-1.5 font-normal text-slate-400">({modalGalleryPreviews.length})</span>
                  ) : null}
                </span>
                <ChevronDown open={galleryExtraOpen} />
              </button>
              {!galleryExtraOpen ? (
                <p className="text-[11px] text-slate-500">Opcional: hasta 2 imágenes más (trasera, trastera o pala). Abrí esta sección cuando las necesites.</p>
              ) : null}
              {galleryExtraOpen ? (
                <>
                  <p className="text-[11px] text-slate-400">2.ª = vista trasera · 3.ª = trastera o pala.</p>
                  <input ref={modalGalleryInputRef} type="file" accept="image/*" multiple onChange={handleModalGalleryChange} className="hidden" />
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button type="button" className="admin-desk-btn-primary no-custom-btn px-3 py-2" onClick={() => modalGalleryInputRef.current && modalGalleryInputRef.current.click()}>Subir imágenes</button>
                    <button type="button" className="admin-desk-btn-ghost no-custom-btn px-3 py-2" onClick={() => { setForm((prev) => ({ ...prev, images: [] })); setModalGalleryPreviews([]); setModalGalleryDragIndex(null); setModalGalleryDragOverIndex(null) }}>Limpiar galería</button>
                  </div>
                  {canReorderModalGallery ? (
                    <p className="mt-1 text-[11px] text-slate-500">Arrastrá las miniaturas para ordenar.</p>
                  ) : null}
                  {modalGalleryPreviews.length > 0 ? (
                    <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {modalGalleryPreviews.map((p, i) => (
                        <div key={p.id} className="w-full">
                          <div
                            className={`relative h-16 w-full overflow-hidden rounded-lg border group ${modalGalleryDragOverIndex === i && modalGalleryDragIndex !== i ? 'border-[var(--vintage-gold)]/80 ring-1 ring-[var(--vintage-gold)]/35' : 'border-white/12'} ${canReorderModalGallery ? 'cursor-grab active:cursor-grabbing' : ''}`}
                            draggable={canReorderModalGallery}
                            onDragStart={() => handleGalleryDragStart(i)}
                            onDragOver={(e) => handleGalleryDragOver(e, i)}
                            onDrop={(e) => handleGalleryDrop(e, i)}
                            onDragEnd={handleGalleryDragEnd}
                          >
                            <ImageWithSkeleton src={p.url} alt={p.name || (`Imagen ${i + 1}`)} fill quality={68} className="h-full w-full" disableClientPreview />
                            {p.uploading ? (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                                <svg className="h-5 w-5 animate-spin text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
                              </div>
                            ) : null}
                            {canReorderModalGallery ? (
                              <div className="absolute left-1 top-1 z-10 rounded border border-white/15 bg-black/50 px-1.5 py-0.5 text-[10px] text-white">
                                {i === 0 ? '2. Atrás' : i === 1 ? '3. Trastera/pala' : i + 1}
                              </div>
                            ) : null}
                            {!p.uploading ? (
                              <button type="button" onClick={() => handleModalRemoveGallery(i)} aria-label="Eliminar imagen" className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-600 text-white shadow-sm hover:bg-rose-700">×</span>
                              </button>
                            ) : null}
                          </div>
                          <div className="mt-1 truncate text-xs text-slate-300">
                            {i === 0 ? 'Vista trasera' : i === 1 ? 'Trastera o pala' : p.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>
          ) : null}

          <div className="mt-2 flex flex-col gap-2 border-t border-white/10 pt-5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            <button type="submit" className="admin-desk-btn-primary no-custom-btn order-2 w-full px-5 py-3 sm:order-1 sm:w-auto sm:min-h-0" disabled={submitting || modalUploadingMain || modalGalleryUploading}>
              {submitting ? (mode === 'edit' ? 'Guardando…' : 'Creando…') : (modalUploadingMain || modalGalleryUploading) ? 'Subiendo imágenes…' : (mode === 'edit' ? 'Guardar cambios' : 'Crear producto')}
            </button>
            <button type="button" className="admin-desk-btn-ghost no-custom-btn order-1 w-full px-5 py-3 sm:order-2 sm:w-auto sm:min-h-0" onClick={goBack}>Volver a productos</button>
          </div>
        </form>
      </div>
    </div>
  )
}
