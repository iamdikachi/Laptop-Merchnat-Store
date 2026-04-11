# E-Tech Gadgets Laptop Store — Next.js

A polished, dark-themed laptop storefront with admin panel. Built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

### Storefront
- 🖥️ Product grid with up to **4-image grids** per product
- 🔍 Search bar + category filter (Gaming, Business, Creator, Budget, Ultrabook)
- 📱 Click any product → full **gallery modal** with thumbnails + slider
- 🛒 **Order via WhatsApp, Instagram, Facebook** buttons on every card
- 💬 Floating social button (expandable with all 3 channels)
- ✨ Dark/industrial design: Bebas Neue font, volt-green accent, noise texture

### Admin Panel (`/admin`)
- 🔐 Password-protected login
- 📦 Product list with edit/delete
- ➕ Add/edit products with:
  - Up to **4 image uploads** (drag shown in preview grid)
  - Name, brand, category, price, original price (sale %), badge, stock status
  - Full specs: processor, RAM, storage, display, battery
- ⚙️ Settings: store name, tagline, currency, WhatsApp/Instagram/Facebook, admin password
- 💾 Persisted in `localStorage` (replace with DB for production)

## Setup

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000)

Admin panel: [http://localhost:3000/admin](http://localhost:3000/admin)  
Default password: `admin123`

## Production Database

Currently uses `localStorage`. To scale, replace the storage calls in:
- `app/page.tsx` — load products/settings
- `app/admin/page.tsx` — save products/settings

With a real DB like **Supabase** (recommended for Lagos/Africa latency), **MongoDB Atlas**, or **PlanetScale**.

## Deploy

Deploy to **Vercel** (zero config):
```bash
npx vercel
```

Or **Netlify**, **Railway**, or any Node.js host.
