import React from 'react'
import ClientAuth from './auth/ClientAuth'

export const metadata = {
  title: 'Admin - La Guarida',
}

export default function AdminLayout({ children }){
  return (
    <div style={{padding:20,fontFamily:'Inter, system-ui, sans-serif'}}>
      <header style={{marginBottom:20}}>
        <h1 style={{margin:0,fontSize:20}}>Admin — La Guarida</h1>
        <p style={{margin:0,color:'#666',fontSize:13}}>Sección administrativa (scaffold). Protected placeholder.</p>
      </header>

      <ClientAuth>
        <main>{children}</main>
      </ClientAuth>

      <footer style={{marginTop:40,color:'#666',fontSize:12}}>
        <div>Admin scaffold — no DB or providers implemented.</div>
      </footer>
    </div>
  )
}
