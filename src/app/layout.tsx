import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/layout/sidebar'

const outfit = Outfit({
  variable: '--font-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'priceMySlice',
  description: 'Cake cost calculator',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${outfit.variable} h-full antialiased`}>
      <body className="min-h-full flex bg-zinc-50">
        <Sidebar />
        <main className="flex-1 p-8 min-h-screen">{children}</main>
      </body>
    </html>
  )
}
