import { NextResponse } from 'next/server'

// Preview endpoint disabled — server-side Jimp removed to avoid build issues.
export async function GET(req) {
  return NextResponse.json({ error: 'Image preview endpoint disabled' }, { status: 410 })
}
