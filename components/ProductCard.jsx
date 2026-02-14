import React from 'react'

export default function ProductCard({item}){
  return (
    <article className="card-compact transform transition-transform duration-200 hover:-translate-y-1">
      <div className="image-placeholder w-full rounded-md overflow-hidden" style={{paddingTop: '118%'}}></div>
      <div className="mt-4">
        <p className="text-sm subtitle-compact muted-text">{item.subtitle}</p>
        <h3 className="mt-2 display-xl text-gray-900">{item.title}</h3>
        <p className="mt-4 body-copy muted-text">Edición limitada — diseño editorial con foco en proporciones y espacios.</p>
        <div className="mt-4">
          <a href="#" className="btn-minimal btn-focus">Ver</a>
        </div>
      </div>
    </article>
  )
}
