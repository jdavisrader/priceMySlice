import Link from 'next/link'
import { ChefHat, ShoppingBasket, BookOpen } from 'lucide-react'
import { db } from '@/db'
import { cakes, ingredients, recipes } from '@/db/schema'
import { desc, count, eq } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default async function DashboardPage() {
  const [[cakeCount], [ingredientCount], [recipeCount], recentCakes] = await Promise.all([
    db.select({ count: count() }).from(cakes),
    db.select({ count: count() }).from(ingredients),
    db.select({ count: count() }).from(recipes),
    db
      .select({
        id: cakes.id,
        name: cakes.name,
        finalPrice: cakes.finalPrice,
        suggestedPrice: cakes.suggestedPrice,
        createdAt: cakes.createdAt,
        recipeName: recipes.name,
      })
      .from(cakes)
      .leftJoin(recipes, eq(cakes.recipeId, recipes.id))
      .orderBy(desc(cakes.createdAt))
      .limit(5),
  ])

  const stats = [
    { label: 'Cakes priced', value: cakeCount.count, icon: ChefHat, href: '/cakes' },
    { label: 'Ingredients', value: ingredientCount.count, icon: ShoppingBasket, href: '/ingredients' },
    { label: 'Recipes', value: recipeCount.count, icon: BookOpen, href: '/recipes' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
        <p className="text-sm text-muted-foreground mt-1">Welcome back. Here&apos;s your overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href}>
            <Card className="hover:ring-foreground/20 transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-1">
                <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold tracking-tight">{value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Recent cakes</h3>
        <Link href="/cakes" className="text-xs text-muted-foreground hover:underline underline-offset-4">
          View all →
        </Link>
      </div>

      {recentCakes.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <p className="text-sm text-muted-foreground">No cakes priced yet.</p>
          <Link href="/cakes/new" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'mt-4')}>
            Price your first cake
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border bg-white divide-y">
          {recentCakes.map((cake) => (
            <Link
              key={cake.id}
              href={`/cakes/${cake.id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-zinc-50 transition-colors"
            >
              <div>
                <p className="text-sm font-medium">{cake.name}</p>
                {cake.recipeName && (
                  <p className="text-xs text-muted-foreground">{cake.recipeName}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">
                  ${parseFloat(cake.finalPrice ?? cake.suggestedPrice).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(cake.createdAt).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
