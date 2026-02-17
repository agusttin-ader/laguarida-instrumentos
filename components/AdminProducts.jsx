"use client"

import React, { useEffect, useState } from 'react'
import normalizeProduct from '../lib/utils/normalizeProduct'
import imageService from '../lib/utils/imageService'
import ImageWithSkeleton from './ImageWithSkeleton'

export default function AdminProducts(){
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({ name: '', slug: '', price: '', image_url: '', description: '' })
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

  useEffect(() => {
    return () => {
      if (mainPreview) {
        try { URL.revokeObjectURL(mainPreview.url) } catch (e) {}
      }
      galleryPreviews.forEach(p => {
        try { URL.revokeObjectURL(p.url) } catch (e) {}
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
      } catch (err) {
        // skip preview on failure
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
        try { URL.revokeObjectURL(mainPreview.url) } catch (e) {}
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
        try { URL.revokeObjectURL(removed[0].url) } catch (e) {}
      }
      return next
    })
  }

  function removeMainSelected(){
    if (mainPreview) {
      try { URL.revokeObjectURL(mainPreview.url) } catch (e) {}
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
        slug: form.slug || undefined,
        price: priceNumber,
        image_url: finalImageUrl || undefined,
        images: imagesArr.length ? imagesArr : undefined,
        description: form.description || undefined,
      }
      const res = await fetch('/api/products', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        const txt = await res.text().catch(() => '')
        throw new Error(`${res.status} ${res.statusText} ${txt}`)
      }
      await load()
      setForm({ name: '', slug: '', price: '', image_url: '', description: '' })
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
      <section className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">Crear producto</h2>
        {error ? <div className="mt-3 p-3 bg-rose-50 text-rose-700 rounded border border-rose-100 text-sm">{error}</div> : null}
        {success ? <div className="mt-3 p-3 bg-emerald-50 text-emerald-800 rounded border border-emerald-100 text-sm">{success}</div> : null}
        <form onSubmit={handleCreate} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm block mb-1 text-gray-700">Nombre</label>
            <input name="name" value={form.name} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-gray-800" />
          </div>
          <div>
            <label className="text-sm block mb-1 text-gray-700">Slug</label>
            <input name="slug" value={form.slug} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-gray-800" />
          </div>
          <div>
            <label className="text-sm block mb-1 text-gray-700">Precio</label>
            <input name="price" value={form.price} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-gray-800" />
          </div>
          <div className="space-y-2">
            <label className="text-sm block mb-1 text-gray-700">Imagen principal (requerida)</label>
            <div className="flex items-start gap-4">
              <div className="w-36 h-28 rounded-lg overflow-hidden border bg-neutral-50 flex items-center justify-center">
                {mainPreview ? (
                  <div className="w-full h-full relative">
                    <img src={mainPreview.url} alt={mainPreview.name || 'Imagen principal'} className="w-full h-full object-cover" />
                    <button type="button" onClick={removeMainSelected} className="absolute top-2 right-2 bg-white/90 rounded px-2 text-xs">Eliminar</button>
                  </div>
                ) : form.image_url ? (
                  <div className="w-full h-full">
                    <img src={form.image_url} alt="Imagen principal" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="text-xs text-muted px-2">No hay imagen principal seleccionada</div>
                )}
              </div>
              <div className="flex-1">
                <input name="mainFile" type="file" accept="image/*" onChange={handleMainFileChange} className="w-full" />
                <div className="text-xs mt-2 text-gray-600">Selecciona una imagen principal o pega una URL en el campo <strong>image_url</strong>.</div>
                <div className="mt-2">
                  <label className="text-sm block mb-1 text-gray-700">O escribe la URL de la imagen principal</label>
                  <input name="image_url" value={form.image_url} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-gray-800" placeholder="https://..." />
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm block mb-1 text-gray-700">Galería (opcional)</label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`p-3 border rounded-lg ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-200'}`}
              >
                <input name="gallery" type="file" accept="image/*" multiple onChange={handleFileChange} className="w-full" />
                <div className="text-xs mt-2 text-gray-600">Arrastra imágenes de galería aquí o hacé clic para seleccionar (varias).</div>
              </div>
              {fileValidationError ? <div className="mt-2 p-2 bg-rose-50 text-rose-700 rounded text-sm">{fileValidationError}</div> : null}
              {uploadError && !fileValidationError ? <div className="mt-2 p-2 bg-rose-50 text-rose-700 rounded text-sm">{uploadError}</div> : null}
              {uploading ? (
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                  <svg className="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>
                  <div>Subiendo imágenes…</div>
                </div>
              ) : null}
              {galleryPreviews.length > 0 ? (
                <div className="mt-2 flex gap-2 flex-wrap">
                  {galleryPreviews.map((p, i) => (
                    <div key={p.id} className={`w-32 ${i === 0 ? 'ring-2 ring-amber-200' : ''}`}>
                      <div className="w-32 h-24 rounded overflow-hidden border relative">
                        <img src={p.url} alt={p.name || ('Imagen ' + (i+1))} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeGallerySelected(i)} className="absolute top-1 right-1 bg-white/80 rounded px-1 text-xs">Eliminar</button>
                      </div>
                      <div className="text-xs mt-1 truncate">{p.name}</div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm block mb-1 text-gray-700">Descripción</label>
            <textarea name="description" value={form.description} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-gray-800" rows="3" />
          </div>

          <div className="sm:col-span-2 flex gap-2">
            <button type="submit" className="px-4 py-2 bg-black text-white rounded-lg shadow-sm" disabled={submitting || uploading || !!fileValidationError || !form.name || String(form.price).trim() === '' || (!mainFile && (!form.image_url || String(form.image_url).trim() === ''))}>{submitting ? 'Creando…' : (uploading ? 'Subiendo…' : 'Crear producto')}</button>
            <button type="button" className="px-4 py-2 bg-white border border-gray-200 rounded-lg" onClick={() => setForm({ name: '', slug: '', price: '', image_url: '', description: '' })}>Limpiar</button>
          </div>
        </form>
      </section>

      <section className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">Productos</h2>
        {loading ? <div className="py-4">Cargando…</div> : null}
        {!loading && items.length === 0 ? (
          <div className="py-4 text-sm text-gray-600">No hay productos.</div>
        ) : null}
        <div className="mt-4 bg-white rounded-lg shadow-sm overflow-hidden divide-y divide-gray-100">
          {items.map((p, idx) => {
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
                <a href={`/guitars/${p.slug || p.id}`} className="text-sm text-gray-700 hover:underline">Ver</a>
                <button className="text-sm text-rose-600" onClick={() => handleDelete(p.id, p.name)} disabled={deletingId === p.id}>{deletingId === p.id ? 'Eliminando…' : 'Eliminar'}</button>
              </div>
            </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
