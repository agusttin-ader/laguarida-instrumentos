"use client"

import { useCallback, useEffect, useRef } from 'react'
import ProductCard from './ProductCard'
import { animateScrollLeft, createScrollAnimator } from '../lib/smoothHorizontalScroll'

const MOBILE_QUERY = '(max-width: 767px)'
const SWIPE_COMMIT_RATIO = 0.22

function getCarouselMetrics(el) {
  const first = el.children[0]
  if (!first) return { stride: 0 }
  const styles = getComputedStyle(el)
  const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0
  const width = first.getBoundingClientRect().width
  return { stride: width + gap }
}

function getIndexFromScroll(el) {
  const { stride } = getCarouselMetrics(el)
  if (!stride) return 0
  return Math.round(el.scrollLeft / stride)
}

function getScrollLeftForIndex(el, index, slideCount) {
  const { stride } = getCarouselMetrics(el)
  if (!stride) return 0
  const clamped = Math.max(0, Math.min(slideCount - 1, index))
  return clamped * stride
}

function useOneStepHorizontalScroll(containerRef, slideCount) {
  const gestureRef = useRef({
    tracking: false,
    startX: 0,
    startScroll: 0,
    startIndex: 0,
  })
  const animatorRef = useRef(createScrollAnimator())

  useEffect(() => {
    const el = containerRef.current
    if (!el || slideCount < 2) return undefined

    const mq = window.matchMedia(MOBILE_QUERY)
    if (!mq.matches) return undefined

    const animator = animatorRef.current

    const maxScroll = () => {
      const { stride } = getCarouselMetrics(el)
      return Math.max(0, (slideCount - 1) * stride)
    }

    const snapTo = (index, instant = false) => {
      const left = getScrollLeftForIndex(el, index, slideCount)
      return animator.run(el, left, { instant, durationMs: 360 })
    }

    const onTouchStart = (event) => {
      if (!window.matchMedia(MOBILE_QUERY).matches) return
      animator.cancel()
      const touch = event.touches[0]
      gestureRef.current = {
        tracking: true,
        startX: touch.clientX,
        startScroll: el.scrollLeft,
        startIndex: getIndexFromScroll(el),
      }
    }

    const onTouchMove = (event) => {
      if (!gestureRef.current.tracking) return
      const touch = event.touches[0]
      const delta = gestureRef.current.startX - touch.clientX
      const { stride } = getCarouselMetrics(el)
      if (!stride) return

      const startIdx = gestureRef.current.startIndex
      let nextScroll = gestureRef.current.startScroll + delta
      const minScroll = Math.max(0, (startIdx - 1) * stride)
      const maxAllowed = Math.min(maxScroll(), (startIdx + 1) * stride)
      nextScroll = Math.max(minScroll, Math.min(maxAllowed, nextScroll))
      el.scrollLeft = nextScroll

      if (Math.abs(delta) > 8) {
        event.preventDefault()
      }
    }

    const onTouchEnd = () => {
      if (!gestureRef.current.tracking) return
      gestureRef.current.tracking = false

      const { startIndex } = gestureRef.current
      const { stride } = getCarouselMetrics(el)
      if (!stride) {
        snapTo(startIndex)
        return
      }

      const offset = el.scrollLeft - startIndex * stride
      let target = startIndex

      if (offset > stride * SWIPE_COMMIT_RATIO) {
        target = startIndex + 1
      } else if (offset < -stride * SWIPE_COMMIT_RATIO) {
        target = startIndex - 1
      }

      target = Math.max(startIndex - 1, Math.min(startIndex + 1, target))
      snapTo(target)
    }

    const onResize = () => {
      if (!window.matchMedia(MOBILE_QUERY).matches) return
      animator.cancel()
      const idx = getIndexFromScroll(el)
      el.scrollLeft = getScrollLeftForIndex(el, idx, slideCount)
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd, { passive: true })
    el.addEventListener('touchcancel', onTouchEnd, { passive: true })
    window.addEventListener('resize', onResize)

    return () => {
      animator.cancel()
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
      el.removeEventListener('touchcancel', onTouchEnd)
      window.removeEventListener('resize', onResize)
    }
  }, [containerRef, slideCount])
}

export default function RelatedProductsScroll({ products = [] }) {
  const scrollRef = useRef(null)
  const items = Array.isArray(products) ? products : []

  useOneStepHorizontalScroll(scrollRef, items.length)

  const handleResizeSync = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const idx = getIndexFromScroll(el)
    animateScrollLeft(el, getScrollLeftForIndex(el, idx, items.length), { instant: true })
  }, [items.length])

  useEffect(() => {
    window.addEventListener('orientationchange', handleResizeSync)
    return () => window.removeEventListener('orientationchange', handleResizeSync)
  }, [handleResizeSync])

  if (!items.length) return null

  return (
    <div
      ref={scrollRef}
      className="related-products-scroll flex overflow-x-auto gap-4 pb-2 max-md:snap-x max-md:snap-mandatory sm:mx-0 sm:px-0 sm:overflow-visible sm:grid sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8"
    >
      {items.map((item) => (
        <div
          key={item.id || item.slug}
          className="related-products-scroll__slide w-[min(272px,82vw)] shrink-0 max-md:snap-start max-md:snap-always sm:w-auto"
        >
          <ProductCard item={item} maxGalleryImages={1} />
        </div>
      ))}
    </div>
  )
}
