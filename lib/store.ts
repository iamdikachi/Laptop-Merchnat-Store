// lib/store.ts
// In-memory store with localStorage persistence for demo
// In production, replace with a real database (Supabase, MongoDB, etc.)

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: 'Gaming' | 'Business' | 'Creator' | 'Budget' | 'Ultrabook';
  brand: string;
  badge?: 'New' | 'Hot' | 'Sale' | 'Limited';
  specs: {
    processor: string;
    ram: string;
    storage: string;
    display: string;
    battery?: string;
  };
  images: string[]; // up to 4 image URLs/base64
  inStock: boolean;
  createdAt: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  adminPassword: string;
  currency: string;
  accentColor: string;
}

export const defaultSettings: StoreSettings = {
  storeName: 'E-Tech Gadgets',
  tagline: 'Premium Laptops. Unbeatable Prices.',
  whatsapp: '+2349066846864',
  instagram: '@iamdikachi',
  facebook: '@iamdikachukwu',
  adminPassword: 'admin123',
  currency: '₦',
  accentColor: '#c8f135',
};

export const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'MacBook Pro 16" M3 Pro',
    price: 2850000,
    originalPrice: 3100000,
    category: 'Creator',
    brand: 'Apple',
    badge: 'Hot',
    specs: {
      processor: 'Apple M3 Pro 12-core',
      ram: '18GB Unified Memory',
      storage: '512GB SSD',
      display: '16.2" Liquid Retina XDR',
      battery: '22-hour battery life',
    },
    images: [],
    inStock: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Dell XPS 15 OLED',
    price: 1950000,
    category: 'Business',
    brand: 'Dell',
    badge: 'New',
    specs: {
      processor: 'Intel Core i7-13700H',
      ram: '16GB DDR5',
      storage: '1TB NVMe SSD',
      display: '15.6" 3.5K OLED Touch',
      battery: '13-hour battery life',
    },
    images: [],
    inStock: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'ASUS ROG Zephyrus G14',
    price: 1650000,
    category: 'Gaming',
    brand: 'ASUS',
    badge: 'Hot',
    specs: {
      processor: 'AMD Ryzen 9 7940HS',
      ram: '16GB DDR5',
      storage: '1TB SSD',
      display: '14" 2.5K 165Hz',
      battery: '10-hour battery life',
    },
    images: [],
    inStock: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Lenovo ThinkPad X1 Carbon',
    price: 1480000,
    category: 'Business',
    brand: 'Lenovo',
    specs: {
      processor: 'Intel Core i7-1365U',
      ram: '16GB LPDDR5',
      storage: '512GB SSD',
      display: '14" 2.8K OLED',
      battery: '15-hour battery life',
    },
    images: [],
    inStock: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'HP Spectre x360 14',
    price: 1320000,
    category: 'Ultrabook',
    brand: 'HP',
    badge: 'Sale',
    specs: {
      processor: 'Intel Core Ultra 7 155H',
      ram: '16GB LPDDR5x',
      storage: '1TB SSD',
      display: '14" 2.8K OLED 120Hz',
      battery: '17-hour battery life',
    },
    images: [],
    inStock: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '6',
    name: 'Acer Nitro 5 Gaming',
    price: 720000,
    category: 'Budget',
    brand: 'Acer',
    specs: {
      processor: 'Intel Core i5-13420H',
      ram: '8GB DDR5',
      storage: '512GB SSD',
      display: '15.6" FHD 144Hz',
      battery: '8-hour battery life',
    },
    images: [],
    inStock: true,
    createdAt: new Date().toISOString(),
  },
];
