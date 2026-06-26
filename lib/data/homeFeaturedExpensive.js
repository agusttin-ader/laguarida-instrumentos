import { getBackupProducts } from './localProductsBackup'
import { parseNumericPriceForSchema } from '../utils/normalizeProduct'

const POOL_SIZE = 9
const PICKS_PER_WEEK = 3

function getWeekRotationIndex(date = new Date()) {
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  utc.setUTCDate(utc.getUTCDate() + 4 - (utc.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil(((utc - yearStart) / 86400000 + 1) / 7)
  return utc.getUTCFullYear() * 53 + weekNo
}

/** Top 9 más caros del catálogo; rota de a 3 por semana ISO. */
export function getWeeklyFeaturedExpensiveProducts({ now = new Date() } = {}) {
  const products = getBackupProducts()
  const sorted = products
    .map((row) => ({
      ...row,
      _numericPrice: parseNumericPriceForSchema(row.price) ?? 0,
    }))
    .filter((row) => row._numericPrice > 0)
    .sort((a, b) => {
      if (b._numericPrice !== a._numericPrice) return b._numericPrice - a._numericPrice
      return String(a.slug || '').localeCompare(String(b.slug || ''))
    })

  const pool = sorted.slice(0, POOL_SIZE)
  if (!pool.length) return []

  const groupCount = Math.max(1, Math.ceil(pool.length / PICKS_PER_WEEK))
  const weekIndex = getWeekRotationIndex(now) % groupCount
  const start = weekIndex * PICKS_PER_WEEK

  return pool.slice(start, start + PICKS_PER_WEEK).map(({ _numericPrice, ...row }) => row)
}
