/**
 * Detección heurística: si parece Markdown, renderizamos con react-markdown (GFM + sanitize).
 * Texto plano sigue usando párrafos / lead / panel sin parsear ** ni listas por accidente.
 */
export function descriptionLooksLikeMarkdown(raw) {
  const t = String(raw ?? '').trim()
  if (t.length < 2) return false
  if (/^#{1,6}\s/m.test(t)) return true
  if (/\*\*[^*\n][\s\S]*?\*\*/.test(t)) return true
  if (/__[^_\n][\s\S]*?__/.test(t)) return true
  if (/^\s*[-*+]\s+\S/m.test(t)) return true
  if (/^\s*\d+\.\s+\S/m.test(t)) return true
  if (/\[[^\]]+\]\([^)\s]+\)/.test(t)) return true
  if (/^>\s/m.test(t)) return true
  if (/^```/m.test(t)) return true
  return false
}

/** Texto plano para meta / JSON-LD (sin sintaxis Markdown). */
export function markdownToPlainText(md, maxLen = 600) {
  let s = String(md ?? '')
    .replace(/^#{1,6}\s?/gm, '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/~~([^~]+)~~/g, '$1')
    .replace(/[*_~`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (maxLen > 0 && s.length > maxLen) s = `${s.slice(0, maxLen).trim()}…`
  return s
}
