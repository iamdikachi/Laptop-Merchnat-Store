'use client'
import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, Cpu, MemoryStick, HardDrive, Monitor, Battery, Check, Zap } from 'lucide-react'
import { Product, StoreSettings } from '@/lib/store'
import SocialOrderButtons from './SocialOrderButtons'

interface Props {
  product: Product
  settings: StoreSettings
  isOpen: boolean
  onClose: () => void
}

export default function ProductDetailModal({ product, settings, isOpen, onClose }: Props) {
  const [activeImg, setActiveImg] = useState(0)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setActiveImg(0)
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null

  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  const prev = () => setActiveImg(c => (c - 1 + product.images.length) % product.images.length)
  const next = () => setActiveImg(c => (c + 1) % product.images.length)

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center modal-backdrop bg-black/80 p-0 sm:p-4"
      onClick={handleBackdrop}
    >
      <div className="relative w-full sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-[#111113] rounded-t-3xl sm:rounded-2xl border border-[#2e2e35] shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-[#1a1a1e] hover:bg-[#c8f135] hover:text-[#0a0a0b] flex items-center justify-center text-[#9aa0aa] transition-all"
        >
          <X size={17} />
        </button>

        <div className="grid sm:grid-cols-2 gap-0">
          {/* Left: Gallery */}
          <div className="bg-[#0a0a0b] sm:rounded-l-2xl pt-4 px-0 pb-4 sm:p-4">
            {/* Main image */}
            <div className="relative aspect-[4/5] sm:aspect-video rounded-none sm:rounded-xl overflow-hidden bg-[#1a1a1e] mb-3">
              {product.images.length > 0 ? (
                <img
                  src={product.images[activeImg]}
                  alt={product.name}
                  className="w-full h-full object-cover sm:object-contain"
                />
              ) : (
                <div className="w-full h-full laptop-placeholder flex items-center justify-center">
                  <span className="text-5xl opacity-20">💻</span>
                </div>
              )}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-[#c8f135] hover:text-[#0a0a0b] flex items-center justify-center text-white transition-all"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={next}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-[#c8f135] hover:text-[#0a0a0b] flex items-center justify-center text-white transition-all"
                  >
                    <ChevronRight size={16} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2 justify-center flex-wrap">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`w-14 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                      i === activeImg ? 'border-[#c8f135]' : 'border-transparent opacity-40 hover:opacity-70'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Image count */}
            {product.images.length > 1 && (
              <p className="text-center text-[#9aa0aa] text-xs mt-2">
                {activeImg + 1} of {product.images.length} photos
              </p>
            )}
          </div>

          {/* Right: Details */}
          <div className="p-5 sm:p-6 flex flex-col">
            {/* Brand + Badge */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-[#9aa0aa] uppercase tracking-widest">{product.brand}</span>
              {product.badge && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  product.badge === 'Hot' ? 'bg-red-500 text-white' :
                  product.badge === 'New' ? 'bg-[#c8f135] text-[#0a0a0b]' :
                  product.badge === 'Sale' ? 'bg-orange-500 text-white' : 'bg-purple-500 text-white'
                }`}>
                  {product.badge}
                </span>
              )}
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#1a1a1e] text-[#9aa0aa]">
                {product.category}
              </span>
            </div>

            <h2 className="text-xl font-bold text-white mb-1 leading-snug">{product.name}</h2>

            {/* Price */}
            <div className="flex items-end gap-3 mb-4">
              <span className="text-2xl font-bold font-mono text-white">
                {settings.currency}{product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-sm text-[#9aa0aa] line-through mb-1">
                    {settings.currency}{product.originalPrice.toLocaleString()}
                  </span>
                  <span className="text-sm text-[#c8f135] font-semibold mb-1">Save {discount}%</span>
                </>
              )}
            </div>

            {/* Availability */}
            <div className="flex items-center gap-2 mb-5">
              <div className={`w-2 h-2 rounded-full ${product.inStock ? 'bg-[#c8f135]' : 'bg-red-500'}`} />
              <span className="text-xs text-[#9aa0aa]">
                {product.inStock ? 'In Stock — Ready to ship' : 'Out of Stock'}
              </span>
            </div>

            {/* Specs */}
            <div className="bg-[#0a0a0b] rounded-xl p-4 mb-5 space-y-2.5">
              <p className="text-xs text-[#9aa0aa] uppercase tracking-wider mb-3">Specifications</p>
              {[
                { icon: Cpu, label: 'Processor', value: product.specs.processor },
                { icon: MemoryStick, label: 'Memory', value: product.specs.ram },
                { icon: HardDrive, label: 'Storage', value: product.specs.storage },
                { icon: Monitor, label: 'Display', value: product.specs.display },
                ...(product.specs.battery ? [{ icon: Battery, label: 'Battery', value: product.specs.battery }] : []),
                ...(product.specs.graphics ? [{ icon: Zap, label: 'Graphics', value: product.specs.graphics }] : []),
                ...(product.specs.features ? [{ icon: Check, label: 'Features', value: product.specs.features }] : []),
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-2.5">
                  <Icon size={13} className="text-[#c8f135] mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-[#9aa0aa]">{label}: </span>
                    <span className="text-xs text-[#e8eaed]">{value}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Order buttons */}
            <div className="mt-auto">
              <SocialOrderButtons
                productName={product.name}
                price={product.price}
                currency={settings.currency}
                whatsapp={settings.whatsapp}
                instagram={settings.instagram}
                facebook={settings.facebook}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
