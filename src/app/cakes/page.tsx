import { db } from '@/db'
import { cakes, recipes } from '@/db/schema'
import { desc, eq } from 'drizzle-orm'
import { CakesClient } from '@/components/cakes/cakes-client'

export default async function CakesPage() {
  const data = await db
    .select({
      id: cakes.id,
      name: cakes.name,
      servings: cakes.servings,
      totalCost: cakes.totalCost,
      finalPrice: cakes.finalPrice,
      suggestedPrice: cakes.suggestedPrice,
      createdAt: cakes.createdAt,
      recipeName: recipes.name,
    })
    .from(cakes)
    .leftJoin(recipes, eq(cakes.recipeId, recipes.id))
    .orderBy(desc(cakes.createdAt))

  return <CakesClient cakes={data} />
}
