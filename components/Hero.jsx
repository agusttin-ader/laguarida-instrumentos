import React from 'react'

export default function Hero(){
  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mt-10 container-tight">
      {/* Left column: light gray background, big title, CTA */}
      <div className="bg-gray-50 p-10 flex flex-col justify-center rounded-lg subtle-border">
        <h2 className="display-xxl tight-tracking">La Clásica 58</h2>
        <p className="mt-3 subtitle-compact muted-text">Guitarra acústica · cuerpo artesanal</p>
        <div className="mt-6">
          <a href="#" className="btn-minimal btn-focus">Descubrir</a>
        </div>
      </div>

      {/* Center: tall image placeholder with breathing room */}
      <div className="flex items-center justify-center">
        <div className="image-placeholder w-full rounded transform transition-transform duration-200 hover:-translate-y-1 hover:shadow-md" style={{maxWidth: '540px', width: '100%', paddingTop: '150%'}}></div>
      </div>

      {/* Right: lighter dark panel, price and concise copy */}
      <div className="bg-gray-800 text-white p-10 flex flex-col justify-center rounded-lg">
        <div className="text-right">
          <div className="price-large">€1,499</div>
          <p className="mt-3 subtitle-compact text-gray-300">Edición limitada · 2026</p>
          <p className="mt-6 body-copy text-gray-200">Tapa de abeto, diapasón de palisandro. Presencia y calidez en grabación acústica.</p>
          <div className="mt-8 flex justify-end">
            <a href="#" className="btn-ghost-dark btn-focus">Pedir info</a>
          </div>
        </div>
      </div>
    </section>
  )
}
