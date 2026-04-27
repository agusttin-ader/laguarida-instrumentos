export const WHATSAPP_WA_ME_NUMBER = '5491154661749'

const FROM_WEB = 'Hola, vengo de la web de La Guarida.'

export function buildWaMeHref(message) {
  return `https://wa.me/${WHATSAPP_WA_ME_NUMBER}?text=${encodeURIComponent(message)}`
}

export const WHATSAPP_DEFAULT_WEB_MESSAGE = `${FROM_WEB} Me gustaría recibir información.`

export function whatsAppProductMessage(productName) {
  const name = String(productName || '').trim()
  if (!name) {
    return `${FROM_WEB} Me interesa un instrumento del catálogo, ¿me podrías dar más información?`
  }
  return `${FROM_WEB} Me interesa la ${name}, ¿me podrías dar más información?`
}
