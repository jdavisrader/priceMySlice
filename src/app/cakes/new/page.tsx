import Link from 'next/link'
import { db } from '@/db'
import { recipes, recipeIngredients, ingredients } from '@/db/schema'
import { eq, asc } from 'drizzle-orm'
import { CakeCalculator, type RecipeOption } from '@/components/cakes/cake-calculator'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default async function NewCakePage() {
  const allRecipes = await db.select().from(recipes).orderBy(asc(recipes.name))

  const allRecipeIngredients = await db
    .select({
      recipeId: recipeIngredients.recipeId,
      ingredientName: ingredients.name,
      quantity: recipeIngredients.quantity,
      unit: recipeIngredients.unit,
      pricePerBaseUnit: ingredients.pricePerBaseUnit,
      baseUnit: ingredients.baseUnit,
      section: recipeIngredients.section,
      sortOrder: recipeIngredients.sortOrder,
    })
    .from(recipeIngredients)
    .innerJoin(ingredients, eq(recipeIngredients.ingredientId, ingredients.id))
    .orderBy(asc(recipeIngredients.sortOrder))

  const recipeOptions: RecipeOption[] = allRecipes.map((r) => ({
    id: r.id,
    name: r.name,
    servings: r.servings,
    ingredients: allRecipeIngredients.filter((ri) => ri.recipeId === r.id),
  }))

  if (recipeOptions.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Price a Cake</h2>
        <div className="mt-8 rounded-lg border border-dashed p-12 text-center max-w-md">
          <p className="text-sm text-muted-foreground">You need at least one recipe before pricing a cake.</p>
          <Link href="/recipes/new" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'mt-4')}>
            Create a recipe
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">Price a Cake</h2>
        <p className="text-sm text-muted-foreground mt-1">Select a recipe to calculate ingredient costs.</p>
      </div>
      <CakeCalculator recipeOptions={recipeOptions} />
    </div>
  )
}
