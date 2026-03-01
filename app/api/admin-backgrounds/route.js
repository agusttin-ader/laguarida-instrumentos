export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function GET() {
  try {
    const dir = path.join(process.cwd(), 'public', 'images', 'admin-fondo')
    const entries = await fs.readdir(dir, { withFileTypes: true })
    // Keep a very low floor only to avoid extremely tiny/compressed files.
    // User requested new uploads to be included in rotation.
    const MIN_BYTES = 12 * 1024

    const allowed = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif'])
    const files = entries
      .filter((e) => e.isFile())
      .map((e) => e.name)
      .filter((name) => allowed.has(path.extname(name).toLowerCase()))
      .sort((a, b) => a.localeCompare(b, 'es'))

    // Prefer the explicit naming convention user is using now.
    const preferred = files.filter((name) =>
      /^(admin-fondo-\d+|admin-\d+)\.(jpg|jpeg|png|webp|avif)$/i.test(name)
    )
    const baseList = preferred.length ? preferred : files

    // Filter out very compressed files that usually look soft/pixelated in full-screen login backgrounds.
    const withStats = await Promise.all(
      baseList.map(async (name) => {
        try {
          const stat = await fs.stat(path.join(dir, name))
          return { name, bytes: stat.size }
        } catch {
          return { name, bytes: 0 }
        }
      })
    )

    const filtered = withStats
      .filter((f) => f.bytes >= MIN_BYTES)
      .map((f) => f.name)

    // Safety fallback: if all images are below threshold, keep the original list.
    const images = filtered.length ? filtered : baseList

    return NextResponse.json({ images }, { status: 200 })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err), images: [] },
      { status: 200 }
    )
  }
}
