'use client'

import dynamic from 'next/dynamic'

const DisableZoomInApp = dynamic(() => import('./DisableZoomInApp'), { ssr: false })

export default function RootClientBoot() {
  return <DisableZoomInApp />
}