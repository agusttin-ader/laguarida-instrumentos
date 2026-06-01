import { useLocalCatalog } from '../supabase/mode'
import { isContingencyActive } from '../supabase/contingency'

/** Catálogo público debe leer backup (local, contingencia o bloqueo total). */
export function shouldReadCatalogFromBackup() {
  return useLocalCatalog() || isContingencyActive()
}
