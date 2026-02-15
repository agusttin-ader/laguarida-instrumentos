import React from 'react'
import Link from 'next/link'

const MOCK_PRODUCTS = [
  { id: 'avri-59', title: "Fender Am Vintage 59’" },
  { id: 'fender-am-std-2012-jpearl', title: 'Fender Am Standard 2012' },
]

export default function AdminIndex(){
  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <h2>Productos</h2>
        <Link href="/admin/create"><button style={{padding:'8px 12px'}}>Crear producto</button></Link>
      </div>

      <ul>
        {MOCK_PRODUCTS.map(p=> (
          <li key={p.id} style={{padding:8,borderBottom:'1px solid #eee',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <div style={{fontWeight:600}}>{p.title}</div>
              <div style={{fontSize:13,color:'#666'}}>{p.id}</div>
            </div>
            <div style={{display:'flex',gap:8}}>
              <Link href={`/guitars/${p.id}`}><a target="_blank" rel="noreferrer">Ver</a></Link>
              <Link href={`/admin/${p.id}`}><button>Editar</button></Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
