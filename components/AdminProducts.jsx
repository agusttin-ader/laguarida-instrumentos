"use client"
/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-vars, no-empty */

import React, { useEffect, useState } from 'react'
import normalizeProduct from '../lib/utils/normalizeProduct'
import imageService from '../lib/utils/imageService'
import ImageWithSkeleton from './ImageWithSkeleton'
import PullToRefresh from './PullToRefresh'
import { useToast } from './ToastContext'
import { hapticLight } from '../lib/haptics'

const CREATE_DRAFT_KEY = 'admin:create:draft:v1'

export default function AdminProducts(){
  const modalFileInputRef = React.useRef(null)
  const mainFileInputRef = React.useRef(null)
  const modalGalleryInputRef = React.useRef(null)
  const quickInputRef = React.useRef(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [listOpen, setListOpen] = useState(false)
  const [form, setForm] = useState({ name: '', slug: '', price: '', image_url: '', description: '', mics: '', wood: '', model: '' })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(null)
  const [lastGeneratedSlug, setLastGeneratedSlug] = useState('')
  const [mainFile, setMainFile] = useState(null) // single File for main image
  const [mainPreview, setMainPreview] = useState(null) // {id,url,name}
  const [galleryFiles, setGalleryFiles] = useState([]) // array of File for gallery
  const [galleryPreviews, setGalleryPreviews] = useState([]) // array of {id, url, name}
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [fileValidationError, setFileValidationError] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalForm, setModalForm] = useState({
    name: '',
    slug: '',
    price: '',
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
    weight: ''
  })
  const [modalMode, setModalMode] = useState('edit') // 'edit' | 'create'
  const [modalGalleryPreviews, setModalGalleryPreviews] = useState([]) // {id,url,name}
  const [modalUploadingMain, setModalUploadingMain] = useState(false)
  const [modalGalleryUploading, setModalGalleryUploading] = useState(false)
  const [modalClosing, setModalClosing] = useState(false)
  const [modalGalleryDragIndex, setModalGalleryDragIndex] = useState(null)
  const [modalGalleryDragOverIndex, setModalGalleryDragOverIndex] = useState(null)
  const [createDraftSavedAt, setCreateDraftSavedAt] = useState(null)
  const [createDraftRecovered, setCreateDraftRecovered] = useState(false)
  const [quickOpen, setQuickOpen] = useState(false)
  const [quickQ, setQuickQ] = useState('')
  const [recentActivity, setRecentActivity] = useState([])
  const [adminQ, setAdminQ] = useState('')
  const [actionProduct, setActionProduct] = useState(null) // long-press / context menu: product for Editar/Eliminar
  const longPressTimerRef = React.useRef(null)
  const longPressSuppressRef = React.useRef(false)
  const { toast } = useToast()

  const filteredItems = React.useMemo(() => {
    if (!Array.isArray(items)) return []
    if (!adminQ || String(adminQ).trim() === '') return items
    const ql = String(adminQ).trim().toLowerCase()
    return items.filter(p => (String(p.name || p.slug || '')).toLowerCase().includes(ql))
  }, [items, adminQ])

  useEffect(() => {
    return () => {
      if (mainPreview) {
        try { URL.revokeObjectURL(mainPreview.url) } catch { /* empty */ }
      }
      galleryPreviews.forEach(p => {
        try { URL.revokeObjectURL(p.url) } catch { /* empty */ }
      })
    }
  }, [mainPreview, galleryPreviews])

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    function onKeyDown(e){
      const key = String(e.key || '').toLowerCase()
      if ((e.metaKey || e.ctrlKey) && key === 'k') {
        e.preventDefault()
        if (modalOpen) return
        setQuickOpen(v => !v)
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
  }, [quickOpen, modalOpen])

  useEffect(() => {
    if (!quickOpen) return
    const t = setTimeout(() => quickInputRef.current?.focus(), 10)
    return () => clearTimeout(t)
  }, [quickOpen])

  // Lock body scroll when modal (create/edit product) is open
  useEffect(() => {
    if (typeof document === 'undefined') return
    if (modalOpen) {
      document.body.classList.add('modal-open')
    } else {
      document.body.classList.remove('modal-open')
    }
    return () => document.body.classList.remove('modal-open')
  }, [modalOpen])

  // No client-side filters in admin list; show full items array

  async function load(){
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/products', { credentials: 'include' })
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      const data = await res.json()
      setItems(Array.isArray(data) ? data.map(d => normalizeProduct(d)) : [])
    } catch (err){
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  function handleChange(e){
    const { name, value } = e.target
    // Auto-generate slug from name when appropriate
    if (name === 'name'){
      const gen = generateSlug(value)
      setForm(prev => ({
        ...prev,
        name: value,
        slug: (prev.slug === '' || prev.slug === lastGeneratedSlug) ? gen : prev.slug
      }))
      setLastGeneratedSlug(gen)
      return
    }

    setForm(prev => ({ ...prev, [name]: value }))
  }

  function startEdit(p){
    // open modal and populate modalForm with product data
    setEditingId(p.id)
    setModalMode('edit')
    setModalForm({
      name: p.name || '',
      slug: p.slug || '',
      price: p.price || '',
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
      weight: p.weight != null ? String(p.weight) : ''
    })
    // do not populate or show gallery in edit mode (gallery only available when creating)
    setModalOpen(true)
  }

  function handleModalChange(e){
    const { name, value, type } = e.target
    const next = type === 'checkbox' ? e.target.checked : value
    setModalForm(prev => ({ ...prev, [name]: next }))
  }

  async function handleSaveEdit(e){
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(null)
    try {
      if (!modalForm.name || !String(modalForm.name).trim()) throw new Error('El nombre es requerido')
      if (modalForm.price === undefined || modalForm.price === null || String(modalForm.price).trim() === '') throw new Error('El precio es requerido')
      const priceNumber = Number(String(modalForm.price).replace(',', '.'))
      if (Number.isNaN(priceNumber)) throw new Error('El precio debe ser un número')

      const genSlug = generateSlug(modalForm.name)
      const nameNormalized = String(modalForm.name).trim().toLowerCase()
      const duplicate = items.some(it => {
        if (editingId && it.id === editingId) return false
        const itName = String(it.name || '').trim().toLowerCase()
        const itSlug = String(it.slug || '').trim()
        return itName === nameNormalized || (itSlug && itSlug === genSlug)
      })
      if (duplicate) throw new Error('Dos productos no deben llamarse igual')

      const payload = {
        name: modalForm.name || undefined,
        slug: genSlug || undefined,
        price: priceNumber,
        image_url: modalForm.image_url || undefined,
        images: Array.isArray(modalForm.images) && modalForm.images.length ? modalForm.images : undefined,
        description: modalForm.description || undefined,
        mics: modalForm.mics || undefined,
        wood: modalForm.wood || undefined,
        model: modalForm.model || undefined,
        low_cost: Boolean(modalForm.low_cost),
        scale_length: modalForm.scale_length || undefined,
        neck_profile: modalForm.neck_profile || undefined,
        fingerboard_radius: modalForm.fingerboard_radius || undefined,
        fingerboard_material: modalForm.fingerboard_material || undefined,
        neck_construction: modalForm.neck_construction || undefined,
        nut_width: modalForm.nut_width || undefined,
        frets: modalForm.frets || undefined,
        bridge: modalForm.bridge || undefined,
        tuners: modalForm.tuners || undefined,
        hardware_finish: modalForm.hardware_finish || undefined,
        controls: modalForm.controls || undefined,
        switching: modalForm.switching || undefined,
        origin: modalForm.origin || undefined,
        year: modalForm.year && !Number.isNaN(Number(modalForm.year)) ? Number(modalForm.year) : undefined,
        weight: modalForm.weight && !Number.isNaN(Number(String(modalForm.weight).replace(',', '.'))) ? Number(String(modalForm.weight).replace(',', '.')) : undefined,
      }

      let res
      if (modalMode === 'edit') {
        res = await fetch('/api/products', {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...payload })
        })
      } else {
        // create flow from modal — require image_url (uploaded via modal) or allow if provided
        if (!payload.image_url) throw new Error('La imagen principal es requerida')
        res = await fetch('/api/products', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      }

      if (!res.ok) {
        const txt = await res.text().catch(() => '')
        throw new Error(`${res.status} ${res.statusText} ${txt}`)
      }
      await load()
      if (modalMode === 'create' && typeof window !== 'undefined') {
        try { localStorage.removeItem(CREATE_DRAFT_KEY) } catch { /* empty */ }
        setCreateDraftSavedAt(null)
      }
      // close modal and clear previews
      closeModal()
      addRecentActivity(
        modalMode === 'edit' ? 'update' : 'create',
        modalForm.name || 'Producto'
      )
      setSuccess(modalMode === 'edit' ? 'Producto actualizado correctamente' : 'Producto creado correctamente')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err){
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSubmitting(false)
    }
  }

  function closeModal(){
    // play exit animation then unmount
    setModalClosing(true)
    setTimeout(() => {
      setModalOpen(false)
      setEditingId(null)
      setModalGalleryPreviews([])
      setModalGalleryDragIndex(null)
      setModalGalleryDragOverIndex(null)
      setCreateDraftRecovered(false)
      setModalClosing(false)
    }, 240) // matches CSS exit duration
  }

  function hasMeaningfulCreateDraft(f){
    if (!f || typeof f !== 'object') return false
    const keys = ['name', 'price', 'description', 'image_url', 'model', 'wood', 'mics']
    const hasText = keys.some(k => String(f[k] || '').trim() !== '')
    const hasImages = Array.isArray(f.images) && f.images.length > 0
    return hasText || hasImages
  }

  function openCreateModal(){
    setModalMode('create')
    let nextForm = { name: '', slug: '', price: '', image_url: '', description: '', mics: '', wood: '', model: '', images: [], low_cost: false }
    let recovered = false

    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(CREATE_DRAFT_KEY)
        if (raw) {
          const parsed = JSON.parse(raw)
          if (parsed?.form && hasMeaningfulCreateDraft(parsed.form)) {
            nextForm = {
              ...nextForm,
              ...parsed.form,
              images: Array.isArray(parsed.form.images) ? parsed.form.images : []
            }
            recovered = true
            if (parsed?.savedAt) setCreateDraftSavedAt(parsed.savedAt)
          }
        }
      } catch { /* empty */ }
    }

    setCreateDraftRecovered(recovered)
    setModalForm(nextForm)
    setEditingId(null)
    setModalGalleryPreviews([])
    setModalOpen(true)
  }

  useEffect(() => {
    if (!modalOpen || modalMode !== 'create') return
    if (typeof window === 'undefined') return

    const timer = setTimeout(() => {
      try {
        if (!hasMeaningfulCreateDraft(modalForm)) {
          localStorage.removeItem(CREATE_DRAFT_KEY)
          setCreateDraftSavedAt(null)
          return
        }
        const payload = { savedAt: Date.now(), form: modalForm }
        localStorage.setItem(CREATE_DRAFT_KEY, JSON.stringify(payload))
        setCreateDraftSavedAt(payload.savedAt)
      } catch { /* empty */ }
    }, 700)

    return () => clearTimeout(timer)
  }, [modalOpen, modalMode, modalForm])

  function handleFileChange(e){
    // Gallery files (multiple)
    const list = e.target.files
    if (!list || list.length === 0) return
    processSelectedFiles(Array.from(list))
  }

  function processSelectedFiles(list){
    // handles gallery file selection (multiple)
    setUploadError(null)
    setFileValidationError(null)
    if (!Array.isArray(list) || list.length === 0) return
    const MAX_SIZE = 2 * 1024 * 1024 // 2MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const allowedExts = ['jpg','jpeg','png','webp']
    const nextFiles = []
    const nextPreviews = []
    for (const f of list) {
      const name = f.name || ''
      const ext = name.split('.').pop()?.toLowerCase() || ''
      if (f.size > MAX_SIZE) {
        setFileValidationError('Al menos un archivo supera el tamaño máximo de 2 MB')
        return
      }
      if (!allowedTypes.includes(f.type) && !allowedExts.includes(ext)) {
        setFileValidationError('Al menos un archivo tiene tipo no permitido. Usa JPG, PNG o WEBP.')
        return
      }
      nextFiles.push(f)
      try {
        const url = URL.createObjectURL(f)
        nextPreviews.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`, url, name: f.name })
        } catch {
          /* empty */
        }
    }
    // append to existing gallery
    setGalleryFiles(prev => [...prev, ...nextFiles])
    setGalleryPreviews(prev => [...prev, ...nextPreviews])
  }

  function handleMainFileChange(e){
    setUploadError(null)
    setFileValidationError(null)
    const f = e.target.files && e.target.files[0]
    if (!f) return
    const MAX_SIZE = 2 * 1024 * 1024 // 2MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const name = f.name || ''
    const ext = name.split('.').pop()?.toLowerCase() || ''
    if (f.size > MAX_SIZE) {
      setFileValidationError('El archivo supera el tamaño máximo de 2 MB')
      return
    }
    if (!allowedTypes.includes(f.type) && !['jpg','jpeg','png','webp'].includes(ext)) {
      setFileValidationError('Tipo de archivo no permitido. Usa JPG, PNG o WEBP.')
      return
    }
    try {
      const url = URL.createObjectURL(f)
      const preview = { id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`, url, name: f.name }
      // revoke previous main preview
      if (mainPreview) {
        try { URL.revokeObjectURL(mainPreview.url) } catch { /* empty */ }
      }
      setMainFile(f)
      setMainPreview(preview)
    } catch (err) {
      setMainFile(f)
      setMainPreview(null)
    }
  }

  function removeGallerySelected(index){
    setGalleryFiles(prev => {
      const next = [...prev]
      next.splice(index,1)
      return next
    })
    setGalleryPreviews(prev => {
      const next = [...prev]
      const removed = next.splice(index,1)
      if (removed && removed[0]) {
        try { URL.revokeObjectURL(removed[0].url) } catch { /* empty */ }
      }
      return next
    })
  }

  function removeMainSelected(){
    if (mainPreview) {
      try { URL.revokeObjectURL(mainPreview.url) } catch { /* empty */ }
    }
    setMainFile(null)
    setMainPreview(null)
  }

  function handleDragOver(e){
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  function handleDragLeave(e){
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  function handleDrop(e){
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    // treat drop as gallery selection (multiple allowed)
    const files = e.dataTransfer && e.dataTransfer.files
    if (files && files.length) processSelectedFiles(Array.from(files))
  }

  function generateSlug(text){
    if (!text) return ''
    // remove accents, convert to lowercase, replace non-alnum with hyphens
    const s = text.normalize('NFD').replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    return s
  }

  function isValidImageInput(src){
    if (!src) return true
    if (typeof src !== 'string') return false
    const trimmed = src.trim()
    // Allow absolute URLs, data URLs, root-relative paths, and storage prefixes
    if (/^(https?:\/\/|data:|\/|storage:\/\/|supabase:\/\/)/i.test(trimmed)) return true
    // Allow simple filenames or paths (e.g., "images/foo.jpg" or "foo.png")
    if (/^[\w@%\-./]+\.[a-zA-Z0-9]{2,6}($|\?)/.test(trimmed)) return true
    return false
  }

  async function handleModalFileChange(e){
    const files = e.target.files
    if (!files || !files.length) return
    const file = files[0]
    const tempUrl = URL.createObjectURL(file)
    // show temporary preview and spinner
    setModalForm(prev => ({ ...prev, image_url: tempUrl }))
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
      // replace modal image url with uploaded one
      setModalForm(prev => ({ ...prev, image_url: url }))
      try { URL.revokeObjectURL(tempUrl) } catch (e) {}
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      // keep temp preview or clear
    } finally {
      setModalUploadingMain(false)
    }
  }

  async function handleModalGalleryChange(e){
    const list = e.target.files
    if (!list || list.length === 0) return
    setUploadError(null)
    setFileValidationError(null)
    setModalGalleryUploading(true)
    try {
      const files = Array.from(list)
      // create placeholders with local previews
      const placeholders = files.map(f => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`
        let url = null
        try { url = URL.createObjectURL(f) } catch (e) { url = '' }
        return { id, url, name: f.name, uploading: true, __file: f }
      })
      setModalGalleryPreviews(prev => [...prev, ...placeholders.map(p => ({ id: p.id, url: p.url, name: p.name, uploading: true }))])

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
          // replace placeholder with real url and mark uploaded
          setModalGalleryPreviews(prev => prev.map(p => p.id === ph.id ? ({ id: p.id, url, name: p.name, uploading: false }) : p))
          setModalForm(prev => ({ ...prev, images: Array.isArray(prev.images) ? [...prev.images, url] : [url] }))
        } catch (err) {
          setUploadError(err instanceof Error ? err.message : String(err))
          // mark placeholder as failed (leave as is or remove)
          setModalGalleryPreviews(prev => prev.filter(p => p.id !== ph.id))
        } finally {
          try { if (ph.url) URL.revokeObjectURL(ph.url) } catch (e) {}
        }
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : String(err))
    } finally {
      setModalGalleryUploading(false)
    }
  }

  function handleModalRemoveGallery(index){
    setModalForm(prev => {
      const nextImgs = Array.isArray(prev.images) ? prev.images.slice() : []
      nextImgs.splice(index,1)
      return { ...prev, images: nextImgs }
    })
    setModalGalleryPreviews(prev => {
      const next = prev.slice()
      const removed = next.splice(index,1)
      return next
    })
  }

  function reorderArray(arr, from, to){
    if (!Array.isArray(arr)) return arr
    if (from === to || from < 0 || to < 0 || from >= arr.length || to >= arr.length) return arr
    const next = arr.slice()
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    return next
  }

  const canReorderModalGallery = modalMode === 'create'
    && Array.isArray(modalGalleryPreviews)
    && modalGalleryPreviews.length > 1
    && modalGalleryPreviews.every(p => !p.uploading)
    && Array.isArray(modalForm.images)
    && modalForm.images.length === modalGalleryPreviews.length

  function handleGalleryDragStart(index){
    if (!canReorderModalGallery) return
    setModalGalleryDragIndex(index)
    setModalGalleryDragOverIndex(index)
  }

  function handleGalleryDragOver(e, index){
    if (!canReorderModalGallery) return
    e.preventDefault()
    if (modalGalleryDragOverIndex !== index) setModalGalleryDragOverIndex(index)
  }

  function handleGalleryDrop(e, dropIndex){
    if (!canReorderModalGallery) return
    e.preventDefault()
    const from = modalGalleryDragIndex
    if (from === null || from === undefined) return
    if (from === dropIndex) return

    setModalGalleryPreviews(prev => reorderArray(prev, from, dropIndex))
    setModalForm(prev => ({ ...prev, images: reorderArray(prev.images || [], from, dropIndex) }))
  }

  function handleGalleryDragEnd(){
    setModalGalleryDragIndex(null)
    setModalGalleryDragOverIndex(null)
  }

  async function handleCreate(e){
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(null)
    try {
      // Basic validation
      if (!form.name || !String(form.name).trim()) throw new Error('El nombre es requerido')
      if (form.price === undefined || form.price === null || String(form.price).trim() === '') throw new Error('El precio es requerido')

      // Require a main image (either main file selected or an existing image_url)
      if (!mainFile && (!form.image_url || !String(form.image_url).trim())) {
        throw new Error('La imagen principal es requerida')
      }

      // Validate image_url if present
      if (form.image_url && !isValidImageInput(form.image_url)) throw new Error('La URL de la imagen no tiene un formato válido')

      // Convert price to number
      const priceNumber = Number(String(form.price).replace(',', '.'))
      if (Number.isNaN(priceNumber)) throw new Error('El precio debe ser un número')
      if (fileValidationError) throw new Error(fileValidationError)

      // Generar slug y validar duplicados por nombre/slug
      const genSlug = generateSlug(form.name)
      const nameNormalized = String(form.name).trim().toLowerCase()
      const duplicate = items.some(it => {
        if (editingId && it.id === editingId) return false
        const itName = String(it.name || '').trim().toLowerCase()
        const itSlug = String(it.slug || '').trim()
        return itName === nameNormalized || (itSlug && itSlug === genSlug)
      })
      if (duplicate) throw new Error('Dos productos no deben llamarse igual')
      let finalImageUrl = form.image_url || undefined
      let imagesArr = Array.isArray(form.images) ? form.images.slice() : []
      // Upload main file first (if provided)
      if (mainFile) {
        setUploading(true)
        setUploadError(null)
        const fd = new FormData()
        fd.append('file', mainFile)
        const upRes = await fetch('/api/upload-image', { method: 'POST', credentials: 'include', body: fd })
        if (!upRes.ok) {
          const txt = await upRes.text().catch(() => '')
          const msg = `Error al subir la imagen principal: ${upRes.status} ${txt}`
          setUploadError(msg)
          throw new Error(msg)
        }
        const upData = await upRes.json()
        const url = upData?.url
        if (!url) throw new Error('No se obtuvo la URL pública de la imagen principal')
        finalImageUrl = url
      }
      // Upload gallery files (if any)
      if (galleryFiles.length > 0) {
        setUploading(true)
        setUploadError(null)
        const uploaded = []
        for (const f of galleryFiles) {
          const fd = new FormData()
          fd.append('file', f)
          const upRes = await fetch('/api/upload-image', { method: 'POST', credentials: 'include', body: fd })
          if (!upRes.ok) {
            const txt = await upRes.text().catch(() => '')
            const msg = `Error al subir una imagen de galería: ${upRes.status} ${txt}`
            setUploadError(msg)
            throw new Error(msg)
          }
          const upData = await upRes.json()
          const url = upData?.url
          if (!url) throw new Error('No se obtuvo la URL pública de una imagen de galería')
          // avoid duplicating main image in gallery
          if (url !== finalImageUrl) uploaded.push(url)
        }
        imagesArr = [...imagesArr, ...uploaded]
      }

      const payload = {
        name: form.name || undefined,
        slug: genSlug || undefined,
        price: priceNumber,
        image_url: finalImageUrl || undefined,
        images: imagesArr.length ? imagesArr : undefined,
        description: form.description || undefined,
        mics: form.mics || undefined,
        wood: form.wood || undefined,
        model: form.model || undefined,
      }
      let res
      if (editingId) {
        // Update existing product
        res = await fetch('/api/products', {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...payload })
        })
      } else {
        res = await fetch('/api/products', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      }
      if (!res.ok) {
        const txt = await res.text().catch(() => '')
        throw new Error(`${res.status} ${res.statusText} ${txt}`)
      }
      await load()
      setForm({ name: '', slug: '', price: '', image_url: '', description: '', mics: '', wood: '', model: '' })
      setEditingId(null)
      setMainFile(null)
      if (mainPreview) { try { URL.revokeObjectURL(mainPreview.url) } catch (e) {} }
      setMainPreview(null)
      setGalleryFiles([])
      galleryPreviews.forEach(p => { try { URL.revokeObjectURL(p.url) } catch (e) {} })
      setGalleryPreviews([])
      if (editingId) {
        addRecentActivity('update', form.name || 'Producto')
        toast('Producto actualizado', 'success')
      } else {
        addRecentActivity('create', form.name || 'Producto')
        toast('Producto creado', 'success')
      }
      hapticLight()
      setSuccess(editingId ? 'Producto actualizado' : 'Producto creado correctamente')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err){
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
      toast(msg, 'error')
      if (/subir la imagen/i.test(msg) || /upload/i.test(msg)) setUploadError(msg)
    } finally {
      setSubmitting(false)
      setUploading(false)
    }
  }

  async function handleDelete(id, name){
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
      addRecentActivity('delete', label)
      toast('Producto eliminado', 'success')
      hapticLight()
      setSuccess('Producto eliminado')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err){
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
      toast(msg, 'error')
    } finally {
      setDeletingId(null)
    }
  }

  function addRecentActivity(type, label){
    const stamp = Date.now()
    const time = new Date(stamp).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    const entry = {
      id: `${stamp}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      label,
      stamp,
      time
    }
    setRecentActivity(prev => [entry, ...prev].slice(0, 8))
  }

  const quickActions = React.useMemo(() => ([
    {
      id: 'create',
      label: 'Crear producto',
      hint: 'Abrir el modal de creación',
      run: () => openCreateModal()
    },
    {
      id: 'toggle-list',
      label: listOpen ? 'Ocultar productos' : 'Mostrar productos',
      hint: 'Alternar visibilidad de la lista',
      run: () => setListOpen(v => !v)
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
      }
    },
    {
      id: 'reload',
      label: 'Recargar productos',
      hint: 'Volver a consultar API',
      run: () => load()
    },
    {
      id: 'clear-search',
      label: 'Limpiar búsqueda',
      hint: 'Vaciar filtro actual',
      run: () => setAdminQ('')
    }
  ]), [listOpen])

  const quickFiltered = React.useMemo(() => {
    const q = String(quickQ || '').trim().toLowerCase()
    if (!q) return quickActions
    return quickActions.filter(a =>
      String(a.label || '').toLowerCase().includes(q)
      || String(a.hint || '').toLowerCase().includes(q)
    )
  }, [quickQ, quickActions])

  function runQuickAction(action){
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
    startEdit(p)
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
    <div className="space-y-6 md:space-y-8 xl:space-y-10">
      {/* Action sheet: long-press o clic derecho en fila → Editar / Eliminar */}
      {actionProduct ? (
        <div className="fixed inset-0 z-[96] flex items-end sm:items-center justify-center px-0 sm:px-4">
          <button
            type="button"
            aria-label="Cerrar menú"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm no-custom-btn"
            onClick={closeRowActionMenu}
          />
          <div className="relative w-full sm:max-w-xs rounded-t-2xl sm:rounded-2xl border-t sm:border border-white/12 bg-[#0e131d] shadow-2xl border-b-0 sm:border-b pb-4 sm:pb-4" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))' }}>
            <div className="px-4 pt-4 pb-2 border-b border-white/10">
              <p className="text-sm font-medium text-white truncate">{actionProduct.name || actionProduct.slug || actionProduct.id}</p>
              <p className="text-xs text-white/55 mt-0.5">Elegí una acción</p>
            </div>
            <div className="p-3 space-y-1.5">
              <button
                type="button"
                className="admin-btn-interact w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl admin-premium-btn-secondary no-custom-btn text-sm"
                onClick={() => { hapticLight(); startEdit(actionProduct); closeRowActionMenu() }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                Editar
              </button>
              <button
                type="button"
                className="admin-btn-interact w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl admin-premium-btn-danger no-custom-btn text-sm disabled:opacity-60"
                disabled={deletingId === actionProduct.id}
                onClick={() => { hapticLight(); handleDelete(actionProduct.id, actionProduct.name); closeRowActionMenu() }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4m1 4h.01M12 4h.01" /></svg>
                {deletingId === actionProduct.id ? 'Eliminando…' : 'Eliminar'}
              </button>
              <button
                type="button"
                className="admin-btn-interact w-full flex items-center justify-center py-3 px-4 rounded-xl admin-premium-btn-ghost no-custom-btn text-sm text-white/80"
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
            className="absolute inset-0 bg-black/50 backdrop-blur-sm no-custom-btn"
            onClick={() => setQuickOpen(false)}
          />
          <div className="relative w-full max-w-xl rounded-2xl border border-white/12 bg-[#0e131d]/95 shadow-[0_24px_56px_rgba(0,0,0,0.42)] admin-animate-slide-up">
            <div className="px-4 py-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-xs text-white/55 mb-2">
                <span>Acciones rápidas</span>
                <span className="ml-auto">⌘/Ctrl + K</span>
              </div>
              <input
                ref={quickInputRef}
                value={quickQ}
                onChange={(e) => setQuickQ(e.target.value)}
                placeholder="Buscar acción..."
                className="admin-premium-input"
              />
            </div>
            <div className="max-h-[44vh] overflow-y-auto p-2">
              {quickFiltered.length === 0 ? (
                <div className="px-3 py-3 text-sm text-white/55">No hay acciones para ese filtro.</div>
              ) : (
                quickFiltered.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => runQuickAction(a)}
                    className="w-full text-left px-3 py-2 rounded-xl border border-transparent hover:border-white/10 hover:bg-white/[0.04] transition-colors no-custom-btn"
                  >
                    <div className="text-sm text-white font-medium">{a.label}</div>
                    <div className="text-xs text-white/55 mt-0.5">{a.hint}</div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}
      {modalOpen ? (
        <div className="fixed inset-0 z-40 flex items-start justify-center px-2 sm:px-4 md:px-6 py-8">
          <div className={`fixed inset-0 bg-black/60 backdrop-blur-md ${modalClosing ? 'modal-backdrop-exit' : 'modal-backdrop-enter'}`} onClick={closeModal} />
          <div className={`relative admin-premium-card w-full max-w-[720px] sm:max-w-[780px] z-50 p-6 max-h-[85vh] overflow-y-auto ${modalClosing ? 'modal-panel-exit' : 'modal-panel-enter'}`}>
            <h3 className="section-title-minimal text-[1.08rem] mb-1 text-white">{modalMode === 'edit' ? 'Editar producto' : 'Crear producto'}</h3>
            {modalMode === 'create' ? (
              <div className="mb-3 text-xs text-white/60">
                {createDraftRecovered ? 'Borrador recuperado automaticamente.' : null}
                {!createDraftRecovered && createDraftSavedAt ? 'Borrador guardado automaticamente.' : null}
              </div>
            ) : null}
            {error ? <div className="mb-3 p-3 bg-rose-500/15 text-rose-200 rounded border border-rose-400/20 text-sm">{error}</div> : null}
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm block mb-1 text-white/75">Nombre</label>
                    <input name="name" value={modalForm.name} onChange={handleModalChange} className="admin-premium-input" />
                  </div>
                  <div>
                    <label className="text-sm block mb-1 text-white/75">Precio</label>
                    <input name="price" value={modalForm.price} onChange={handleModalChange} className="admin-premium-input" />
                  </div>
                  <div>
                    <label className="text-sm block mb-1 text-white/75">Modelo (model)</label>
                    <input name="model" value={modalForm.model} onChange={handleModalChange} className="admin-premium-input" placeholder="Ej: Stratocaster" />
                  </div>
                  <div>
                    <label className="text-sm block mb-1 text-white/75">Madera del cuerpo (wood)</label>
                    <input name="wood" value={modalForm.wood} onChange={handleModalChange} className="admin-premium-input" placeholder="Ej: Alder" />
                  </div>
                  <div>
                    <label className="text-sm block mb-1 text-white/75">Micrófonos (mics)</label>
                    <input name="mics" value={modalForm.mics} onChange={handleModalChange} className="admin-premium-input" placeholder="Ej: SSS" />
                  </div>
                  <div>
                    <label className="text-sm block mb-1 text-white/75">Escala</label>
                    <input name="scale_length" value={modalForm.scale_length} onChange={handleModalChange} className="admin-premium-input" placeholder='Ej: 25.5"' />
                  </div>
                  <div>
                    <label className="text-sm block mb-1 text-white/75">Perfil de mástil</label>
                    <input name="neck_profile" value={modalForm.neck_profile} onChange={handleModalChange} className="admin-premium-input" placeholder="Ej: C slim, D moderno" />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <input type="checkbox" id="modal-low-cost" name="low_cost" checked={Boolean(modalForm.low_cost)} onChange={handleModalChange} className="rounded border-white/30 bg-white/10 text-amber-500 focus:ring-amber-500" />
                    <label htmlFor="modal-low-cost" className="text-sm text-white/85">Incluir en sección Low cost</label>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm block mb-1 text-white/75">1. Imagen principal</label>
                    <p className="text-[11px] text-white/55 mb-1.5">Vista frontal del instrumento (se muestra primero en la card)</p>
                    {modalForm.image_url ? (
                      <div className="w-full rounded-xl overflow-hidden border border-white/15 mb-2 relative h-40">
                        <ImageWithSkeleton src={modalForm.image_url} alt="Imagen principal" fill quality={100} className="w-full h-full" disableClientPreview />
                        {modalUploadingMain ? (
                          <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                            <svg className="animate-spin h-6 w-6 text-white/90" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                    <input ref={modalFileInputRef} type="file" accept="image/*" onChange={handleModalFileChange} className="hidden" />
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button type="button" className="px-3 py-2 admin-premium-btn-primary no-custom-btn" onClick={() => modalFileInputRef.current && modalFileInputRef.current.click()}>Subir nueva imagen</button>
                      <button type="button" className="px-3 py-2 admin-premium-btn-ghost no-custom-btn" onClick={() => setModalForm(prev => ({ ...prev, image_url: '' }))}>Quitar imagen</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="text-sm block mb-1 text-white/75">Radio del diapasón</label>
                      <input name="fingerboard_radius" value={modalForm.fingerboard_radius} onChange={handleModalChange} className="admin-premium-input" placeholder='Ej: 9.5"' />
                    </div>
                    <div>
                      <label className="text-sm block mb-1 text-white/75">Madera del diapasón</label>
                      <input name="fingerboard_material" value={modalForm.fingerboard_material} onChange={handleModalChange} className="admin-premium-input" placeholder="Ej: Rosewood, Maple" />
                    </div>
                    <div>
                      <label className="text-sm block mb-1 text-white/75">Construcción del mástil</label>
                      <input name="neck_construction" value={modalForm.neck_construction} onChange={handleModalChange} className="admin-premium-input" placeholder="Ej: Bolt-on, Set-neck" />
                    </div>
                    <div>
                      <label className="text-sm block mb-1 text-white/75">Ancho de cejuela</label>
                      <input name="nut_width" value={modalForm.nut_width} onChange={handleModalChange} className="admin-premium-input" placeholder="Ej: 42 mm" />
                    </div>
                    <div>
                      <label className="text-sm block mb-1 text-white/75">Trastes</label>
                      <input name="frets" value={modalForm.frets} onChange={handleModalChange} className="admin-premium-input" placeholder="Ej: 22 medium jumbo" />
                    </div>
                    <div>
                      <label className="text-sm block mb-1 text-white/75">Puente</label>
                      <input name="bridge" value={modalForm.bridge} onChange={handleModalChange} className="admin-premium-input" placeholder="Ej: Floyd Rose, hardtail" />
                    </div>
                    <div>
                      <label className="text-sm block mb-1 text-white/75">Clavijas</label>
                      <input name="tuners" value={modalForm.tuners} onChange={handleModalChange} className="admin-premium-input" placeholder="Ej: Gotoh locking" />
                    </div>
                    <div>
                      <label className="text-sm block mb-1 text-white/75">Terminación del hardware</label>
                      <input name="hardware_finish" value={modalForm.hardware_finish} onChange={handleModalChange} className="admin-premium-input" placeholder="Ej: Chrome, Gold" />
                    </div>
                    <div>
                      <label className="text-sm block mb-1 text-white/75">Controles</label>
                      <input name="controls" value={modalForm.controls} onChange={handleModalChange} className="admin-premium-input" placeholder="Ej: 1 volumen, 1 tono, selector 5 posiciones" />
                    </div>
                    <div>
                      <label className="text-sm block mb-1 text-white/75">Conmutación (switching)</label>
                      <input name="switching" value={modalForm.switching} onChange={handleModalChange} className="admin-premium-input" placeholder="Ej: Push-pull para coil split" />
                    </div>
                    <div>
                      <label className="text-sm block mb-1 text-white/75">Origen</label>
                      <input name="origin" value={modalForm.origin} onChange={handleModalChange} className="admin-premium-input" placeholder="Ej: Japón, México" />
                    </div>
                    <div>
                      <label className="text-sm block mb-1 text-white/75">Año</label>
                      <input name="year" value={modalForm.year} onChange={handleModalChange} className="admin-premium-input" placeholder="Ej: 2014" />
                    </div>
                    <div>
                      <label className="text-sm block mb-1 text-white/75">Peso (kg aprox.)</label>
                      <input name="weight" value={modalForm.weight} onChange={handleModalChange} className="admin-premium-input" placeholder="Ej: 3.6" />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm block mb-1 text-white/75">Descripción</label>
                <textarea name="description" value={modalForm.description} onChange={handleModalChange} className="admin-premium-input" rows="4" />
              </div>

              {modalMode === 'create' ? (
                <div>
                  <label className="text-sm block mb-1 text-white/75">2. y 3. Imágenes adicionales (opcional)</label>
                  <p className="text-[11px] text-white/55 mb-2">2.ª = vista trasera · 3.ª = trastera o pala. En la card se muestran hasta 3 fotos en este orden.</p>
                  <input ref={modalGalleryInputRef} type="file" accept="image/*" multiple onChange={handleModalGalleryChange} className="hidden" />
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button type="button" className="px-3 py-2 admin-premium-btn-primary no-custom-btn" onClick={() => modalGalleryInputRef.current && modalGalleryInputRef.current.click()}>Subir imágenes</button>
                    <button type="button" className="px-3 py-2 admin-premium-btn-ghost no-custom-btn" onClick={() => { setModalForm(prev => ({ ...prev, images: [] })); setModalGalleryPreviews([]); setModalGalleryDragIndex(null); setModalGalleryDragOverIndex(null) }}>Limpiar galería</button>
                  </div>
                  {canReorderModalGallery ? (
                    <p className="mt-2 text-[11px] text-white/55">Arrastrá las miniaturas para ordenar: primera = vista trasera, segunda = trastera o pala.</p>
                  ) : null}
                  {modalGalleryPreviews.length > 0 ? (
                    <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {modalGalleryPreviews.map((p, i) => (
                        <div key={p.id} className="w-full">
                          <div
                            className={`w-full h-16 rounded overflow-hidden border relative group ${modalGalleryDragOverIndex === i && modalGalleryDragIndex !== i ? 'border-[var(--vintage-gold)]/80 ring-1 ring-[var(--vintage-gold)]/35' : 'border-white/15'} ${canReorderModalGallery ? 'cursor-grab active:cursor-grabbing' : ''}`}
                            draggable={canReorderModalGallery}
                            onDragStart={() => handleGalleryDragStart(i)}
                            onDragOver={(e) => handleGalleryDragOver(e, i)}
                            onDrop={(e) => handleGalleryDrop(e, i)}
                            onDragEnd={handleGalleryDragEnd}
                          >
                            <ImageWithSkeleton src={p.url} alt={p.name || ('Imagen ' + (i+1))} fill quality={100} className="w-full h-full" disableClientPreview />
                            {p.uploading ? (
                              <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                                <svg className="animate-spin h-5 w-5 text-white/90" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>
                              </div>
                            ) : null}
                            {canReorderModalGallery ? (
                              <div className="absolute left-1 top-1 z-10 rounded bg-black/45 px-1.5 py-0.5 text-[10px] text-white/80 border border-white/10">
                                {i === 0 ? '2. Atrás' : i === 1 ? '3. Trastera/pala' : i + 1}
                              </div>
                            ) : null}
                            {!p.uploading ? (
                              <button type="button" onClick={() => handleModalRemoveGallery(i)} aria-label="Eliminar imagen" className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="bg-rose-600 hover:bg-rose-700 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-sm">×</span>
                              </button>
                            ) : null}
                          </div>
                          <div className="text-xs mt-1 truncate text-white/75">
                            {i === 0 ? 'Vista trasera' : i === 1 ? 'Trastera o pala' : p.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <button type="submit" className="px-4 py-2 admin-premium-btn-primary no-custom-btn w-full sm:w-auto" disabled={submitting}>{submitting ? (modalMode === 'edit' ? 'Guardando…' : 'Creando…') : (modalMode === 'edit' ? 'Guardar cambios' : 'Crear producto')}</button>
                <button type="button" className="px-4 py-2 admin-premium-btn-ghost no-custom-btn w-full sm:w-auto" onClick={closeModal}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
      <section className="p-5 md:p-6 lg:p-8 xl:p-10 admin-premium-card admin-animate-in admin-stagger-0 opacity-0">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-white md:text-[1.05rem]">Crear producto</h2>
            <p className="mt-1 text-sm admin-premium-muted">Usa el botón de &quot;Crear producto&quot; para que se abra el panel de creación.</p>
          </div>
          <div className="flex w-full md:w-auto items-center gap-2">
            <button type="button" className="admin-btn-interact px-4 py-3 admin-premium-btn-primary no-custom-btn inline-flex items-center justify-center gap-2 w-full md:w-auto rounded-xl text-sm font-semibold" onClick={openCreateModal}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m-7-7h14" /></svg>
              Crear producto
            </button>
          </div>
        </div>
        {error ? <div className="mt-3 p-3 bg-rose-500/15 text-rose-200 rounded border border-rose-400/20 text-sm">{error}</div> : null}
        {success ? <div className="mt-3 p-3 bg-emerald-500/15 text-emerald-200 rounded border border-emerald-400/20 text-sm">{success}</div> : null}
        
      </section>

      <section className="p-5 md:p-6 lg:p-8 xl:p-10 admin-premium-card admin-animate-in admin-stagger-1 opacity-0">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-base font-semibold tracking-tight text-white md:text-[1.05rem]">Actividad reciente</h2>
          <span className="text-[11px] uppercase tracking-wider text-white/50">Últimos cambios</span>
        </div>
        {recentActivity.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center rounded-xl border border-white/08 px-4 py-8 bg-white/[0.03]">
            <span className="text-3xl opacity-50 mb-2" aria-hidden>📋</span>
            <p className="text-sm text-white/60">Aún no hay cambios en esta sesión.</p>
            <p className="text-xs text-white/45 mt-1">Creá o editá un producto para ver la actividad.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentActivity.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/08 bg-white/[0.03] px-4 py-2.5">
                <p className="text-sm text-white/92 truncate">
                  {a.type === 'create' ? 'Creaste' : a.type === 'update' ? 'Actualizaste' : 'Eliminaste'} <span className="text-white font-medium">{a.label}</span>
                </p>
                <span className="text-[11px] text-white/55 whitespace-nowrap">{a.time}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="p-5 md:p-6 lg:p-8 xl:p-10 admin-premium-card admin-animate-in admin-stagger-2 opacity-0">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-white md:text-[1.05rem]">Productos</h2>
            <p className="text-[11px] text-white/45 mt-0.5">Mantener presionado o clic derecho en una fila para Editar / Eliminar</p>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button type="button" onClick={() => setListOpen(v => !v)} className="admin-btn-interact inline-flex items-center justify-center gap-2 text-sm admin-premium-btn-secondary px-3 py-2.5 w-full md:w-auto no-custom-btn rounded-xl">
              {listOpen ? 'Ocultar' : 'Mostrar'}
              <svg className={`h-4 w-4 transition-transform ${listOpen ? 'rotate-180' : 'rotate-0'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-xs font-medium text-white/55 mb-2">Buscar producto</label>
          <div className="relative" role="search">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/45" aria-hidden>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="17" height="17"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z"/></svg>
            </span>
            <input
              id="admin-search-input"
              aria-label="Buscar producto por nombre"
              value={adminQ}
              onChange={(e) => setAdminQ(e.target.value)}
              placeholder="Escribe el nombre para filtrar..."
              className="admin-premium-input pr-3 py-2.5 text-sm"
              style={{ paddingLeft: '2.4rem' }}
            />
          </div>
        </div>
        {loading ? (
          <div className="mt-4 space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-3.5 rounded-xl bg-white/[0.03] border border-white/08">
                <div className="w-12 h-12 rounded-lg bg-white/10 animate-pulse" />
                <div className="flex-1 min-w-0">
                  <div className="h-4 bg-white/10 rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-white/10 rounded w-1/3 mt-2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : null}
        {!loading && items.length === 0 ? (
          <div className="mt-4 flex flex-col items-center justify-center text-center rounded-xl border border-white/08 px-4 py-10 bg-white/[0.03]">
            <span className="text-4xl opacity-50 mb-3" aria-hidden>🎸</span>
            <p className="text-sm font-medium text-white/80">No hay productos</p>
            <p className="text-xs text-white/55 mt-1">Usá &quot;Crear producto&quot; para cargar el primer ítem del catálogo.</p>
          </div>
        ) : null}
        <div className={`mt-4 rounded-xl border border-white/08 bg-white/[0.03] overflow-hidden divide-y divide-white/08 transition-all duration-300 ease-out ${listOpen ? 'max-h-[2000px] py-0' : 'max-h-0'}`}>
          {filteredItems.map((p) => {
            const imgSrc = imageService.resolve(p.image_url || (p.images && p.images[0]))
            return (
            <div
              key={p.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-3 sm:px-4 py-3.5 admin-item hover:bg-white/[0.03] transition-colors duration-200 touch-manipulation"
              onContextMenu={(e) => { e.preventDefault(); openRowActionMenu(p) }}
              onTouchStart={() => handleRowTouchStart(p)}
              onTouchEnd={handleRowTouchEnd}
              onTouchMove={handleRowTouchEnd}
              onTouchCancel={handleRowTouchEnd}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden border border-white/10 bg-white/[0.04] flex items-center justify-center">
                  {imgSrc ? (
                    <ImageWithSkeleton src={imgSrc} alt={p.name || p.slug || 'Imagen'} width={56} height={56} quality={100} disableClientPreview />
                  ) : (
                    <div className="image-placeholder w-full h-full" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-white leading-tight break-words">{p.name || p.slug || p.id}</div>
                  <div className="text-sm text-white/65">{p.price || '-'}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
                <button type="button" onClick={(e) => handleRowEdit(e, p)} className="admin-btn-interact inline-flex items-center justify-center gap-1.5 text-[13px] sm:text-sm px-2.5 sm:px-3 py-2 sm:py-1.5 admin-premium-btn-secondary no-custom-btn whitespace-nowrap">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20h9" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z" /></svg>
                  Editar
                </button>
                <button type="button" className="admin-btn-interact text-[13px] sm:text-sm inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-2 sm:py-1.5 admin-premium-btn-danger disabled:opacity-60 disabled:cursor-not-allowed no-custom-btn whitespace-nowrap" onClick={(e) => handleRowDelete(e, p.id, p.name)} disabled={deletingId === p.id}>
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
