import React from 'react'
import ProductCard from './ProductCard'

const related = [
  { id: 1, title: 'Vintage 12', subtitle: 'Guitarra acústica' },
  { id: 2, title: 'Strato Neo', subtitle: 'Guitarra eléctrica' },
  { id: 3, title: 'Classic 7', subtitle: 'Guitarra clásica' },
  { id: 4, title: 'Traveler', subtitle: 'Guitarra de viaje' },
]

export default function RelatedProducts(){
  return (
    <section className="mt-20 container-tight">
      <div className="mb-10">
        <p className="text-sm muted-text uppercase">Relacionado</p>
        <h3 className="mt-2 display-xl">Productos relacionados</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {related.map(item => (
          <ProductCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}
