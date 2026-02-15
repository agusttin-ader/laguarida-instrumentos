"use client";
import React from "react";
import MobileProductCard from "./MobileProductCard";
import FeaturedCarousel from "./FeaturedCarousel";
import SkeletonProductCard from "./SkeletonProductCard";
import ScrollReveal from "./ScrollReveal";

export default function MobileProductList({ products = [], featured = [], loading = false }) {
  // `loading` prop controls skeleton state. When fetching data, pass loading=true.
  // Skeletons use Tailwind's `animate-pulse`. For animated placeholders with motion,
  // Framer Motion variants can be used to stagger entrance of placeholder elements.
  if (loading) {
    const placeholders = new Array(4).fill(0);
    return (
      <div className="px-4">
        {featured && featured.length > 0 && <FeaturedCarousel items={featured} />}

        <div className="flex flex-col gap-4">
          {placeholders.map((_, i) => (
            <div key={i} className="w-full">
              <SkeletonProductCard />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4">
      {featured && featured.length > 0 && <FeaturedCarousel items={featured} />}

      <div className="flex flex-col gap-4">
        {products.map((p, i) => (
          <ScrollReveal key={p.slug} delay={i * 60}>
            <div className="w-full">
              <MobileProductCard product={p} />
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
