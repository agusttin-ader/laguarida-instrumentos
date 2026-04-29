import es from './messages.es'
import en from './messages.en'

export function getMessages(locale) {
  return locale === 'en' ? en : es
}
