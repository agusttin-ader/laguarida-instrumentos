"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function EditProduct({ params }){
  const { id } = params
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
