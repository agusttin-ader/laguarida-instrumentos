"use client"

import React, { useCallback, useEffect, useState } from 'react'
import { useToast } from './ToastContext'

const FAVORITES_KEY = 'laguarida-favorites'

function getStoredSlugs() {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(FAVORITES_KEY)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr.filter((s) => typeof s === 'string') : []
  } catch {
    return []
  }
}

function setStoredSlugs(slugs) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(slugs))
  } catch { /* ignore */ }
}

export function useFavorites() {
  const [slugs, setSlugs] = useState([])

  useEffect(() => {
    setSlugs(getStoredSlugs())
    const onStorage = () => setSlugs(getStoredSlugs())
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const toggle = useCallback((slug) => {
    if (!slug) return
    const next = getStoredSlugs()
    const idx = next.indexOf(slug)
    if (idx >= 0) next.splice(idx, 1)
    else next.push(slug)
    setStoredSlugs(next)
    setSlugs([...next])
  }, [])

  const isFavorite = useCallback((slug) => slugs.includes(slug), [slugs])

  return { slugs, toggle, isFavorite }
}

export default function ProductShareAndFavorite({ slug, name, url }) {
  const { toast } = useToast()
  const { isFavorite, toggle } = useFavorites()
  const fav = isFavorite(slug)

  const handleShare = useCallback(async () => {
    if (!url) return
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768
    const canUseNativeShare = typeof navigator !== 'undefined' && navigator.share

    if (isMobile && canUseNativeShare) {
      try {
        await navigator.share({
          title: name ? `${name} — La Guarida` : 'La Guarida',
          url,
          text: name ? `Mirá ${name} en La Guarida` : undefined
        })
        toast('Compartido', 'success')
      } catch (err) {
        if (err?.name !== 'AbortError') {
          try {
            await navigator.clipboard.writeText(url)
            toast('¡Link copiado!', 'success')
          } catch {
            toast('No se pudo compartir', 'error')
          }
        }
      }
      return
    }

    try {
      await navigator.clipboard.writeText(url)
      toast('¡Link copiado!', 'success')
    } catch {
      toast('No se pudo copiar', 'error')
    }
  }, [url, name, toast])

  const handleFavorite = useCallback(() => {
    toggle(slug)
    toast(fav ? 'Quitar de tu selección' : 'Agregado a tu selección', 'default')
  }, [slug, fav, toggle, toast])

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleShare}
        aria-label="Compartir producto"
        className="no-custom-btn inline-flex items-center justify-center w-12 h-12 rounded-lg border border-[#d6dbe6] dark:border-[#3a4358] bg-[#f8f9fc] dark:bg-[#141a26] text-[#1a2030] dark:text-[#eef2ff] hover:bg-[#eef0f5] dark:hover:bg-[#1a2230] transition-colors btn-focus"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
      </button>
      <button
        type="button"
        onClick={handleFavorite}
        aria-label={fav ? 'Quitar de tu selección' : 'Agregar a tu selección'}
        className={`no-custom-btn inline-flex items-center justify-center w-12 h-12 rounded-lg border transition-colors btn-focus ${
          fav
            ? 'border-[#d4a43b]/45 bg-[#d4a43b]/18 text-[#d4a43b]'
            : 'border-[#d6dbe6] dark:border-[#3a4358] bg-[#f8f9fc] dark:bg-[#141a26] text-[#1a2030] dark:text-[#eef2ff] hover:bg-[#eef0f5] dark:hover:bg-[#1a2230]'
        }`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill={fav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M20.8 7.6c0 5.8-8.8 11.4-8.8 11.4S3.2 13.4 3.2 7.6C3.2 5 5 3.2 7.6 3.2c1.7 0 3.3.9 4.4 2.3 1.1-1.4 2.7-2.3 4.4-2.3 2.6 0 4.4 1.8 4.4 4.4z" />
        </svg>
      </button>
    </div>
  )
}
