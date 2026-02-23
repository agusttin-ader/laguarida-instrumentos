"use client"
/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-vars, no-empty */

import React, { useEffect, useState } from 'react'
import normalizeProduct from '../lib/utils/normalizeProduct'
import imageService from '../lib/utils/imageService'
import ImageWithSkeleton from './ImageWithSkeleton'

export default function AdminProducts(){
  const modalFileInputRef = React.useRef(null)
  const mainFileInputRef = React.useRef(null)
  const modalGalleryInputRef = React.useRef(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [listOpen, setListOpen] = useState(false)
  const [form, setForm] = useState({ name: '', slug: '', price: '', image_url: '', description: '', mics: 'SSS', wood: 'Alder', model: 'Stratocaster' })
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
  const [modalForm, setModalForm] = useState({ name: '', slug: '', price: '', image_url: '', description: '', mics: 'SSS', wood: 'Alder', model: 'Stratocaster', images: [] })
  const [modalMode, setModalMode] = useState('edit') // 'edit' | 'create'
  const [modalGalleryPreviews, setModalGalleryPreviews] = useState([]) // {id,url,name}
  const [modalUploadingMain, setModalUploadingMain] = useState(false)
  const [modalGalleryUploading, setModalGalleryUploading] = useState(false)
  const [modalClosing, setModalClosing] = useState(false)

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
      mics: p.mics || 'SSS',
      wood: p.wood || 'Alder',
      model: p.model || 'Stratocaster',
      images: Array.isArray(p.images) ? p.images.slice() : []
    })
    // do not populate or show gallery in edit mode (gallery only available when creating)
    setModalOpen(true)
  }

  function handleModalChange(e){
    const { name, value } = e.target
    setModalForm(prev => ({ ...prev, [name]: value }))
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
      // close modal and clear previews
      closeModal()
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
      setModalClosing(false)
    }, 240) // matches CSS exit duration
  }

  function openCreateModal(){
    setModalMode('create')
    setModalForm({ name: '', slug: '', price: '', image_url: '', description: '', mics: 'SSS', wood: 'Alder', model: 'Stratocaster', images: [] })
    setEditingId(null)
    setModalGalleryPreviews([])
    setModalOpen(true)
  }

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
      setForm({ name: '', slug: '', price: '', image_url: '', description: '', mics: 'SSS', wood: 'Alder', model: 'Stratocaster' })
      setEditingId(null)
      // clear selected files and previews
      setMainFile(null)
      if (mainPreview) { try { URL.revokeObjectURL(mainPreview.url) } catch (e) {} }
      setMainPreview(null)
      setGalleryFiles([])
      galleryPreviews.forEach(p => { try { URL.revokeObjectURL(p.url) } catch (e) {} })
      setGalleryPreviews([])
      setSuccess('Producto creado correctamente')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err){
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
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
      setSuccess('Producto eliminado')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err){
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {modalOpen ? (
        <div className="fixed inset-0 z-40 flex items-start justify-center px-4 py-8">
          <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm ${modalClosing ? 'modal-backdrop-exit' : 'modal-backdrop-enter'}`} onClick={closeModal} />
          <div className={`relative bg-white rounded-lg shadow-lg w-full max-w-3xl z-50 p-6 max-h-[85vh] overflow-y-auto ${modalClosing ? 'modal-panel-exit' : 'modal-panel-enter'}`}>
            <h3 className="text-lg font-semibold mb-4">{modalMode === 'edit' ? 'Editar producto' : 'Crear producto'}</h3>
            {error ? <div className="mb-3 p-3 bg-rose-50 text-rose-700 rounded border border-rose-100 text-sm">{error}</div> : null}
            <form onSubmit={handleSaveEdit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm block mb-1 text-gray-700">Nombre</label>
                  <input name="name" value={modalForm.name} onChange={handleModalChange} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-gray-800" />
                </div>
                <div>
                  <label className="text-sm block mb-1 text-gray-700">Precio</label>
                  <input name="price" value={modalForm.price} onChange={handleModalChange} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-gray-800" />
                </div>
                <div>
                  <label className="text-sm block mb-1 text-gray-700">Modelo (model)</label>
                  <input name="model" value={modalForm.model} onChange={handleModalChange} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-gray-800" />
                </div>
                <div>
                  <label className="text-sm block mb-1 text-gray-700">Madera del cuerpo (wood)</label>
                  <input name="wood" value={modalForm.wood} onChange={handleModalChange} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-gray-800" />
                </div>
                <div>
                  <label className="text-sm block mb-1 text-gray-700">Micrófonos (mics)</label>
                  <input name="mics" value={modalForm.mics} onChange={handleModalChange} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-gray-800" />
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm block mb-1 text-gray-700">Imagen principal</label>
                  {modalForm.image_url ? (
                    <div className="w-full rounded overflow-hidden border mb-2 relative">
                      <img src={modalForm.image_url} alt="Imagen principal" className="w-full h-40 object-cover" />
                      {modalUploadingMain ? (
                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                          <svg className="animate-spin h-6 w-6 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                  <input ref={modalFileInputRef} type="file" accept="image/*" onChange={handleModalFileChange} className="hidden" />
                  <div className="flex gap-2">
                    <button type="button" className="px-3 py-2 bg-amber-600 text-white rounded-md no-custom-btn" onClick={() => modalFileInputRef.current && modalFileInputRef.current.click()}>Subir nueva imagen</button>
                    <button type="button" className="px-3 py-2 bg-white border border-gray-200 rounded-md no-custom-btn" onClick={() => setModalForm(prev => ({ ...prev, image_url: '' }))}>Quitar imagen</button>
                  </div>
                </div>
                    <div className="sm:col-span-2">
                      <label className="text-sm block mb-1 text-gray-700">Descripción</label>
                      <textarea name="description" value={modalForm.description} onChange={handleModalChange} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-gray-800" rows="4" />
                    </div>
                    {modalMode === 'create' ? (
                    <div className="sm:col-span-2">
                      <label className="text-sm block mb-1 text-gray-700">Galería (opcional)</label>
                      <input ref={modalGalleryInputRef} type="file" accept="image/*" multiple onChange={handleModalGalleryChange} className="hidden" />
                      <div className="flex gap-2">
                        <button type="button" className="px-3 py-2 bg-amber-600 text-white rounded-md no-custom-btn" onClick={() => modalGalleryInputRef.current && modalGalleryInputRef.current.click()}>Subir imágenes</button>
                        <button type="button" className="px-3 py-2 bg-white border border-gray-200 rounded-md no-custom-btn" onClick={() => { setModalForm(prev => ({ ...prev, images: [] })); setModalGalleryPreviews([]) }}>Limpiar galería</button>
                      </div>
                      {modalGalleryPreviews.length > 0 ? (
                        <div className="mt-3 grid grid-cols-4 gap-2">
                          {modalGalleryPreviews.map((p, i) => (
                            <div key={p.id} className="w-full">
                              <div className="w-full h-16 rounded overflow-hidden border relative group">
                                <img src={p.url} alt={p.name || ('Imagen ' + (i+1))} className="w-full h-full object-cover" />
                                {p.uploading ? (
                                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                    <svg className="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>
                                  </div>
                                ) : null}
                                {/* centered red X on hover */}
                                {!p.uploading ? (
                                  <button type="button" onClick={() => handleModalRemoveGallery(i)} aria-label="Eliminar imagen" className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="bg-rose-600 hover:bg-rose-700 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-sm">×</span>
                                  </button>
                                ) : null}
                              </div>
                              <div className="text-xs mt-1 truncate">{p.name}</div>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    ) : null}
                <div className="sm:col-span-2 flex gap-2 mt-2">
                  <button type="submit" className="px-4 py-2 bg-black text-white rounded-lg no-custom-btn" disabled={submitting}>{submitting ? (modalMode === 'edit' ? 'Guardando…' : 'Creando…') : (modalMode === 'edit' ? 'Guardar cambios' : 'Crear producto')}</button>
                  <button type="button" className="px-4 py-2 bg-white border border-gray-200 rounded-lg no-custom-btn" onClick={closeModal}>Cancelar</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : null}
      <section className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Crear producto</h2>
          <div className="flex items-center gap-2">
            <button type="button" className="px-4 py-2 bg-amber-600 text-white rounded-lg no-custom-btn" onClick={openCreateModal}>Crear producto</button>
            <button type="button" className="px-3 py-2 bg-white border border-gray-200 rounded-md no-custom-btn" onClick={() => { setForm({ name: '', slug: '', price: '', image_url: '', description: '', mics: 'SSS', wood: 'Alder', model: 'Stratocaster' }); setMainFile(null); setMainPreview(null); setGalleryFiles([]); setGalleryPreviews([]); }}>Limpiar</button>
          </div>
        </div>
        {error ? <div className="mt-3 p-3 bg-rose-50 text-rose-700 rounded border border-rose-100 text-sm">{error}</div> : null}
        {success ? <div className="mt-3 p-3 bg-emerald-50 text-emerald-800 rounded border border-emerald-100 text-sm">{success}</div> : null}
        <div className="mt-4 text-sm text-gray-600">Usa el botón &apos;Crear producto&apos; para abrir el editor en un modal.</div>
      </section>

      <section className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Productos</h2>
          <button type="button" onClick={() => setListOpen(v => !v)} className="inline-flex items-center gap-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-md px-3 py-1 hover:bg-gray-50 no-custom-btn">
            {listOpen ? 'Ocultar' : 'Mostrar'}
            <svg className={`h-4 w-4 transition-transform ${listOpen ? 'rotate-180' : 'rotate-0'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        {loading ? <div className="py-4">Cargando…</div> : null}
        {!loading && items.length === 0 ? (
          <div className="py-4 text-sm text-gray-600">No hay productos.</div>
        ) : null}
        <div className={`mt-4 bg-white rounded-lg shadow-sm overflow-hidden divide-y divide-gray-100 transition-all duration-200 ${listOpen ? 'max-h-[2000px] py-0' : 'max-h-0'}`}>
          {items.map((p) => {
            const imgSrc = imageService.resolve(p.image_url || (p.images && p.images[0]))
            return (
            <div key={p.id} className="flex items-center justify-between gap-4 px-4 py-4 hover:bg-gray-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-md overflow-hidden border border-gray-100 bg-neutral-50 flex items-center justify-center">
                  {imgSrc ? (
                    <ImageWithSkeleton src={imgSrc} alt={p.name || p.slug || 'Imagen'} width={56} height={56} quality={95} />
                  ) : (
                    <div className="image-placeholder w-full h-full" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{p.name || p.slug || p.id}</div>
                  <div className="text-sm text-gray-600">{p.price || '-'}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button type="button" onClick={() => startEdit(p)} className="inline-flex items-center gap-2 text-sm px-3 py-1 bg-gray-100 border border-gray-200 rounded-md text-gray-800 hover:bg-gray-200 no-custom-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12"/></svg>
                  Editar
                </button>
                <button className="text-sm inline-flex items-center gap-2 bg-rose-700 hover:bg-rose-600 text-white px-3 py-1 rounded-full disabled:opacity-60 disabled:cursor-not-allowed no-custom-btn" onClick={() => handleDelete(p.id, p.name)} disabled={deletingId === p.id}>{deletingId === p.id ? 'Eliminando…' : 'Eliminar'}</button>
              </div>
            </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
