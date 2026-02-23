"use client"
import React, { useState } from 'react'

export default function EditProduct({ params }){
  // `params` may be a Promise in Next.js new routing; unwrap with React.use()
  // https://nextjs.org/docs/messages/sync-dynamic-apis
  const { id } = React.use(params)
  const [title, setTitle] = useState('')

  function submit(e){
    e.preventDefault()
    alert('Edit placeholder — implement backend to persist')
  }

  return (
    <div>
      <h2>Editar producto — {id}</h2>
      <form onSubmit={submit} style={{display:'grid',gap:8,maxWidth:640}}>
        <label>Title<input value={title} onChange={e=>setTitle(e.target.value)} style={{width:'100%',padding:8}}/></label>
        <label>Imagen (placeholder)<input type="file" disabled /></label>
        <div>
          <button type="submit">Guardar (placeholder)</button>
        </div>
      </form>
    </div>
  )
}
