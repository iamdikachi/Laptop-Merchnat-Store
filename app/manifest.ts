import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'VoltTech — Premium Laptops',
    short_name: 'VoltTech',
    description: 'Premium laptops at unbeatable prices. Gaming, Business, Creator, Ultrabook and Budget laptops in Lagos.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0b',
    theme_color: '#c8f135',
    icons: [
      {
        src: '/favicon.ico',
        sizes: '16x16 32x32 64x64',
        type: 'image/x-icon',
      },
    ],
  }
}
