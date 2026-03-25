import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'VoltTech — Premium Laptops',
  description: 'Premium laptops at unbeatable prices. Gaming, Business, Creator, Ultrabook and Budget laptops in Lagos.',
  keywords: 'laptops, gaming laptops, MacBook, Dell XPS, ASUS ROG, Lagos, Nigeria',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
