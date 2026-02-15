import React from 'react'
import ProductCard from './ProductCard'

const related = [
  {
    id: 1,
    title: 'Fender AM Std 2012',
    subtitle: 'Guitarra eléctrica',
    shortDescription: 'Strat Alder · pearloid pickguard · Modern C neck',
    slug: 'fender-am-std-2012-jpearl',
    images: ['/guitars/fender-am-std-2012-jpearl/hero.jpg']
  },
  {
    id: 2,
    title: 'Fender AM Std OW',
    subtitle: 'Guitarra eléctrica',
    shortDescription: 'Olympic White · mástil Modern C · versátil',
    slug: 'fender-am-std-ow',
    images: ['/guitars/fender-am-std-ow/hero.jpg']
  },
  {
    id: 3,
    title: 'Fender Player 2019',
    subtitle: 'Guitarra eléctrica',
    shortDescription: 'Player Series · cuerpo Alder · 22 trastes',
    slug: 'fender-player-2019',
    images: ['/guitars/fender-player-2019/hero.jpg']
  },
  {
    id: 4,
    title: "Fender Classic 60'",
    subtitle: 'Guitarra eléctrica',
    shortDescription: "Classic Player 60' · acabado vintage",
    slug: 'fender-strat-classic-player-60',
    images: ['/guitars/fender-strat-classic-player-60/hero.jpg']
  }
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
