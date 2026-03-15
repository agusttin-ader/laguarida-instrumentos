"use client"

import React, { createContext, useContext, useState } from 'react'

const HomeHeroImageContext = createContext({ heroImageUrl: null, setHeroImageUrl: () => {} })

export function useHomeHeroImage() {
  return useContext(HomeHeroImageContext)
}

export function HomeHeroImageProvider({ children }) {
  const [heroImageUrl, setHeroImageUrl] = useState(null)
  return (
    <HomeHeroImageContext.Provider value={{ heroImageUrl, setHeroImageUrl }}>
      {children}
    </HomeHeroImageContext.Provider>
  )
}
