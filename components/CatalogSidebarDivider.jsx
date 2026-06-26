/** Separador simple dorado para sidebars del catálogo */
export default function CatalogSidebarDivider() {
  return (
    <div className="catalog-sidebar-divider py-3" aria-hidden>
      <span className="block h-px w-full bg-[rgba(var(--palette-gold-rgb),0.35)]" />
    </div>
  )
}
