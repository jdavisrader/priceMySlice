'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingBasket, BookOpen, ChefHat, History } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/ingredients', label: 'Ingredients', icon: ShoppingBasket },
  { href: '/recipes', label: 'Recipes', icon: BookOpen },
  { href: '/cakes/new', label: 'Price a Cake', icon: ChefHat },
  { href: '/cakes', label: 'Cake History', icon: History },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 shrink-0 border-r bg-white min-h-screen flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-base font-semibold tracking-tight">priceMySlice</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Cake cost calculator</p>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              pathname === href
                ? 'bg-zinc-100 text-zinc-900'
                : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
