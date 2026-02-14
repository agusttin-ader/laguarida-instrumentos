import React from 'react'
import ProductCard from './ProductCard'

const items = Array.from({length:8}).map((_,i)=>({
  id: i+1,
  title: `Modelo ${i+1}`,
  subtitle: i%2===0? 'Guitarra acústica' : 'Guitarra eléctrica'
}))

export default function ProductGrid(){
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {items.map(item=> (
        <ProductCard key={item.id} item={item} />
      ))}
    </div>
  )
}
