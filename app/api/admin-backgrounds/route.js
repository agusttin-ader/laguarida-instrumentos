export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function GET() {
  try {
    const dir = path.join(process.cwd(), 'public', 'images', 'admin-fondo')
    const entries = await fs.readdir(dir, { withFileTypes: true })

    const allowed = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif'])
    const images = entries
      .filter((e) => e.isFile())
      .map((e) => e.name)
      .filter((name) => allowed.has(path.extname(name).toLowerCase()))
      .sort((a, b) => a.localeCompare(b, 'es'))

    return NextResponse.json({ images }, { status: 200 })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err), images: [] },
      { status: 200 }
    )
  }
}
