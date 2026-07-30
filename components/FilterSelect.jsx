'use client'

import React, { useCallback, useEffect, useId, useRef, useState } from 'react'

const CLOSE_MS = 340

/**
 * Select custom accesible para filtros del catálogo.
 * @param {{ value: string, options: { value: string, label: string }[], onChange: (value: string) => void, id?: string, label?: string, className?: string, disabled?: boolean }} props
 */
export default function FilterSelect({
  value = '',
  options = [],
  onChange,
  id,
  label,
  className = '',
  disabled = false,
}) {
  const reactId = useId()
  const listboxId = `${reactId}-listbox`
  const labelId = label ? `${reactId}-label` : undefined
  const triggerId = id || `${reactId}-trigger`

  const rootRef = useRef(null)
  const listRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [rendered, setRendered] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)

  const selectedIndex = options.findIndex((opt) => String(opt.value) === String(value))
  const selected = selectedIndex >= 0 ? options[selectedIndex] : null
  const displayLabel = selected?.label || options[0]?.label || ''

  const close = useCallback(() => {
    setOpen(false)
    setHighlightIndex(-1)
  }, [])

  const openList = useCallback(() => {
    if (disabled) return
    setRendered(true)
    // Double rAF: paint closed state, then open → smooth CSS enter
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setOpen(true)
      })
    })
    const start = selectedIndex >= 0 ? selectedIndex : 0
    setHighlightIndex(start)
  }, [disabled, selectedIndex])

  useEffect(() => {
    if (open) {
      setRendered(true)
      return undefined
    }

    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const delay = reduceMotion ? 0 : CLOSE_MS
    const timer = window.setTimeout(() => {
      setRendered(false)
    }, delay)

    return () => {
      window.clearTimeout(timer)
    }
  }, [open])

  const selectIndex = useCallback(
    (index) => {
      const opt = options[index]
      if (!opt) return
      onChange?.(opt.value)
      close()
    },
    [options, onChange, close]
  )

  useEffect(() => {
    if (!open) return undefined

    function onPointerDown(event) {
      if (!rootRef.current) return
      if (!rootRef.current.contains(event.target)) close()
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown, { passive: true })
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
    }
  }, [open, close])

  useEffect(() => {
    if (!open || highlightIndex < 0) return
    const list = listRef.current
    if (!list) return
    const optionEl = list.querySelector(`[data-option-index="${highlightIndex}"]`)
    optionEl?.scrollIntoView({ block: 'nearest' })
  }, [open, highlightIndex])

  function onTriggerKeyDown(event) {
    if (disabled) return

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault()
        if (open) {
          if (highlightIndex >= 0) selectIndex(highlightIndex)
          else close()
        } else {
          openList()
        }
        break
      case 'ArrowDown':
        event.preventDefault()
        if (!open) {
          openList()
        } else {
          setHighlightIndex((i) => {
            const base = i < 0 ? selectedIndex : i
            return Math.min(options.length - 1, (base < 0 ? -1 : base) + 1)
          })
        }
        break
      case 'ArrowUp':
        event.preventDefault()
        if (!open) {
          openList()
        } else {
          setHighlightIndex((i) => {
            const base = i < 0 ? selectedIndex : i
            return Math.max(0, (base < 0 ? options.length : base) - 1)
          })
        }
        break
      case 'Home':
        if (open) {
          event.preventDefault()
          setHighlightIndex(0)
        }
        break
      case 'End':
        if (open) {
          event.preventDefault()
          setHighlightIndex(options.length - 1)
        }
        break
      case 'Escape':
        if (open) {
          event.preventDefault()
          close()
        }
        break
      case 'Tab':
        if (open) close()
        break
      default:
        break
    }
  }

  return (
    <div
      ref={rootRef}
      className={`filter-select ${open ? 'is-open' : ''} ${
        rendered && !open ? 'is-closing' : ''
      } ${className}`.trim()}
    >
      {label ? (
        <span id={labelId} className="filter-select__label">
          {label}
        </span>
      ) : null}

      <button
        type="button"
        id={triggerId}
        className="no-custom-btn filter-select__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-labelledby={[labelId, triggerId].filter(Boolean).join(' ') || undefined}
        disabled={disabled}
        onClick={() => {
          if (open) close()
          else openList()
        }}
        onKeyDown={onTriggerKeyDown}
      >
        <span className="filter-select__value" key={displayLabel}>
          {displayLabel}
        </span>
        <svg
          className="filter-select__chevron"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
        >
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {rendered ? (
        <ul
          ref={listRef}
          id={listboxId}
          className={`filter-select__list${open ? ' is-visible' : ''}`}
          role="listbox"
          aria-labelledby={labelId || triggerId}
          tabIndex={-1}
        >
          {options.map((opt, index) => {
            const isSelected = String(opt.value) === String(value)
            const isActive = index === highlightIndex
            return (
              <li
                key={`${opt.value}-${index}`}
                id={`${reactId}-opt-${index}`}
                role="option"
                aria-selected={isSelected}
                data-option-index={index}
                style={{ '--option-i': index }}
                className={[
                  'filter-select__option',
                  isSelected ? 'is-selected' : '',
                  isActive ? 'is-active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onMouseEnter={() => setHighlightIndex(index)}
                onMouseDown={(event) => {
                  // Evita blur/cierre antes del click.
                  event.preventDefault()
                }}
                onClick={() => selectIndex(index)}
              >
                <span className="filter-select__option-mark" aria-hidden>
                  {isSelected ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M20 7L9.5 17.5 4 12"
                        stroke="currentColor"
                        strokeWidth="2.25"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <span className="filter-select__option-dot" />
                  )}
                </span>
                <span className="filter-select__option-label">{opt.label}</span>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
