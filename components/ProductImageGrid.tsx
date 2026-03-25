'use client'
import { useState } from 'react'
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import { Laptop } from 'lucide-react'

interface ProductImageGridProps {
  images: string[]
  productName: string
  onClick?: () => void
}

// Placeholder when no images uploaded
function LaptopPlaceholder({ className = '' }: { className?: string }) {
  return (
    <div className={`laptop-placeholder flex items-center justify-center ${className}`}>
      <div className="text-center opacity-30">
        <Laptop size={32} className="mx-auto text-[#9aa0aa]" />
      </div>
    </div>
  )
}

export function ProductImageGrid({ images, productName, onClick }: ProductImageGridProps) {
  const count = images.length

  if (count === 0) {
    return (
      <div onClick={onClick} className="cursor-pointer relative overflow-hidden rounded-t-xl aspect-[4/3]">
        <LaptopPlaceholder className="w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b]/60 to-transparent" />
      </div>
    )
  }

  if (count === 1) {
    return (
      <div onClick={onClick} className="cursor-pointer relative overflow-hidden rounded-t-xl aspect-[4/3] group">
        <img src={images[0]} alt={productName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b]/60 to-transparent" />
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-7 h-7 bg-black/60 rounded-full flex items-center justify-center">
            <ZoomIn size={13} className="text-white" />
          </div>
        </div>
      </div>
    )
  }

  if (count === 2) {
    return (
      <div onClick={onClick} className="cursor-pointer overflow-hidden rounded-t-xl aspect-[4/3] group image-grid-2">
        {images.slice(0, 2).map((img, i) => (
          <div key={i} className="relative overflow-hidden">
            <img src={img} alt={`${productName} ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            {i === 0 && <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b]/40 to-transparent" />}
          </div>
        ))}
      </div>
    )
  }

  if (count === 3) {
    return (
      <div onClick={onClick} className="cursor-pointer overflow-hidden rounded-t-xl aspect-[4/3] group image-grid-3">
        <div className="img-main relative overflow-hidden">
          <img src={images[0]} alt={`${productName} 1`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b]/40 to-transparent" />
        </div>
        {images.slice(1, 3).map((img, i) => (
          <div key={i} className="relative overflow-hidden">
            <img src={img} alt={`${productName} ${i + 2}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
        ))}
      </div>
    )
  }

  // 4 images
  return (
    <div onClick={onClick} className="cursor-pointer overflow-hidden rounded-t-xl aspect-[4/3] group image-grid-4">
      {images.slice(0, 4).map((img, i) => (
        <div key={i} className="relative overflow-hidden">
          <img src={img} alt={`${productName} ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          {i === 3 && images.length > 4 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white text-lg font-bold">+{images.length - 4}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// Full gallery modal
interface GalleryModalProps {
  images: string[]
  productName: string
  isOpen: boolean
  onClose: () => void
  initialIndex?: number
}

export function GalleryModal({ images, productName, isOpen, onClose, initialIndex = 0 }: GalleryModalProps) {
  const [current, setCurrent] = useState(initialIndex)

  if (!isOpen) return null

  const prev = () => setCurrent(c => (c - 1 + images.length) % images.length)
  const next = () => setCurrent(c => (c + 1) % images.length)

  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center modal-backdrop bg-black/85"
      onClick={handleBackdrop}
    >
      <div className="relative max-w-4xl w-full mx-4">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
        >
          <X size={18} />
        </button>

        {/* Main image */}
        <div className="relative rounded-2xl overflow-hidden bg-[#1a1a1e] aspect-video">
          {images.length > 0 ? (
            <img
              src={images[current]}
              alt={`${productName} ${current + 1}`}
              className="w-full h-full object-contain"
            />
          ) : (
            <LaptopPlaceholder className="w-full h-full" />
          )}

          {images.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-[#c8f135] hover:text-[#0a0a0b] flex items-center justify-center text-white transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-[#c8f135] hover:text-[#0a0a0b] flex items-center justify-center text-white transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 mt-3 justify-center">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                  i === current ? 'border-[#c8f135] scale-105' : 'border-transparent opacity-50 hover:opacity-80'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Counter */}
        <p className="text-center text-[#9aa0aa] text-sm mt-2">
          {images.length > 0 ? `${current + 1} / ${images.length}` : productName}
        </p>
      </div>
    </div>
  )
}
