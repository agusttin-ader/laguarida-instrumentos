import { NextResponse } from 'next/server'
import { getContingencyStatus } from '../../../lib/supabase/contingency'
import { getBackupProducts } from '../../../lib/data/localProductsBackup'

export const runtime = 'nodejs'

/** Estado del catálogo (contingencia automática / backup). Solo informativo. */
export async function GET() {
  const contingency = getContingencyStatus()
  const backupCount = getBackupProducts({ includeReserved: true }).length
  return NextResponse.json(
    {
      catalogSource: 'backup',
      useLocalCatalog: true,
      readFromBackup: true,
      contingency,
      backupProductCount: backupCount,
    },
    { status: 200, headers: { 'Cache-Control': 'no-store' } }
  )
}
