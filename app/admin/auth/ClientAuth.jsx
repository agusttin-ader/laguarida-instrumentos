"use client"
import React, { useEffect, useState } from 'react'

export default function ClientAuth({ children }){
  const [authed, setAuthed] = useState(false)
  const [pwd, setPwd] = useState('')

  useEffect(()=>{
    try{
      const v = sessionStorage.getItem('adminAuth')
      setAuthed(v === 'true')
    }catch(e){}
  },[])

  function login(e){
    e.preventDefault()
    // placeholder: hardcoded password 'admin' (replace with real auth later)
    if (pwd === 'admin'){
      sessionStorage.setItem('adminAuth','true')
      setAuthed(true)
    } else {
      alert('Contraseña incorrecta (placeholder). Usa "admin" para continuar.')
    }
  }

  function logout(){
    sessionStorage.removeItem('adminAuth')
    setAuthed(false)
  }

  if (!authed){
    return (
      <div style={{maxWidth:520}}>
        <form onSubmit={login} style={{display:'flex',gap:8,alignItems:'center'}}>
          <input aria-label="admin password" placeholder="Contraseña (placeholder)" value={pwd} onChange={(e)=>setPwd(e.target.value)} style={{flex:1,padding:8}} />
          <button type="submit" style={{padding:'8px 12px'}}>Entrar</button>
        </form>
        <p style={{marginTop:8,color:'#666'}}>This is a placeholder protection. Replace with real auth before production.</p>
      </div>
    )
  }

  return (
    <div>
      <div style={{display:'flex',justifyContent:'flex-end',marginBottom:12}}>
        <button onClick={logout} style={{padding:'6px 10px'}}>Salir</button>
      </div>
      {children}
    </div>
  )
}
