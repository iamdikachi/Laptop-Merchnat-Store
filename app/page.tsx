'use client'
import { useState, useEffect } from 'react'
import { Zap, Shield, Truck, Headphones, ChevronRight, Cpu, TrendingUp, Package } from 'lucide-react'
import Navbar from '@/components/Navbar'
import ProductCard from '@/components/ProductCard'
import FloatingSocials from '@/components/FloatingSocials'
import { Product, StoreSettings, defaultSettings, sampleProducts } from '@/lib/store'

const categories = ['All', 'Gaming', 'Business', 'Creator', 'Budget', 'Ultrabook']

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings)
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products')
        if (res.ok) {
          const data = await res.json()
          setProducts(data.length > 0 ? data : sampleProducts)
        }
      } catch (err) {
        console.error('Failed to load products', err)
      }
    }
    fetchProducts()

    try {
      const storedSettings = localStorage.getItem('vt_settings')
      if (storedSettings) setSettings(JSON.parse(storedSettings))
    } catch {}
  }, [])

  const filtered = products.filter(p => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory
    const matchSearch = !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.specs.processor.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCat && matchSearch
  })

  const stats = [
    { label: 'Products Listed', value: products.length, icon: Package },
    { label: 'Happy Customers', value: '500+', icon: TrendingUp },
    { label: 'Brands Available', value: [...new Set(products.map(p => p.brand))].length, icon: Cpu },
  ]

  return (
    <main className="min-h-screen bg-[#0a0a0b]">
      <Navbar
        storeName={settings.storeName}
        onSearch={setSearchQuery}
        searchValue={searchQuery}
      />

      {/* Hero */}
      <section className="relative pt-24 pb-16 px-4 overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(#c8f135 1px, transparent 1px), linear-gradient(90deg, #c8f135 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />

        {/* Glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#c8f135]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto">
          <div className="max-w-3xl">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#c8f135]/10 border border-[#c8f135]/20 mb-6">
              <Zap size={12} className="text-[#c8f135]" fill="currentColor" />
              <span className="text-xs text-[#c8f135] font-medium tracking-wider uppercase">Premium Laptop Store</span>
            </div>

            {/* Headline */}
            <h1
              style={{ fontFamily: 'Bebas Neue, sans-serif' }}
              className="text-6xl sm:text-8xl text-white leading-none tracking-wide mb-4"
            >
              {settings.storeName}
              <br />
              <span className="text-[#c8f135] volt-text-glow text-xl md:text-6xl">LAPTOPS STORE</span>
            </h1>

            <p className="text-lg text-[#9aa0aa] max-w-xl mb-8 leading-relaxed">
              {settings.tagline} From powerhouse gaming rigs to sleek ultrabooks — find your perfect machine.
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href="#products"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#c8f135] text-[#0a0a0b] font-semibold text-sm hover:bg-[#d9f76a] transition-colors"
              >
                Shop Now <ChevronRight size={16} />
              </a>
              <a
                href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}?text=Hi! I want to enquire about your laptops.`}
                target="_blank"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1a1a1e] border border-[#2e2e35] text-white text-sm hover:border-[#c8f135] transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-6 mt-12 pt-12 border-t border-[#1a1a1e]">
            {stats.map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1a1a1e] flex items-center justify-center">
                  <Icon size={18} className="text-[#c8f135]" />
                </div>
                <div>
                  <div className="text-xl font-bold text-white font-mono">{value}</div>
                  <div className="text-xs text-[#9aa0aa]">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features bar */}
      <section className="border-y border-[#1a1a1e] bg-[#111113]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: Shield, text: '12-Month Warranty' },
              { icon: Truck, text: 'Fast Delivery Lagos' },
              { icon: Headphones, text: 'Tech Support' },
              { icon: Zap, text: 'Best Price Guarantee' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-sm text-[#9aa0aa]">
                <Icon size={15} className="text-[#c8f135] flex-shrink-0" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="max-w-7xl mx-auto px-4 py-12">
        {/* Section header + filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 style={{ fontFamily: 'Bebas Neue, sans-serif' }} className="text-3xl text-white tracking-wide">
              {searchQuery ? `Results for "${searchQuery}"` : activeCategory === 'All' ? 'All Laptops' : `${activeCategory} Laptops`}
            </h2>
            <p className="text-sm text-[#9aa0aa] mt-0.5">{filtered.length} product{filtered.length !== 1 ? 's' : ''}</p>
          </div>

          {/* Category filter */}
          <div id="categories" className="flex flex-wrap gap-1.5">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setSearchQuery('') }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeCategory === cat && !searchQuery
                    ? 'bg-[#c8f135] text-[#0a0a0b]'
                    : 'bg-[#111113] border border-[#2e2e35] text-[#9aa0aa] hover:text-white hover:border-[#3d3d47]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">💻</div>
            <h3 className="text-lg text-white mb-2">No laptops found</h3>
            <p className="text-[#9aa0aa] text-sm">Try a different category or search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((product, i) => (
              <ProductCard key={product.id} product={product} settings={settings} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* About section */}
      <section id="about" className="border-t border-[#1a1a1e] bg-[#111113]">
        <div className="max-w-7xl mx-auto px-4 py-14 text-center">
          <div className="w-12 h-12 bg-[#c8f135] rounded-xl flex items-center justify-center mx-auto mb-4">
            <Zap size={22} className="text-[#0a0a0b]" fill="currentColor" />
          </div>
          <h2 style={{ fontFamily: 'Bebas Neue, sans-serif' }} className="text-4xl text-white tracking-wide mb-3">
            Why {settings.storeName}?
          </h2>
          <p className="text-[#9aa0aa] max-w-lg mx-auto text-sm leading-relaxed">
            We source premium laptops directly, ensuring genuine products at competitive prices.
            Based in Awka, we offer fast local delivery and dedicated after-sales support.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1a1a1e] px-4 py-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#c8f135] rounded flex items-center justify-center">
              <Zap size={12} className="text-[#0a0a0b]" fill="currentColor" />
            </div>
            <span style={{ fontFamily: 'Bebas Neue, sans-serif' }} className="text-sm tracking-widest text-[#9aa0aa]">
              {settings.storeName}
            </span>
          </div>
          <p className="text-xs text-[#3d3d47]">© 2026 {settings.storeName}. All rights reserved.</p>
        </div>
      </footer>

      <FloatingSocials settings={settings} />
    </main>
  )
}
