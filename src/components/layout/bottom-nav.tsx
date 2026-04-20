'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingBasket, BookOpen, ChefHat, History } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/ingredients', label: 'Ingredients', icon: ShoppingBasket },
  { href: '/recipes', label: 'Recipes', icon: BookOpen },
  { href: '/cakes/new', label: 'New Cake', icon: ChefHat },
  { href: '/cakes', label: 'History', icon: History },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="shrink-0 bg-white border-t md:hidden">
      <div className="flex justify-around">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center gap-1 px-2 py-3 text-[10px] font-medium transition-colors flex-1',
              pathname === href
                ? 'text-zinc-900'
                : 'text-zinc-400 hover:text-zinc-700'
            )}
          >
            <Icon className={cn('h-5 w-5', pathname === href && 'text-zinc-900')} />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
