'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Zap, Package, Settings, Plus, Trash2, LogOut, Edit3,
  Eye, EyeOff, Upload, X, Check, ChevronLeft, AlertCircle, Menu, Loader2
} from 'lucide-react'
import { Product, StoreSettings, defaultSettings } from '@/lib/store'

type AdminView = 'products' | 'add' | 'settings'

const categories = ['Gaming', 'Business', 'Creator', 'Budget', 'Ultrabook', 'Coding'] as const
const badges = ['', 'New', 'Hot', 'Sale', 'Limited'] as const

const emptyProduct = (): Omit<Product, 'id' | 'createdAt'> => ({
  name: '',
  price: 0,
  originalPrice: undefined,
  category: 'Business',
  brand: '',
  badge: undefined,
  specs: { processor: '', ram: '', storage: '', display: '', battery: '', graphics: '', features: '' },
  images: [],
  inStock: true,
})

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [pwError, setPwError] = useState(false)
  const [view, setView] = useState<AdminView>('products')
  const [products, setProducts] = useState<Product[]>([])
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings)
  const [form, setForm] = useState(emptyProduct())
  const [editId, setEditId] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [actionError, setActionError] = useState<{ title: string; message: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`/api/products?t=${Date.now()}`, { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          setProducts(data)
        }
      } catch (err) {
        console.error('Failed to load products', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()

    try {
      const storedSettings = localStorage.getItem('vt_settings')
      if (storedSettings) setSettings(JSON.parse(storedSettings))
    } catch {}
  }, [])

  const saveProducts = (p: Product[]) => {
    setProducts(p)
  }

  const saveSettings = (s: StoreSettings) => {
    setSettings(s)
    localStorage.setItem('vt_settings', JSON.stringify(s))
  }

  const login = () => {
    if (password === settings.adminPassword) {
      setAuthed(true)
      setPwError(false)
    } else {
      setPwError(true)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const remaining = 4 - form.images.length
    if (remaining <= 0) return
    files.slice(0, remaining).forEach(file => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const result = ev.target?.result as string
        setForm(prev => ({ ...prev, images: [...prev.images, result].slice(0, 4) }))
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const removeImage = (idx: number) => {
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))
  }

  const handleSubmit = async () => {
    if (!form.name || !form.price || !form.brand) return
    setIsSaving(true)

    const finalImages = await Promise.all(
      form.images.map(async (img) => {
        if (img.startsWith('http')) return img 
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            body: JSON.stringify({ file: img }),
          })
          const data = await res.json()
          return data.url || img
        } catch (err) {
          console.error('Upload failed', err)
          return img
        }
      })
    )

    const productPayload = { ...form, images: finalImages.filter(Boolean) }

    if (editId) {
      const existing = products.find(p => p.id === editId)
      const updatedProduct = { ...productPayload, id: editId, createdAt: existing?.createdAt || new Date().toISOString() }
      try {
        const res = await fetch('/api/products', { method: 'PUT', body: JSON.stringify(updatedProduct) })
        if (!res.ok) {
          const errData = await res.json()
          throw new Error(errData.error || 'Failed to update product')
        }
        setProducts(products.map(p => p.id === editId ? updatedProduct : p))
        setEditId(null)
      } catch (err: any) {
        setActionError({ title: 'Update Failed', message: err.message })
        setIsSaving(false)
        return
      }
    } else {
      const newProduct = { ...productPayload, id: `prod_${Date.now()}`, createdAt: new Date().toISOString() }
      try {
        const res = await fetch('/api/products', { method: 'POST', body: JSON.stringify(newProduct) })
        if (!res.ok) {
          const errData = await res.json()
          throw new Error(errData.error || 'Failed to save product')
        }
        setProducts([newProduct, ...products])
      } catch (err: any) {
        setActionError({ title: 'Save Failed', message: err.message })
        setIsSaving(false)
        return
      }
    }
    setForm(emptyProduct())
    setView('products')
    triggerSaved()
    setIsSaving(false)
  }

  const handleEdit = (product: Product) => {
    setForm({
      name: product.name, price: product.price, originalPrice: product.originalPrice,
      category: product.category, brand: product.brand, badge: product.badge,
      specs: { ...product.specs }, images: [...product.images], inStock: product.inStock,
    })
    setEditId(product.id)
    setView('add')
    setSidebarOpen(false)
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/products?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to delete on server')
      }
      setProducts(products.filter(p => p.id !== id))
      setDeleteConfirm(null)
      triggerSaved()
    } catch (err: any) {
      console.error(err)
      setActionError({ title: 'Deletion Failed', message: err.message || "Failed to delete product. Please try again." })
    }
  }

  const triggerSaved = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const navigateTo = (v: AdminView) => {
    setView(v)
    setSidebarOpen(false)
    if (v !== 'add') { setForm(emptyProduct()); setEditId(null) }
  }

  // ── Login ──
  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 justify-center mb-8">
            <div className="w-10 h-10 bg-[#c8f135] rounded-xl flex items-center justify-center">
              <Zap size={20} className="text-[#0a0a0b]" fill="currentColor" />
            </div>
            <span style={{ fontFamily: 'Bebas Neue, sans-serif' }} className="text-2xl tracking-widest text-white">
              Admin
            </span>
          </div>
          <div className="bg-[#111113] border border-[#1a1a1e] rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-1">Welcome back</h2>
            <p className="text-sm text-[#9aa0aa] mb-6">Enter your admin password to continue</p>
            <div className="relative mb-3">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setPwError(false) }}
                onKeyDown={e => e.key === 'Enter' && login()}
                placeholder="Password"
                className={`w-full input-dark rounded-xl px-4 py-3 pr-12 text-sm ${pwError ? 'border-red-500' : ''}`}
              />
              <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9aa0aa] hover:text-white">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {pwError && (
              <p className="text-xs text-red-400 flex items-center gap-1 mb-3">
                <AlertCircle size={12} /> Incorrect password
              </p>
            )}
            <button onClick={login} className="w-full py-3 rounded-xl bg-[#c8f135] text-[#0a0a0b] font-semibold text-sm hover:bg-[#d9f76a] transition-colors">
              Login
            </button>
            <div className="mt-4 pt-4 border-t border-[#1a1a1e]">
              <Link href="/" className="text-xs text-[#9aa0aa] hover:text-white flex items-center gap-1 justify-center">
                <ChevronLeft size={12} /> Back to store
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-[#1a1a1e] border border-[#2e2e35] rounded-2xl flex items-center justify-center mb-6 animate-pulse">
          <Zap size={24} className="text-[#c8f135]" fill="currentColor" />
        </div>
        <h2 style={{ fontFamily: 'Bebas Neue, sans-serif' }} className="text-2xl text-white tracking-widest animate-pulse">
          Loading Admin Panel
        </h2>
        <p className="text-sm text-[#9aa0aa] mt-2">Checking secure connection...</p>
      </div>
    )
  }

  // ── Sidebar content (reused in both desktop + mobile drawer) ──
  const SidebarContent = () => (
    <>
      <div className="p-4 border-b border-[#1a1a1e] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#c8f135] rounded-lg flex items-center justify-center">
            <Zap size={14} className="text-[#0a0a0b]" fill="currentColor" />
          </div>
          <div>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif' }} className="text-sm tracking-wider text-white leading-none">
              {settings.storeName}
            </div>
            <div className="text-xs text-[#9aa0aa]">Admin Panel</div>
          </div>
        </div>
        <button onClick={() => setSidebarOpen(false)} className="md:hidden text-[#9aa0aa] hover:text-white p-1">
          <X size={18} />
        </button>
      </div>

      <nav className="p-3 flex-1">
        <p className="text-[10px] text-[#3d3d47] uppercase tracking-widest px-3 mb-2">Menu</p>
        {[
          { id: 'products' as const, icon: Package, label: 'Products', count: products.length },
          { id: 'add' as const, icon: Plus, label: editId ? 'Edit Product' : 'Add Product' },
          { id: 'settings' as const, icon: Settings, label: 'Settings' },
        ].map(({ id, icon: Icon, label, count }) => (
          <button
            key={id}
            onClick={() => navigateTo(id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm mb-1 transition-all admin-nav-item ${
              view === id ? 'active' : 'text-[#9aa0aa] hover:text-white hover:bg-[#1a1a1e]'
            }`}
          >
            <Icon size={15} />
            {label}
            {count !== undefined && (
              <span className="ml-auto text-xs bg-[#1a1a1e] px-1.5 py-0.5 rounded text-[#9aa0aa]">{count}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-[#1a1a1e] space-y-1">
        <Link href="/" className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[#9aa0aa] hover:text-white hover:bg-[#1a1a1e] transition-all">
          <Eye size={13} /> View Store
        </Link>
        <button onClick={() => setAuthed(false)} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[#9aa0aa] hover:text-red-400 transition-all">
          <LogOut size={13} /> Sign out
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex">

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 bg-[#111113] border-r border-[#1a1a1e] flex-col fixed h-full z-20">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <aside className={`md:hidden fixed top-0 left-0 h-full w-64 bg-[#111113] border-r border-[#1a1a1e] flex flex-col z-40 transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <SidebarContent />
      </aside>

      {/* Content area */}
      <div className="flex-1 md:ml-56 min-w-0 flex flex-col">

        {/* Mobile top bar */}
        <div className="md:hidden sticky top-0 z-20 bg-[#111113] border-b border-[#1a1a1e] px-4 h-14 flex items-center justify-between flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#1a1a1e] text-[#9aa0aa]"
          >
            <Menu size={18} />
          </button>
          <span style={{ fontFamily: 'Bebas Neue, sans-serif' }} className="text-base tracking-widest text-white">
            {view === 'products' ? 'Products' : view === 'add' ? (editId ? 'Edit Product' : 'Add Product') : 'Settings'}
          </span>
          {view === 'products' ? (
            <button
              onClick={() => { setForm(emptyProduct()); setEditId(null); setView('add') }}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#c8f135] text-[#0a0a0b]"
            >
              <Plus size={18} />
            </button>
          ) : (
            <div className="w-9" />
          )}
        </div>

        <div className="p-4 md:p-6 flex-1">
          {/* Toast */}
          {saved && (
            <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-[#c8f135] text-[#0a0a0b] px-4 py-2 rounded-lg text-sm font-semibold shadow-lg">
              <Check size={14} /> Saved!
            </div>
          )}

          {/* ── Products ── */}
          {view === 'products' && (
            <div>
              <div className="hidden md:flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-white">Products</h1>
                  <p className="text-sm text-[#9aa0aa]">{products.length} items in store</p>
                </div>
                <button
                  onClick={() => { setForm(emptyProduct()); setEditId(null); setView('add') }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#c8f135] text-[#0a0a0b] text-sm font-semibold hover:bg-[#d9f76a] transition-colors"
                >
                  <Plus size={15} /> Add Product
                </button>
              </div>
              <p className="md:hidden text-xs text-[#9aa0aa] mb-4">{products.length} items in store</p>

              <div className="grid gap-2.5">
                {products.map(product => (
                  <div key={product.id} className="bg-[#111113] border border-[#1a1a1e] rounded-xl p-3 sm:p-4 flex items-center gap-3">
                    <div className="w-14 h-10 sm:w-16 sm:h-12 rounded-lg overflow-hidden bg-[#1a1a1e] flex-shrink-0">
                      {product.images[0] ? (
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full laptop-placeholder" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-sm font-semibold text-white truncate">{product.name}</h3>
                        {product.badge && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1a1a1e] text-[#9aa0aa] flex-shrink-0">{product.badge}</span>
                        )}
                      </div>
                      {/* Desktop meta */}
                      <div className="hidden sm:flex items-center gap-3 mt-0.5 flex-wrap">
                        <span className="text-xs text-[#9aa0aa]">{product.brand} · {product.category}</span>
                        <span className="text-xs font-mono text-[#c8f135]">{settings.currency}{product.price.toLocaleString()}</span>
                        <span className="text-xs text-[#9aa0aa]">{product.images.length} photo{product.images.length !== 1 ? 's' : ''}</span>
                      </div>
                      {/* Mobile meta */}
                      <div className="sm:hidden mt-0.5">
                        <span className="text-xs font-mono text-[#c8f135]">{settings.currency}{product.price.toLocaleString()}</span>
                        <span className="text-xs text-[#9aa0aa] ml-2">{product.brand}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(product)}
                        className="w-8 h-8 rounded-lg bg-[#1a1a1e] flex items-center justify-center text-[#9aa0aa] hover:text-white hover:bg-[#2e2e35] transition-all"
                      >
                        <Edit3 size={13} />
                      </button>
                      {deleteConfirm === product.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="px-2 py-1 rounded-lg bg-red-500/20 text-red-400 text-xs hover:bg-red-500 hover:text-white transition-all whitespace-nowrap"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="w-7 h-7 rounded-lg bg-[#1a1a1e] flex items-center justify-center text-[#9aa0aa] hover:bg-[#2e2e35]"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(product.id)}
                          className="w-8 h-8 rounded-lg bg-[#1a1a1e] flex items-center justify-center text-[#9aa0aa] hover:text-red-400 hover:bg-red-500/10 transition-all"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {products.length === 0 && (
                  <div className="text-center py-16 border border-dashed border-[#2e2e35] rounded-xl">
                    <Package size={32} className="mx-auto text-[#3d3d47] mb-3" />
                    <p className="text-[#9aa0aa] text-sm">No products yet</p>
                    <button onClick={() => setView('add')} className="mt-3 text-[#c8f135] text-sm hover:underline">
                      Add your first product →
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Add / Edit ── */}
          {view === 'add' && (
            <div className="max-w-2xl mx-auto">
              {/* Desktop header */}
              <div className="hidden md:flex items-center gap-3 mb-6">
                <button
                  onClick={() => { setView('products'); setForm(emptyProduct()); setEditId(null) }}
                  className="w-8 h-8 rounded-lg bg-[#1a1a1e] flex items-center justify-center text-[#9aa0aa] hover:text-white"
                >
                  <ChevronLeft size={16} />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-white">{editId ? 'Edit Product' : 'Add Product'}</h1>
                  <p className="text-sm text-[#9aa0aa]">Up to 4 product photos</p>
                </div>
              </div>
              {/* Mobile back */}
              <button
                onClick={() => { setView('products'); setForm(emptyProduct()); setEditId(null) }}
                className="md:hidden flex items-center gap-1.5 text-sm text-[#9aa0aa] hover:text-white mb-4"
              >
                <ChevronLeft size={14} /> Back to products
              </button>

              <div className="space-y-4">
                {/* Images */}
                <div className="bg-[#111113] border border-[#1a1a1e] rounded-xl p-4">
                  <label className="text-sm font-medium text-white mb-3 block">
                    Product Photos ({form.images.length}/4)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                    {form.images.map((img, i) => (
                      <div key={i} className="relative aspect-video rounded-lg overflow-hidden bg-[#1a1a1e]">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center text-white hover:bg-red-500 transition-colors"
                        >
                          <X size={10} />
                        </button>
                        {i === 0 && (
                          <span className="absolute bottom-1 left-1 text-[9px] bg-[#c8f135] text-[#0a0a0b] px-1 rounded font-bold">MAIN</span>
                        )}
                      </div>
                    ))}
                    {form.images.length < 4 && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-video rounded-lg border-2 border-dashed border-[#2e2e35] hover:border-[#c8f135] flex flex-col items-center justify-center gap-1 text-[#9aa0aa] hover:text-[#c8f135] transition-all"
                      >
                        <Upload size={16} />
                        <span className="text-xs">Upload</span>
                      </button>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                  <p className="text-xs text-[#9aa0aa]">JPG, PNG or WEBP. First image is the main photo.</p>
                </div>

                {/* Info */}
                <div className="bg-[#111113] border border-[#1a1a1e] rounded-xl p-4 space-y-3">
                  <h3 className="text-sm font-medium text-white">Product Info</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-xs text-[#9aa0aa] mb-1 block">Product Name *</label>
                      <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. MacBook Pro 16 M3" className="w-full input-dark rounded-lg px-3 py-2.5 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-[#9aa0aa] mb-1 block">Brand *</label>
                      <input value={form.brand} onChange={e => setForm(p => ({ ...p, brand: e.target.value }))} placeholder="Apple, Dell, ASUS..." className="w-full input-dark rounded-lg px-3 py-2.5 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-[#9aa0aa] mb-1 block">Category</label>
                      <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value as any }))} className="w-full input-dark rounded-lg px-3 py-2.5 text-sm">
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-[#9aa0aa] mb-1 block">Price ({settings.currency}) *</label>
                      <input type="number" value={form.price || ''} onChange={e => setForm(p => ({ ...p, price: Number(e.target.value) }))} placeholder="1200000" className="w-full input-dark rounded-lg px-3 py-2.5 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-[#9aa0aa] mb-1 block">Original Price (optional)</label>
                      <input type="number" value={form.originalPrice || ''} onChange={e => setForm(p => ({ ...p, originalPrice: e.target.value ? Number(e.target.value) : undefined }))} placeholder="Strike-through price" className="w-full input-dark rounded-lg px-3 py-2.5 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-[#9aa0aa] mb-1 block">Badge</label>
                      <select value={form.badge || ''} onChange={e => setForm(p => ({ ...p, badge: e.target.value as any || undefined }))} className="w-full input-dark rounded-lg px-3 py-2.5 text-sm">
                        {badges.map(b => <option key={b} value={b}>{b || 'None'}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-[#9aa0aa] mb-1 block">Stock Status</label>
                      <select value={form.inStock ? 'true' : 'false'} onChange={e => setForm(p => ({ ...p, inStock: e.target.value === 'true' }))} className="w-full input-dark rounded-lg px-3 py-2.5 text-sm">
                        <option value="true">In Stock</option>
                        <option value="false">Out of Stock</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Specs */}
                <div className="bg-[#111113] border border-[#1a1a1e] rounded-xl p-4 space-y-3">
                  <h3 className="text-sm font-medium text-white">Specifications</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { key: 'processor', label: 'Processor', placeholder: 'Intel Core i7-13700H' },
                      { key: 'ram', label: 'RAM', placeholder: '16GB DDR5' },
                      { key: 'storage', label: 'Storage', placeholder: '1TB NVMe SSD' },
                      { key: 'display', label: 'Display', placeholder: '15.6" 3.5K OLED' },
                      { key: 'battery', label: 'Battery Life', placeholder: '13-hour battery life' },
                      { key: 'graphics', label: 'Graphics', placeholder: 'GTX 1060 6GB dedicated graphics' },
                      { key: 'features', label: 'Features', placeholder: 'Backlit keyboard, webcam, Wi-Fi' },
                    ].map(({ key, label, placeholder }) => (
                      <div key={key}>
                        <label className="text-xs text-[#9aa0aa] mb-1 block">{label}</label>
                        <input
                          value={(form.specs as any)[key] || ''}
                          onChange={e => setForm(p => ({ ...p, specs: { ...p.specs, [key]: e.target.value } }))}
                          placeholder={placeholder}
                          className="w-full input-dark rounded-lg px-3 py-2.5 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!form.name || !form.price || !form.brand || isSaving}
                  className="w-full py-3.5 rounded-xl bg-[#c8f135] text-[#0a0a0b] font-semibold text-sm hover:bg-[#d9f76a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isSaving && <Loader2 size={16} className="animate-spin" />}
                  {editId ? (isSaving ? 'Saving...' : 'Save Changes') : (isSaving ? 'Adding...' : 'Add Product')}
                </button>
              </div>
            </div>
          )}

          {/* ── Settings ── */}
          {view === 'settings' && (
            <div className="max-w-lg mx-auto">
              <h1 className="hidden md:block text-2xl font-bold text-white mb-6">Store Settings</h1>
              <div className="space-y-4">
                <div className="bg-[#111113] border border-[#1a1a1e] rounded-xl p-4 space-y-3">
                  <h3 className="text-sm font-medium text-white">Branding</h3>
                  {[
                    { key: 'storeName', label: 'Store Name', placeholder: 'E-Tech Gadgets' },
                    { key: 'tagline', label: 'Tagline', placeholder: 'Premium Laptops...' },
                    { key: 'currency', label: 'Currency Symbol', placeholder: '₦' },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label className="text-xs text-[#9aa0aa] mb-1 block">{label}</label>
                      <input value={(settings as any)[key]} onChange={e => setSettings(s => ({ ...s, [key]: e.target.value }))} placeholder={placeholder} className="w-full input-dark rounded-lg px-3 py-2.5 text-sm" />
                    </div>
                  ))}
                </div>

                <div className="bg-[#111113] border border-[#1a1a1e] rounded-xl p-4 space-y-3">
                  <h3 className="text-sm font-medium text-white">Contact Channels</h3>
                  {[
                    { key: 'whatsapp', label: 'WhatsApp Number', placeholder: '+2348000000000' },
                    { key: 'instagram', label: 'Instagram Handle', placeholder: 'volttech_laptops' },
                    { key: 'facebook', label: 'Facebook Page', placeholder: 'volttechlaptops' },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label className="text-xs text-[#9aa0aa] mb-1 block">{label}</label>
                      <input value={(settings as any)[key]} onChange={e => setSettings(s => ({ ...s, [key]: e.target.value }))} placeholder={placeholder} className="w-full input-dark rounded-lg px-3 py-2.5 text-sm" />
                    </div>
                  ))}
                </div>

                <div className="bg-[#111113] border border-[#1a1a1e] rounded-xl p-4 space-y-3">
                  <h3 className="text-sm font-medium text-white">Security</h3>
                  <div>
                    <label className="text-xs text-[#9aa0aa] mb-1 block">Admin Password</label>
                    <input type="password" value={settings.adminPassword} onChange={e => setSettings(s => ({ ...s, adminPassword: e.target.value }))} placeholder="••••••••" className="w-full input-dark rounded-lg px-3 py-2.5 text-sm" />
                  </div>
                </div>

                <button
                  onClick={() => { saveSettings(settings); triggerSaved() }}
                  className="w-full py-3.5 rounded-xl bg-[#c8f135] text-[#0a0a0b] font-semibold text-sm hover:bg-[#d9f76a] transition-colors"
                >
                  Save Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Error Modal */}
      {actionError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-[#111113] border border-[#1a1a1e] rounded-2xl p-6 w-full max-w-sm text-center">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={24} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{actionError.title}</h3>
            <p className="text-sm text-[#9aa0aa] mb-6">{actionError.message}</p>
            <button
              onClick={() => setActionError(null)}
              className="w-full py-3 rounded-xl bg-[#1a1a1e] text-white font-semibold text-sm hover:bg-[#2e2e35] transition-colors"
            >
              Okay
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
