import React from 'react'
import fs from 'fs'
import path from 'path'
import GuitarGallery from '../../../components/GuitarGallery'

export default async function GuitarPage({ params }) {
  const resolved = await params
  const { slug } = resolved ?? { slug: 'avri-59' }

  const defaultGuitar = {
    name: 'La Clásica 58',
    brand: 'La Guarida Guitars',
    model: 'LC-58',
    subtitle: 'Guitarra acústica · cuerpo artesanal',
    price: '€1,499',
    year: '2026',
    description:
      'Tapa de abeto, fondo y aros en caoba selecta. Sonido equilibrado con presencia en medios y graves definidos. Construcción artesanal pensada para músicos y coleccionistas.',
    images: [],
  }

  // Metadata mapping per slug (used to populate title/desc/price)
  const guitarMetadata = {
    'avri-59': {
      name: "AVRI '59",
      brand: 'Fender',
      model: 'American Vintage II',
      subtitle: "Reissue 1959 · nitro finish",
      price: 'U$S 2,990',
      year: '2017',
      description: "Reedición fiel del clásico '59 con mástil cómodo y alma vintage. Tono cálido y resonante."
    },
    'fender-am-std-2012-jpearl': {
      name: 'Fender AM Std 2012',
      brand: 'Fender',
      model: 'American Standard 2012',
      subtitle: 'Hollow body · clásico moderno',
      price: 'U$S 1,799',
      year: '2012',
      description: 'Versátil y equilibrada, con electrónica moderna y construcción robusta.'
    },
    'fender-am-std-ow': {
      name: 'Fender AM Std OW',
      brand: 'Fender',
      model: 'American Standard',
      subtitle: 'Off-White · acabado clásico',
      price: 'U$S 1,699',
      year: '2011',
      description: 'Edición con acabado Off-White, cómoda y con gran attack en los medios.'
    },
    'fender-player-2019': {
      name: 'Fender Player Series 2019',
      brand: 'Fender',
      model: 'Player',
      subtitle: 'Serie Player · 2019',
      price: 'U$S 1,099',
      year: '2019',
      description: 'La Player Series trae sonido clásico con mejoras modernas y excelente relación calidad/precio.'
    },
    'fender-strat-classic-player-60': {
      name: "Fender Classic Player '60",
      brand: 'Fender',
      model: "Classic Player 60'",
      subtitle: 'Honoring the 60s',
      price: 'U$S 1,299',
      year: '2015',
      description: 'Estética y sonido 60s con puente vintage y electrónica especificada.'
    },
    'fender-tele-am-pro-2': {
      name: 'Fender Telecaster AM Pro II',
      brand: 'Fender',
      model: 'American Pro II',
      subtitle: 'Telecaster · Pro II',
      price: 'U$S 1,499',
      year: '2020',
      description: 'Tele clásica con mejoras contemporáneas para mayor versatilidad.'
    },
    'fender-tele-deluxe': {
      name: 'Fender Telecaster Deluxe',
      brand: 'Fender',
      model: 'Tele Deluxe',
      subtitle: 'HSS · sonido potente',
      price: 'U$S 1,649',
      year: '2018',
      description: 'Modelo Deluxe con pastillas humbucker y amplio rango tonal.'
    },
    'fender-am-pro-2': {
      name: 'Fender AM Pro II',
      brand: 'Fender',
      model: 'American Pro II',
      subtitle: 'Serie Pro · 2020',
      price: 'U$S 1,599',
      year: '2020',
      description: 'Gama pro con electrónica mejorada y feel contemporáneo.'
    },
    'gibson-lpj': {
      name: 'Gibson LPJ 2014',
      brand: 'Gibson',
      model: 'LPJ',
      subtitle: 'Les Paul Junior style',
      price: 'U$S 1,249',
      year: '2014',
      description: 'Sencilla y directa, con carácter y sustain propio de Gibson.'
    },
    'avri-59': {
      name: "AVRI 59",
      brand: 'Fender',
      model: 'American Vintage Reissue',
      subtitle: "Vintage reissue · auténtica",
      price: 'U$S 2,990',
      year: '2009',
      description: 'Reissue con construcción tradicional y maderas seleccionadas para un sonido clásico.'
    },
    'gibson-sg-std-lyre-vibrola': {
      name: "Gibson SG Standard 61' Lyre Vibrola",
      brand: 'Gibson',
      model: 'SG Standard',
      subtitle: "61' reissue · Lyre Vibrola",
      price: 'U$S 2,199',
      year: '2023',
      description: 'SG moderno con vibrato tipo Lyre y tono crujiente en medios.'
    },
    'ibanez-az-2204': {
      name: 'Ibanez AZ2204',
      brand: 'Ibanez',
      model: 'AZ Series',
      subtitle: 'Premium · modern playability',
      price: 'U$S 1,799',
      year: '2022',
      description: 'Gama alta de Ibanez con hardware moderno y versatilidad tonal.'
    },
    'ibanez-rg-350': {
      name: 'Ibanez RG350 EXZ',
      brand: 'Ibanez',
      model: 'RG Series',
      subtitle: 'RG · shredding ready',
      price: 'U$S 649',
      year: '2016',
      description: 'RG clásico, cómodo para riffing rápido y solos definidos.'
    },
    'prs-silver-sky': {
      name: 'PRS Silver Sky',
      brand: 'PRS',
      model: 'Silver Sky',
      subtitle: 'Signature · modern classic',
      price: 'U$S 2,299',
      year: '2020',
      description: 'Diseñada para tocar con sensibilidad vintage y prestaciones modernas.'
    }
  }

  // Attempt to read image files from public/guitars/<slug> and ensure hero is first
  let images = []
  try {
    const publicDir = path.join(process.cwd(), 'public', 'guitars', slug)
    const files = await fs.promises.readdir(publicDir)
    const imageFiles = files.filter((f) => /\.(jpe?g|png|webp|avif|gif)$/i.test(f))
    const heroFile = imageFiles.find((f) => /^hero\./i.test(f))
    const others = imageFiles.filter((f) => f !== heroFile).sort()
    const ordered = heroFile ? [heroFile, ...others] : imageFiles.sort()
    images = ordered.map((f) => `/guitars/${slug}/${encodeURIComponent(f)}`)
  } catch (err) {
    images = []
  }

  const meta = guitarMetadata[slug] ?? {}
  // If a data file exists for the slug (data/guitars/<slug>.md), prefer that full text as description
  let fileDescription = ''
  try {
    const descPath = path.join(process.cwd(), 'data', 'guitars', `${slug}.md`)
    if (fs.existsSync(descPath)) {
      fileDescription = await fs.promises.readFile(descPath, 'utf8')
    }
  } catch (err) {
    fileDescription = ''
  }

  const guitar = { ...defaultGuitar, ...meta, images: images.length ? images : defaultGuitar.images }
  if (fileDescription && fileDescription.trim().length > 0) {
    guitar.description = fileDescription.trim()
  }

  return (
    <div className="container-tight">
      <header className="mt-8">
        <p className="text-sm muted-text">Catálogo · Guitarras</p>
      </header>
      {/* Mobile: title first, then images. Desktop keeps original two-column layout. */}
      <div className="block lg:hidden mt-6">
        <p className="text-sm muted-text">{guitar.brand} · {guitar.model}</p>
        <h1 className="mt-2 display-xxl tight-tracking">{guitar.name}</h1>
        <p className="mt-3 subtitle-compact muted-text">{guitar.subtitle}</p>
      </div>

      <main className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-8 items-start">
        <section className="lg:col-span-1">
          <GuitarGallery images={guitar.images} />
        </section>

        <aside className="lg:col-span-1">
          <div className="flex flex-col gap-4">
            <div>
              {/* Desktop title only (hidden on mobile to avoid duplicate) */}
              <div className="hidden lg:block">
                <p className="text-sm muted-text">{guitar.brand} · {guitar.model}</p>
                <h1 className="mt-2 display-xxl tight-tracking">{guitar.name}</h1>
                <p className="mt-3 subtitle-compact muted-text">{guitar.subtitle}</p>
              </div>

              <div className="mt-4">
                <div className="price-large">{guitar.price}</div>
                <p className="mt-1 subtitle-compact muted-text">Edición limitada · {guitar.year}</p>
              </div>
            </div>

            <div className="mt-6 body-copy">
              {guitar.description}
            </div>

            <div className="mt-8">
              <a
                  href={`https://wa.me/541168696491?text=${encodeURIComponent(`Hola me interesa la ${guitar.name}, me podrias dar mas info?`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline btn-focus w-full text-center"
              >
                Consultar
              </a>
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}
