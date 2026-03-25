'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Zap, Package, Settings, Plus, Trash2, LogOut, Edit3,
  Eye, EyeOff, Upload, X, Check, ChevronLeft, Image, AlertCircle
} from 'lucide-react'
import { Product, StoreSettings, defaultSettings, sampleProducts } from '@/lib/store'

type AdminView = 'products' | 'add' | 'settings'

const categories = ['Gaming', 'Business', 'Creator', 'Budget', 'Ultrabook'] as const
const badges = ['', 'New', 'Hot', 'Sale', 'Limited'] as const

const emptyProduct = (): Omit<Product, 'id' | 'createdAt'> => ({
  name: '',
  price: 0,
  originalPrice: undefined,
  category: 'Business',
  brand: '',
  badge: undefined,
  specs: { processor: '', ram: '', storage: '', display: '', battery: '' },
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
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    try {
      const storedProducts = localStorage.getItem('vt_products')
      const storedSettings = localStorage.getItem('vt_settings')
      setProducts(storedProducts ? JSON.parse(storedProducts) : sampleProducts)
      if (storedSettings) setSettings(JSON.parse(storedSettings))
    } catch {
      setProducts(sampleProducts)
    }
  }, [])

  const saveProducts = (p: Product[]) => {
    setProducts(p)
    localStorage.setItem('vt_products', JSON.stringify(p))
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

  // Image upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const remaining = 4 - form.images.length
    if (remaining <= 0) return
    const toProcess = files.slice(0, remaining)

    toProcess.forEach(file => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const result = ev.target?.result as string
        setForm(prev => ({
          ...prev,
          images: [...prev.images, result].slice(0, 4)
        }))
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const removeImage = (idx: number) => {
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))
  }

  const handleSubmit = () => {
    if (!form.name || !form.price || !form.brand) return

    if (editId) {
      saveProducts(products.map(p => p.id === editId ? { ...form, id: editId, createdAt: p.createdAt } : p))
      setEditId(null)
    } else {
      const newProduct: Product = {
        ...form,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      }
      saveProducts([newProduct, ...products])
    }

    setForm(emptyProduct())
    setView('products')
    triggerSaved()
  }

  const handleEdit = (product: Product) => {
    setForm({
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      category: product.category,
      brand: product.brand,
      badge: product.badge,
      specs: { ...product.specs },
      images: [...product.images],
      inStock: product.inStock,
    })
    setEditId(product.id)
    setView('add')
  }

  const handleDelete = (id: string) => {
    saveProducts(products.filter(p => p.id !== id))
    setDeleteConfirm(null)
    triggerSaved()
  }

  const triggerSaved = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  // Login screen
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
              <button
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9aa0aa] hover:text-white"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {pwError && (
              <p className="text-xs text-red-400 flex items-center gap-1 mb-3">
                <AlertCircle size={12} /> Incorrect password
              </p>
            )}

            <button
              onClick={login}
              className="w-full py-3 rounded-xl bg-[#c8f135] text-[#0a0a0b] font-semibold text-sm hover:bg-[#d9f76a] transition-colors"
            >
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

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex">
      {/* Sidebar */}
      <aside className="w-56 bg-[#111113] border-r border-[#1a1a1e] flex flex-col fixed h-full z-20">
        <div className="p-4 border-b border-[#1a1a1e]">
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
              onClick={() => { setView(id); if (id !== 'add') { setForm(emptyProduct()); setEditId(null) } }}
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
            <Eye size={13} />
            View Store
          </Link>
          <button
            onClick={() => setAuthed(false)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[#9aa0aa] hover:text-red-400 transition-all"
          >
            <LogOut size={13} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="ml-56 flex-1 p-6">
        {/* Saved toast */}
        {saved && (
          <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-[#c8f135] text-[#0a0a0b] px-4 py-2 rounded-lg text-sm font-semibold shadow-lg">
            <Check size={14} /> Saved!
          </div>
        )}

        {/* ── Products List ── */}
        {view === 'products' && (
          <div>
            <div className="flex items-center justify-between mb-6">
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

            <div className="grid gap-3">
              {products.map(product => (
                <div key={product.id} className="bg-[#111113] border border-[#1a1a1e] rounded-xl p-4 flex items-center gap-4">
                  {/* Thumbnail */}
                  <div className="w-16 h-12 rounded-lg overflow-hidden bg-[#1a1a1e] flex-shrink-0">
                    {product.images[0] ? (
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full laptop-placeholder" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-white truncate">{product.name}</h3>
                      {product.badge && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-[#1a1a1e] text-[#9aa0aa]">{product.badge}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-[#9aa0aa]">{product.brand} · {product.category}</span>
                      <span className="text-xs font-mono text-[#c8f135]">
                        {settings.currency}{product.price.toLocaleString()}
                      </span>
                      <span className="text-xs text-[#9aa0aa]">
                        {product.images.length} photo{product.images.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
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
                          className="px-2 py-1 rounded-lg bg-red-500/20 text-red-400 text-xs hover:bg-red-500 hover:text-white transition-all"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-2 py-1 rounded-lg bg-[#1a1a1e] text-[#9aa0aa] text-xs hover:bg-[#2e2e35]"
                        >
                          Cancel
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
                  <button
                    onClick={() => setView('add')}
                    className="mt-3 text-[#c8f135] text-sm hover:underline"
                  >
                    Add your first product →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Add / Edit Product ── */}
        {view === 'add' && (
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
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

            <div className="space-y-5">
              {/* Image upload */}
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
                        <span className="absolute bottom-1 left-1 text-[9px] bg-[#c8f135] text-[#0a0a0b] px-1 rounded font-bold">
                          MAIN
                        </span>
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

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <p className="text-xs text-[#9aa0aa]">JPG, PNG or WEBP. First image is the main photo shown in grid.</p>
              </div>

              {/* Basic info */}
              <div className="bg-[#111113] border border-[#1a1a1e] rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-medium text-white">Product Info</h3>

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="text-xs text-[#9aa0aa] mb-1 block">Product Name *</label>
                    <input
                      value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. MacBook Pro 16 M3"
                      className="w-full input-dark rounded-lg px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-[#9aa0aa] mb-1 block">Brand *</label>
                    <input
                      value={form.brand}
                      onChange={e => setForm(p => ({ ...p, brand: e.target.value }))}
                      placeholder="Apple, Dell, ASUS..."
                      className="w-full input-dark rounded-lg px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-[#9aa0aa] mb-1 block">Category</label>
                    <select
                      value={form.category}
                      onChange={e => setForm(p => ({ ...p, category: e.target.value as any }))}
                      className="w-full input-dark rounded-lg px-3 py-2 text-sm"
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-[#9aa0aa] mb-1 block">Price ({settings.currency}) *</label>
                    <input
                      type="number"
                      value={form.price || ''}
                      onChange={e => setForm(p => ({ ...p, price: Number(e.target.value) }))}
                      placeholder="1200000"
                      className="w-full input-dark rounded-lg px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-[#9aa0aa] mb-1 block">Original Price (optional)</label>
                    <input
                      type="number"
                      value={form.originalPrice || ''}
                      onChange={e => setForm(p => ({ ...p, originalPrice: e.target.value ? Number(e.target.value) : undefined }))}
                      placeholder="Strike-through price"
                      className="w-full input-dark rounded-lg px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-[#9aa0aa] mb-1 block">Badge</label>
                    <select
                      value={form.badge || ''}
                      onChange={e => setForm(p => ({ ...p, badge: e.target.value as any || undefined }))}
                      className="w-full input-dark rounded-lg px-3 py-2 text-sm"
                    >
                      {badges.map(b => <option key={b} value={b}>{b || 'None'}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-[#9aa0aa] mb-1 block">Stock Status</label>
                    <select
                      value={form.inStock ? 'true' : 'false'}
                      onChange={e => setForm(p => ({ ...p, inStock: e.target.value === 'true' }))}
                      className="w-full input-dark rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="true">In Stock</option>
                      <option value="false">Out of Stock</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Specs */}
              <div className="bg-[#111113] border border-[#1a1a1e] rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-medium text-white">Specifications</h3>
                {[
                  { key: 'processor', label: 'Processor', placeholder: 'Intel Core i7-13700H' },
                  { key: 'ram', label: 'RAM', placeholder: '16GB DDR5' },
                  { key: 'storage', label: 'Storage', placeholder: '1TB NVMe SSD' },
                  { key: 'display', label: 'Display', placeholder: '15.6" 3.5K OLED' },
                  { key: 'battery', label: 'Battery Life', placeholder: '13-hour battery life' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="text-xs text-[#9aa0aa] mb-1 block">{label}</label>
                    <input
                      value={(form.specs as any)[key] || ''}
                      onChange={e => setForm(p => ({ ...p, specs: { ...p.specs, [key]: e.target.value } }))}
                      placeholder={placeholder}
                      className="w-full input-dark rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={handleSubmit}
                disabled={!form.name || !form.price || !form.brand}
                className="w-full py-3 rounded-xl bg-[#c8f135] text-[#0a0a0b] font-semibold text-sm hover:bg-[#d9f76a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {editId ? 'Save Changes' : 'Add Product'}
              </button>
            </div>
          </div>
        )}

        {/* ── Settings ── */}
        {view === 'settings' && (
          <div className="max-w-lg">
            <h1 className="text-2xl font-bold text-white mb-6">Store Settings</h1>

            <div className="space-y-4">
              <div className="bg-[#111113] border border-[#1a1a1e] rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-medium text-white">Branding</h3>
                {[
                  { key: 'storeName', label: 'Store Name', placeholder: 'VoltTech' },
                  { key: 'tagline', label: 'Tagline', placeholder: 'Premium Laptops...' },
                  { key: 'currency', label: 'Currency Symbol', placeholder: '₦' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="text-xs text-[#9aa0aa] mb-1 block">{label}</label>
                    <input
                      value={(settings as any)[key]}
                      onChange={e => setSettings(s => ({ ...s, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full input-dark rounded-lg px-3 py-2 text-sm"
                    />
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
                    <input
                      value={(settings as any)[key]}
                      onChange={e => setSettings(s => ({ ...s, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full input-dark rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                ))}
              </div>

              <div className="bg-[#111113] border border-[#1a1a1e] rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-medium text-white">Security</h3>
                <div>
                  <label className="text-xs text-[#9aa0aa] mb-1 block">Admin Password</label>
                  <input
                    type="password"
                    value={settings.adminPassword}
                    onChange={e => setSettings(s => ({ ...s, adminPassword: e.target.value }))}
                    placeholder="••••••••"
                    className="w-full input-dark rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <button
                onClick={() => { saveSettings(settings); triggerSaved() }}
                className="w-full py-3 rounded-xl bg-[#c8f135] text-[#0a0a0b] font-semibold text-sm hover:bg-[#d9f76a] transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
