import React from 'react'
import { absoluteUrl } from '../../lib/siteUrl'
import LegalPageShell, { LegalSection } from '../../components/LegalPageShell'

export const metadata = {
  title: 'Política de privacidad',
  description: 'Cómo recopilamos, usamos y protegemos tus datos en La Guarida Instrumentos.',
  alternates: {
    canonical: absoluteUrl('/privacidad'),
  },
}

export const dynamic = 'force-dynamic'

export default function PrivacidadPage() {
  return (
    <LegalPageShell
      title="Política de privacidad"
      intro="En esta página explicamos de forma clara cómo tratamos tu información cuando navegás el sitio o te contactás con nosotros."
    >
      <LegalSection title="01. Información que recopilamos">
        <p>
          Podemos recopilar datos de contacto que nos compartís voluntariamente (por ejemplo, por WhatsApp o correo),
          datos técnicos básicos de navegación y consultas relacionadas con productos.
        </p>
      </LegalSection>

      <LegalSection title="02. Uso de la información">
        <p>
          Utilizamos la información para responder consultas, brindar asesoramiento comercial, mejorar la experiencia
          del sitio y mantener la seguridad de la plataforma.
        </p>
      </LegalSection>

      <LegalSection title="03. Conservación y protección de datos">
        <p>
          Aplicamos medidas razonables para proteger la información. Conservamos los datos durante el tiempo necesario
          para cumplir las finalidades descriptas o requerimientos legales aplicables.
        </p>
      </LegalSection>

      <LegalSection title="04. Compartición con terceros">
        <p>
          No vendemos datos personales. Podemos usar servicios de terceros para operar el sitio (por ejemplo, hosting,
          mensajería o analítica), bajo condiciones de confidencialidad y seguridad.
        </p>
      </LegalSection>

      <LegalSection title="05. Derechos del usuario">
        <p>
          Podés solicitar acceso, actualización o eliminación de tus datos escribiendo a nuestros canales de contacto.
        </p>
      </LegalSection>

      <LegalSection title="06. Cambios en esta política">
        <p>
          Esta política puede actualizarse para reflejar mejoras del servicio o cambios normativos. La versión vigente
          es la publicada en esta página.
        </p>
      </LegalSection>
    </LegalPageShell>
  )
}
