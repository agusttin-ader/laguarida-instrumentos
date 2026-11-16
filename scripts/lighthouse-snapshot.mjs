#!/usr/bin/env node
/**
 * Snapshot Lighthouse (performance) contra el dev server.
 * Uso: npm run dev (otra terminal) && npm run perf:lighthouse
 */

import { spawnSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const base = process.env.PERF_BASE_URL || 'http://127.0.0.1:3000'
const outDir = path.join(root, 'docs', 'perf-snapshots')

const routes = [
  { name: 'home', path: '/' },
  { name: 'catalogo', path: '/catalogo' },
  { name: 'pdp', path: process.env.PERF_PDP_PATH || '/catalogo' },
]

function pickScore(report) {
  const perf = report?.categories?.performance
  const audits = report?.audits || {}
  return {
    performance: perf?.score != null ? Math.round(perf.score * 100) : null,
    lcpMs: audits['largest-contentful-paint']?.numericValue ?? null,
    inpMs: audits['interaction-to-next-paint']?.numericValue ?? audits['experimental-interaction-to-next-paint']?.numericValue ?? null,
    cls: audits['cumulative-layout-shift']?.numericValue ?? null,
    tbtMs: audits['total-blocking-time']?.numericValue ?? null,
  }
}

function resolveChromePath() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH
  const macChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  if (fs.existsSync(macChrome)) return macChrome
  return null
}

function runLighthouse(url, outFile) {
  const chromePath = resolveChromePath()
  const env = chromePath ? { ...process.env, CHROME_PATH: chromePath } : process.env
  const args = [
    url,
    '--only-categories=performance',
    '--preset=perf',
    '--form-factor=mobile',
    '--screenEmulation.mobile',
    '--throttling.cpuSlowdownMultiplier=4',
    '--output=json',
    `--output-path=${outFile}`,
    '--quiet',
    '--chrome-flags=--headless=new',
  ]
  const r = spawnSync('npx', ['lighthouse', ...args], { stdio: 'inherit', cwd: root, env })
  return r.status === 0
}

async function resolvePdpPath() {
  if (process.env.PERF_PDP_PATH) return process.env.PERF_PDP_PATH
  try {
    const res = await fetch(`${base}/api/products`)
    if (!res.ok) return '/catalogo'
    const data = await res.json()
    const slug = Array.isArray(data) && data[0]?.slug ? data[0].slug : null
    return slug ? `/guitars/${slug}` : '/catalogo'
  } catch {
    return '/catalogo'
  }
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true })
  const pdpPath = await resolvePdpPath()
  const list = [
    { name: 'home', path: '/' },
    { name: 'catalogo', path: '/catalogo' },
    { name: 'pdp', path: pdpPath },
  ]

  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const summary = { generatedAt: new Date().toISOString(), base, routes: {} }

  console.log(`Base: ${base}`)
  for (const route of list) {
    const url = `${base}${route.path}`
    const outFile = path.join(outDir, `${stamp}-${route.name}.json`)
    console.log(`\n→ ${route.name}: ${url}`)
    const ok = runLighthouse(url, outFile)
    if (!ok) {
      console.error(`Lighthouse falló en ${url} (¿está corriendo npm run dev?)`)
      process.exitCode = 1
      continue
    }
    const report = JSON.parse(fs.readFileSync(outFile, 'utf8'))
    summary.routes[route.name] = { path: route.path, ...pickScore(report) }
  }

  const mdPath = path.join(root, 'docs', 'PERF_BASELINE.md')
  const lines = [
    '# Baseline de rendimiento (Lighthouse mobile)',
    '',
    `Generado: ${summary.generatedAt}`,
    '',
    `Servidor: \`${base}\``,
    '',
    '| Ruta | Performance | LCP (ms) | TBT (ms) | CLS |',
    '|------|-------------|----------|----------|-----|',
  ]
  for (const [name, row] of Object.entries(summary.routes)) {
    lines.push(
      `| ${name} (\`${row.path}\`) | ${row.performance ?? '—'} | ${row.lcpMs != null ? Math.round(row.lcpMs) : '—'} | ${row.tbtMs != null ? Math.round(row.tbtMs) : '—'} | ${row.cls != null ? row.cls.toFixed(3) : '—'} |`,
    )
  }
  lines.push('', 'Regenerar: `npm run dev` + `npm run perf:lighthouse`', '')
  fs.writeFileSync(mdPath, lines.join('\n'))
  console.log(`\nResumen: ${mdPath}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})