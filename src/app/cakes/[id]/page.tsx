import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/db'
import { cakes, cakeIngredientSnapshots, recipes } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

export default async function CakeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cakeId = parseInt(id)

  const [cakeRows, snapshots] = await Promise.all([
    db
      .select({ cake: cakes, recipeName: recipes.name })
      .from(cakes)
      .leftJoin(recipes, eq(cakes.recipeId, recipes.id))
      .where(eq(cakes.id, cakeId))
      .limit(1),
    db.select().from(cakeIngredientSnapshots).where(eq(cakeIngredientSnapshots.cakeId, cakeId)),
  ])

  if (cakeRows.length === 0) notFound()

  const { cake, recipeName } = cakeRows[0]
  const finalPrice = parseFloat(cake.finalPrice ?? cake.suggestedPrice)

  return (
    <div className="max-w-2xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{cake.name}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {recipeName ? `Recipe: ${recipeName} · ` : ''}
            {cake.servings} servings · {new Date(cake.createdAt).toLocaleDateString()}
          </p>
        </div>
        <Link href="/cakes" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
          ← Back
        </Link>
      </div>

      {snapshots.length > 0 && (
        <>
          <p className="text-sm font-medium mb-2">Ingredient cost</p>
          <div className="rounded-md border bg-white divide-y text-sm mb-6">
            {snapshots.map((s) => {
              const qtyLabel = `${parseFloat(s.quantity) % 1 === 0 ? parseFloat(s.quantity) : parseFloat(s.quantity).toFixed(2)} ${s.unit}`
              return (
                <div key={s.id} className="flex items-center gap-3 px-3 py-2">
                  <span className="font-medium flex-1 min-w-0 truncate" title={s.ingredientName}>{s.ingredientName}</span>
                  <span className="text-muted-foreground w-28 shrink-0 truncate text-right" title={qtyLabel}>{qtyLabel}</span>
                  <span className="w-24 shrink-0 text-right tabular-nums">${parseFloat(s.lineTotal).toFixed(4)}</span>
                </div>
              )
            })}
            <div className="flex justify-between px-3 py-2 font-medium bg-zinc-50">
              <span>Ingredient total</span>
              <span>${parseFloat(cake.totalIngredientCost).toFixed(2)}</span>
            </div>
          </div>
        </>
      )}

      <p className="text-sm font-medium mb-2">Overhead</p>
      <div className="rounded-md border bg-white divide-y text-sm mb-6">
        <div className="flex justify-between px-3 py-2">
          <span className="text-muted-foreground">Labor</span>
          <span>${parseFloat(cake.laborCost).toFixed(2)}</span>
        </div>
        <div className="flex justify-between px-3 py-2">
          <span className="text-muted-foreground">Packaging</span>
          <span>${parseFloat(cake.packagingCost).toFixed(2)}</span>
        </div>
      </div>

      <p className="text-sm font-medium mb-2">Pricing</p>
      <div className="rounded-md border bg-white divide-y text-sm">
        <div className="flex justify-between px-3 py-2">
          <span className="text-muted-foreground">Total cost</span>
          <span>${parseFloat(cake.totalCost).toFixed(2)}</span>
        </div>
        <div className="flex justify-between px-3 py-2">
          <span className="text-muted-foreground">Markup</span>
          <span>{parseFloat(cake.markupMultiplier).toFixed(1)}×</span>
        </div>
        <div className="flex justify-between px-3 py-2">
          <span className="text-muted-foreground">Suggested price</span>
          <span>${parseFloat(cake.suggestedPrice).toFixed(2)}</span>
        </div>
        <div className="flex justify-between px-3 py-2 font-semibold text-base">
          <span>Final price</span>
          <span>${finalPrice.toFixed(2)}</span>
        </div>
      </div>

      {cake.notes && (
        <>
          <Separator className="my-6" />
          <p className="text-sm font-medium mb-1">Notes</p>
          <p className="text-sm text-muted-foreground">{cake.notes}</p>
        </>
      )}
    </div>
  )
}
