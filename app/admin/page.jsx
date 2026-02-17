import React from 'react'
import AdminProducts from '../../components/AdminProducts'

export default function AdminIndex(){
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Panel de Administración</h1>
        <p className="text-sm text-gray-600">Gestioná productos, imágenes y catálogo</p>
      </div>
      <AdminProducts />
    </div>
  )
}
