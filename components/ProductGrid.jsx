import React, { useMemo } from 'react'
import ProductCard from './ProductCard'
import ScrollReveal from './ScrollReveal'

const featured = {
  id: 1,
  title: 'Fender Am Standard 2012',
  subtitle: 'Guitarra eléctrica',
  shortDescription: 'Strat Alder Jade Pearl · mástil Modern C · 3x Alnico V · tremolo 2 puntos · Case Fender Deluxe incluido.',
  slug: 'fender-am-std-2012-jpearl',
  price: 'U$S1990',
  images: ['/guitars/fender-am-std-2012-jpearl/hero.jpg']
}

const second = {
  id: 2,
  title: 'Fender Am Standard 2012',
  subtitle: 'Guitarra eléctrica',
  shortDescription: 'Am Standard Olympic White · mástil Modern C · 3x CS Fat 50 · tremolo 2 puntos · case Fender incluido.',
  slug: 'fender-am-std-ow',
  price: 'U$S2100',
  images: ['/guitars/fender-am-std-ow/hero.jpg']
}

const third = {
  id: 3,
  title: 'Fender Player Series 2019',
  subtitle: 'Guitarra eléctrica',
  shortDescription: 'Strat Player Silver · Alder body · Pau Ferro · 22 trastes · incluye funda y correa',
  slug: 'fender-player-2019',
  price: 'U$S1050',
  images: ['/guitars/fender-player-2019/hero.jpg']
}

const fourth = {
  id: 4,
  title: "Fender Classic Player 60' 2015",
  subtitle: 'Guitarra eléctrica',
  shortDescription: "Classic Player 60' Sonic Blue · Alder · maple neck · CS 69'/Dimarzio HS4 · incluye gigbag",
  slug: 'fender-strat-classic-player-60',
  price: 'U$S1550',
  images: ['/guitars/fender-strat-classic-player-60/hero.jpg']
}

const fifth = {
  id: 5,
  title: 'Fender Telecaster Am Professional II',
  subtitle: 'Guitarra eléctrica',
  shortDescription: 'Telecaster Roasted Pine Butterscotch Blonde · Deep C · V-Mod II · incluye Candy Case',
  slug: 'fender-tele-am-pro-2',
  price: 'U$S2300',
  images: ['/guitars/fender-tele-am-pro-2/hero.jpg']
}

const sixth = {
  id: 6,
  title: 'Fender Telecaster Am Deluxe',
  subtitle: 'Guitarra eléctrica',
  shortDescription: 'Telecaster Deluxe Olympic Pearl · Alder · Modern D · 22 trastes · Noiseless N3 · incluye Case SKB',
  slug: 'fender-tele-deluxe',
  price: 'U$S2500',
  images: ['/guitars/fender-tele-deluxe/hero.jpg']
}

const seventh = {
  id: 7,
  title: 'Fender Stratocaster Am Professional II 2020',
  subtitle: 'Guitarra eléctrica',
  shortDescription: 'AM Professional II 2020 · Alder · Deep C · 3x V-Mod II · incluye candy case y estuche Fender',
  slug: 'fender-am-pro-2',
  price: 'U$S2399',
  images: ['/guitars/fender-am-pro-2/hero.jpg']
}

const eighth = {
  id: 8,
  title: 'Gibson LPJ 2014',
  subtitle: 'Guitarra eléctrica',
  shortDescription: 'LPJ 120th · Caoba cuerpo sólido · tapa Arce tallado · 22 trastes · incluye funda Gibson',
  slug: 'gibson-lpj',
  price: 'U$S1500',
  images: ['/guitars/gibson-lpj/hero.jpg']
}

const ninth = {
  id: 9,
  title: "Fender Am Vintage 59’ 2015",
  subtitle: 'Guitarra eléctrica',
  shortDescription: 'Strat Vintage 3T Sunburst · Alder · mástil D · 3x Pure Vintage 59 · incluye Candy Case',
  slug: 'avri-59',
  price: 'U$S2990',
  images: ['/guitars/avri-59/hero.jpg']
}

/* Gibson SG removed (vendida) */

const eleventh = {
  id: 11,
  title: 'Ibanez Prestige AZ2204 (2022)',
  subtitle: 'Guitarra eléctrica',
  shortDescription: 'AZ2204 Prestige · Alder · Roasted Maple neck · HSS Seymour Duncan Fortuna · Gotoh T1702 · incluye Candy Case',
  slug: 'ibanez-az-2204',
  price: 'U$S2700',
  images: ['/guitars/ibanez-az-2204/hero.jpg']
}

const twelfth = {
  id: 12,
  title: 'Ibánez RG 350 EXZ',
  subtitle: 'Guitarra eléctrica',
  shortDescription: 'RG350 EXZ · Basswood · Wizard II · HSH Infinity · Edge III · incluye funda y palanca',
  slug: 'ibanez-rg-350',
  price: 'U$S650',
  images: ['/guitars/ibanez-rg-350/hero.jpg']
}

const thirteenth = {
  id: 13,
  title: 'Paul Reed Smith Silver Sky',
  subtitle: 'Guitarra eléctrica',
  shortDescription: 'PRS Silver Sky · Poplar · 635 JM neck · 3x PRS 635 JM S · incluye Gigbag',
  slug: 'prs-silver-sky',
  price: 'U$S1350',
  images: ['/guitars/prs-silver-sky/hero.jpg']
}

const placeholders = Array.from({length:0}).map((_,i)=>{
  const title = `Modelo ${i+9}`
  const slug = title.toLowerCase().replace(/\s+/g,'-')
  const type = (i+8)%2===0? 'Guitarra acústica' : 'Guitarra eléctrica'
  const short = type === 'Guitarra acústica'
    ? 'Alder · Nitro finish · mástil Arce'
    : 'Alder / Alder body · nitro finish · mástil Arce'
  return ({
    id: i+9,
    title,
    subtitle: type,
    shortDescription: short,
    slug,
  })
})

const items = [featured, second, third, fourth, fifth, sixth, seventh, eighth, ninth, eleventh, twelfth, thirteenth, ...placeholders]

export default function ProductGrid(){
  const shuffledItems = useMemo(() => {
    const a = [...items]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }, [])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {shuffledItems.map((item, idx)=> (
        <ScrollReveal key={item.id} delay={idx * 12}>
          <ProductCard item={item} />
        </ScrollReveal>
      ))}
    </div>
  )
}
