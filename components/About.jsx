"use client"
import React from 'react'
import { InstagramLogo, WhatsappLogo, Phone, EnvelopeSimple } from 'phosphor-react'

export default function About(){
  const insta = 'https://www.instagram.com/laguaridainstrumentos/'
  const phone = '+5491154661749'
  const waNumber = '5491154661749'
  const waMessage = encodeURIComponent('Hola me gustaria info sobre el catalogo porfavor !')
  const waLink = `https://wa.me/${waNumber}?text=${waMessage}`
  const mail = 'leonardo_ruberti@hotmail.com'

  return (
    <section id="about-section" className="mt-24 bg-white dark:bg-[#050506] border border-transparent rounded-lg shadow-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div className="md:col-span-2">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4">Una tienda, una historia</h2>
            <p className="text-base text-gray-700 dark:text-gray-200 mb-6">Una tienda, una historia — dedicada a las guitarras, a las búsquedas sonoras y a quienes las tocan.</p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Hecho por un músico, para músicos</h3>

            <div className="prose prose-sm lg:prose-base max-w-none text-gray-700 dark:text-gray-200">
              <p>La Guarida nació en el corazón de una ciudad que parecía detenerse durante la pandemia. Lo que comenzó como un pequeño proyecto de compra y venta —mi proyecto personal— se convirtió, paso a paso, en un lugar donde las guitarras encuentran dueño y las voces encuentran su refugio.</p>

              <p>Durante aquellos meses inciertos, la gente vino con historias; me contaban canciones que necesitaban salir. Así, de a poco, La Guarida dejó de ser sólo un negocio y pasó a ser un refugio para la música.</p>

              <p>Hoy mantengo esa filosofía: trabajo con honestidad, priorizo el trato cercano y creo que una buena guitarra no sólo suena mejor, sino que tiene una historia que vale la pena cuidar. Desde instrumentos vintage hasta modelos modernos, ofrezco asesoramiento y un espacio para probar y encontrar lo que realmente te inspira.</p>

              <p>Mi compromiso es simple: calidad, transparencia y pasión por la música. Si tenés dudas o simplemente querés pasar a saludar, mi puerta está abierta.</p>
            </div>
          </div>

          <aside className="md:col-span-1 bg-gray-50 dark:bg-[#0b0d0f] p-6 rounded-lg border border-gray-100 dark:border-gray-800">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Contacto rápido</h4>

            <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-200 mb-4">
              <li><strong>Teléfono:</strong> <a href={`tel:${phone}`} className="text-indigo-600 hover:underline">{phone}</a></li>
              <li><strong>WhatsApp:</strong> <a href={waLink} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">Iniciar chat</a></li>
              <li><strong>Email:</strong> <a href={`mailto:${mail}`} className="text-indigo-600 hover:underline">{mail}</a></li>
            </ul>

            <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Nuestro espacio</h5>
            <p className="text-sm text-gray-700 dark:text-gray-200 mb-4">Una sala de escucha: probá guitarras con calma y descubrí modelos únicos traídos por nuestro equipo.</p>

            <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Horarios</h5>
            <p className="text-sm text-gray-700 dark:text-gray-200 mb-4">Lunes a Viernes: 10:00 — 19:00<br/>Sábado: 10:00 — 17:00<br/>Domingo: Cerrado</p>

            <div className="mt-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Síguenos</p>
              <nav className="flex items-center gap-3">
                <a href={insta} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-gray-700 dark:text-gray-200 hover:text-pink-600">
                  <InstagramLogo size={20} weight="duotone" />
                </a>
                <a href={waLink} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="text-gray-700 dark:text-gray-200 hover:text-emerald-500">
                  <WhatsappLogo size={20} weight="duotone" />
                </a>
                <a href={`mailto:${mail}`} aria-label="Email" className="text-gray-700 dark:text-gray-200 hover:text-indigo-600">
                  <EnvelopeSimple size={20} weight="duotone" />
                </a>
              </nav>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
