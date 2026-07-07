import { getModelGroupLogo, getModelGroupLogoSidebarClass } from '../lib/catalog/modelGroupLogos'

export default function CatalogSidebarModelItem({ group, active, onSelect }) {
  const modelLogo = getModelGroupLogo(group.id)

  return (
    <button
      type="button"
      onClick={() => onSelect(group.id)}
      className={`no-custom-btn no-custom-btn--flat catalog-sidebar-item catalog-sidebar-item--model w-full text-left ${
        active ? 'catalog-sidebar-item--active' : ''
      }`}
    >
      <div className="catalog-sidebar-item__body min-w-0 w-full">
        {modelLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={modelLogo}
            alt={group.label}
            className={getModelGroupLogoSidebarClass(group.id)}
          />
        ) : (
          <p className="catalog-sidebar-item__label font-display font-semibold tracking-tight">
            {group.label}
          </p>
        )}
        {group.subtitle ? (
          <p className="catalog-sidebar-item__meta mt-1 text-[10px] font-medium uppercase tracking-[0.15em] text-[var(--dark-muted)]">
            {group.subtitle}
          </p>
        ) : null}
        <p
          className={`catalog-sidebar-item__meta mt-1.5 text-xs ${
            group.count === 0 ? 'text-[var(--dark-muted)]/70' : 'text-[var(--dark-muted)]'
          }`}
        >
          {group.count} {group.count === 1 ? 'instrumento' : 'instrumentos'}
        </p>
      </div>
    </button>
  )
}
