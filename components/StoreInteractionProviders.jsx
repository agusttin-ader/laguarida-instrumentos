'use client'

import { ToastProvider } from './ToastContext'
import { FavoritesProvider } from './ProductShareAndFavorite'

/** Toast + favoritos solo en rutas de catálogo, PDP y favoritos (no en home/legal). */
export default function StoreInteractionProviders({ children }) {
  return (
    <ToastProvider>
      <FavoritesProvider>{children}</FavoritesProvider>
    </ToastProvider>
  )
}