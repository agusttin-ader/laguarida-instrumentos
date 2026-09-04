import React from 'react'
import { absoluteUrl } from '../../lib/siteUrl'
import LegalPageShell, { LegalSection } from '../../components/LegalPageShell'

export const metadata = {
  title: 'Términos y condiciones',
  description: 'Condiciones de uso del sitio y pautas comerciales de La Guarida Instrumentos.',
  alternates: {
    canonical: absoluteUrl('/terminos'),
  },
}

/** Evita HTML estático cacheado con el recuadro viejo (CDN / edge). */
export const dynamic = 'force-dynamic'

export default function TerminosPage() {
  return (
    <LegalPageShell
      title="Términos y condiciones"
      intro="Estas condiciones regulan el uso del sitio y las pautas generales de nuestras operaciones comerciales."
    >
      <LegalSection title="01. Uso del sitio">
        <p>
          El uso de este sitio implica la aceptación de estos términos. El contenido se ofrece con fines informativos
          y comerciales sobre productos y servicios de La Guarida Instrumentos.
        </p>
      </LegalSection>

      <LegalSection title="02. Productos y disponibilidad">
        <p>
          La disponibilidad, descripciones e imágenes de productos pueden variar sin previo aviso. Publicaciones y
          detalles técnicos están sujetos a actualización.
        </p>
      </LegalSection>

      <LegalSection title="03. Precios y medios de pago">
        <p>
          Los precios informados pueden modificarse. Las condiciones de pago se confirman al momento de la operación
          por los canales oficiales de contacto.
        </p>
      </LegalSection>

      <LegalSection title="04. Envíos y entregas">
        <p>
          Los tiempos y costos de envío dependen del destino y del operador logístico. La coordinación final se realiza
          con el cliente antes del cierre de cada venta.
        </p>
      </LegalSection>

      <LegalSection title="05. Responsabilidad">
        <p>
          Hacemos esfuerzos razonables para mantener información actualizada y exacta, pero no garantizamos ausencia de
          errores tipográficos o interrupciones temporales del servicio.
        </p>
      </LegalSection>

      <LegalSection title="06. Contacto">
        <p>
          Para consultas sobre estos términos o una operación puntual, podés comunicarte por WhatsApp o correo desde
          los canales publicados en el sitio.
        </p>
      </LegalSection>
    </LegalPageShell>
  )
}
