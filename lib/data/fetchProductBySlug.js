import { cache } from 'react'
import { getSupabaseServerClient } from '../supabase/server'

/** Una fila cruda de `products` por slug; deduplica dentro del mismo request (metadata + page). */
export const fetchProductRowBySlug = cache(async (slug) => {
  if (!slug || typeof slug !== 'string') return null
  try {
    const supabase = getSupabaseServerClient()
    // Una sola fila: `*` evita error 400 si faltan columnas opcionales (p. ej. reviews, aggregate_rating)
    // que no existen en todos los proyectos Supabase.
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug.trim())
      .maybeSingle()
    if (error || !data) return null
    return data
  } catch {
    return null
  }
})
