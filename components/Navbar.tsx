'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Zap, Search, ShoppingBag, Settings, Menu, X } from 'lucide-react'

interface NavbarProps {
  storeName?: string
  onSearch?: (q: string) => void
  searchValue?: string
}

export default function Navbar({ storeName = 'VoltTech', onSearch, searchValue = '' }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-[#0a0a0b]/95 backdrop-blur-xl border-b border-[#2e2e35]' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-[#c8f135] rounded flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap size={16} className="text-[#0a0a0b]" fill="currentColor" />
            </div>
            <span style={{ fontFamily: 'Bebas Neue, sans-serif' }} className="text-xl tracking-widest text-white">
              {storeName}
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#products" className="text-sm text-[#9aa0aa] hover:text-white transition-colors">Products</a>
            <a href="#categories" className="text-sm text-[#9aa0aa] hover:text-white transition-colors">Categories</a>
            <a href="#about" className="text-sm text-[#9aa0aa] hover:text-white transition-colors">About</a>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className={`hidden md:flex items-center transition-all duration-300 ${searchOpen ? 'w-48' : 'w-8'}`}>
              {searchOpen ? (
                <input
                  autoFocus
                  value={searchValue}
                  onChange={e => onSearch?.(e.target.value)}
                  placeholder="Search laptops..."
                  className="w-full bg-[#1a1a1e] border border-[#3d3d47] rounded-lg px-3 py-1.5 text-sm text-white placeholder-[#9aa0aa] focus:outline-none focus:border-[#c8f135]"
                  onBlur={() => { if (!searchValue) setSearchOpen(false) }}
                />
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#1a1a1e] text-[#9aa0aa] hover:text-white transition-colors"
                >
                  <Search size={16} />
                </button>
              )}
            </div>

            <Link
              href="/admin"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a1a1e] border border-[#2e2e35] hover:border-[#c8f135] text-[#9aa0aa] hover:text-[#c8f135] text-xs transition-all"
            >
              <Settings size={13} />
              Admin
            </Link>

            {/* Mobile menu */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#1a1a1e] text-[#9aa0aa] hover:text-white"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#111113] border-t border-[#2e2e35] px-4 py-4 space-y-3">
          <input
            value={searchValue}
            onChange={e => onSearch?.(e.target.value)}
            placeholder="Search laptops..."
            className="w-full bg-[#1a1a1e] border border-[#3d3d47] rounded-lg px-3 py-2 text-sm text-white placeholder-[#9aa0aa] focus:outline-none focus:border-[#c8f135]"
          />
          <div className="flex flex-col gap-2 pt-2">
            <a href="#products" onClick={() => setMenuOpen(false)} className="text-sm text-[#9aa0aa] hover:text-white py-1">Products</a>
            <a href="#categories" onClick={() => setMenuOpen(false)} className="text-sm text-[#9aa0aa] hover:text-white py-1">Categories</a>
            <Link href="/admin" className="text-sm text-[#c8f135] py-1">⚙ Admin Panel</Link>
          </div>
        </div>
      )}
    </nav>
  )
}
