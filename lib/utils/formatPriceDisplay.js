/**
 * Formatea SOLO para mostrar: agrega separador de miles al número del precio
 * preservando el prefijo de moneda y cualquier texto (p. ej. "ARS 300000" → "ARS 300.000").
 *
 * Es deliberadamente conservador: no toca la lógica de datos ni el valor usado
 * para Schema.org. Reformatea únicamente enteros "planos" (sin separadores ni
 * decimales) de 4+ dígitos; si el número ya trae separadores/decimales, lo deja igual.
 */
const NUMBER_FORMATTER = new Intl.NumberFormat('es-AR')

export default function formatPriceDisplay(price) {
  if (price == null) return price
  const str = String(price)
  return str.replace(/\d[\d.,]*/, (token) => {
    if (!/^\d+$/.test(token)) return token
    if (token.length < 4) return token
    return NUMBER_FORMATTER.format(Number(token))
  })
}
