'use client'
import { useState } from 'react'
import { Cpu, MemoryStick, HardDrive, Monitor, Battery, Tag } from 'lucide-react'
import { Product, StoreSettings } from '@/lib/store'
import { ProductImageGrid, GalleryModal } from './ProductImageGrid'
import SocialOrderButtons from './SocialOrderButtons'
import ProductDetailModal from './ProductDetailModal'

interface ProductCardProps {
  product: Product
  settings: StoreSettings
  index?: number
}

const badgeStyles: Record<string, string> = {
  New: 'bg-[#c8f135] text-[#0a0a0b]',
  Hot: 'bg-red-500 text-white badge-hot',
  Sale: 'bg-orange-500 text-white',
  Limited: 'bg-purple-500 text-white',
}

export default function ProductCard({ product, settings, index = 0 }: ProductCardProps) {
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)

  const staggerClass = `stagger-${Math.min(index + 1, 6)}`
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null

  return (
    <>
      <div
        className={`product-card bg-[#111113] border border-[#1a1a1e] hover:border-[#2e2e35] rounded-xl overflow-hidden animate-fade-up ${staggerClass} opacity-0`}
        style={{ animationFillMode: 'forwards' }}
      >
        {/* Image Grid */}
        <ProductImageGrid
          images={product.images}
          productName={product.name}
          onClick={() => setDetailOpen(true)}
        />

        {/* Card body */}
        <div className="p-4">
          {/* Brand + Badge */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-mono text-[#9aa0aa] uppercase tracking-wider">{product.brand}</span>
            <div className="flex items-center gap-1">
              {!product.inStock && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-[#2e2e35] text-[#9aa0aa]">Out of stock</span>
              )}
              {product.badge && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${badgeStyles[product.badge]}`}>
                  {product.badge}
                </span>
              )}
            </div>
          </div>

          {/* Name */}
          <h3
            className="text-white font-semibold text-sm leading-snug mb-2 cursor-pointer hover:text-[#c8f135] transition-colors line-clamp-2"
            onClick={() => setDetailOpen(true)}
          >
            {product.name}
          </h3>

          {/* Key specs */}
          <div className="space-y-1 mb-3">
            <div className="flex items-center gap-1.5 text-xs text-[#9aa0aa]">
              <Cpu size={11} className="text-[#c8f135] flex-shrink-0" />
              <span className="truncate">{product.specs.processor}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#9aa0aa]">
              <MemoryStick size={11} className="text-[#c8f135] flex-shrink-0" />
              <span>{product.specs.ram}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#9aa0aa]">
              <HardDrive size={11} className="text-[#c8f135] flex-shrink-0" />
              <span>{product.specs.storage}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[#1a1a1e] mb-3" />

          {/* Price */}
          <div className="flex items-end justify-between mb-3">
            <div>
              <div className="text-xl font-bold text-white font-mono">
                {settings.currency}{product.price.toLocaleString()}
              </div>
              {product.originalPrice && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-[#9aa0aa] line-through">
                    {settings.currency}{product.originalPrice.toLocaleString()}
                  </span>
                  <span className="text-xs text-[#c8f135] font-semibold">-{discount}%</span>
                </div>
              )}
            </div>
            <span className={`w-2 h-2 rounded-full ${product.inStock ? 'bg-[#c8f135]' : 'bg-red-500'}`} />
          </div>

          {/* Social order buttons */}
          <SocialOrderButtons
            productName={product.name}
            price={product.price}
            currency={settings.currency}
            whatsapp={settings.whatsapp}
            instagram={settings.instagram}
            facebook={settings.facebook}
            compact
          />
        </div>
      </div>

      {/* Gallery Modal */}
      <GalleryModal
        images={product.images}
        productName={product.name}
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={product}
        settings={settings}
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </>
  )
}
