"use client"
import React, { useState } from 'react'

export default function CreateProduct(){
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')

  function submit(e){
    e.preventDefault()
    alert('Create placeholder — implement backend to persist')
  }

  return (
    <div>
      <h2>Crear producto</h2>
      <form onSubmit={submit} style={{display:'grid',gap:8,maxWidth:640}}>
        <label>Title<input value={title} onChange={e=>setTitle(e.target.value)} style={{width:'100%',padding:8}}/></label>
        <label>Slug<input value={slug} onChange={e=>setSlug(e.target.value)} style={{width:'100%',padding:8}}/></label>
        <label>Imagen (placeholder)<input type="file" disabled /></label>
        <div>
          <button type="submit">Crear (placeholder)</button>
        </div>
      </form>
    </div>
  )
}
