import { notFound } from 'next/navigation'
import { db } from '@/db'
import { recipes, recipeIngredients, ingredients } from '@/db/schema'
import { eq, asc } from 'drizzle-orm'
import { RecipeDetail } from '@/components/recipes/recipe-detail'
import { convertToBaseUnitsWithDensity, needsCrossDimension } from '@/lib/units'
import { resolveIngredientDensity } from '@/lib/densities'

export default async function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const recipeId = parseInt(id)

  const [recipeRows, ingredientRows] = await Promise.all([
    db.select().from(recipes).where(eq(recipes.id, recipeId)).limit(1),
    db
      .select({
        ingredientName: ingredients.name,
        gPerMl: ingredients.gPerMl,
        quantity: recipeIngredients.quantity,
        unit: recipeIngredients.unit,
        section: recipeIngredients.section,
        sortOrder: recipeIngredients.sortOrder,
        pricePerBaseUnit: ingredients.pricePerBaseUnit,
        baseUnit: ingredients.baseUnit,
      })
      .from(recipeIngredients)
      .innerJoin(ingredients, eq(recipeIngredients.ingredientId, ingredients.id))
      .where(eq(recipeIngredients.recipeId, recipeId))
      .orderBy(asc(recipeIngredients.sortOrder)),
  ])

  if (recipeRows.length === 0) notFound()

  const recipe = recipeRows[0]

  let ingredientTotal = 0
  const lineItems = ingredientRows.map((row) => {
    const qty = parseFloat(row.quantity)
    const pricePerBase = parseFloat(row.pricePerBaseUnit)
    const crossDim = needsCrossDimension(row.unit, row.baseUnit)
    const density = crossDim ? resolveIngredientDensity({ name: row.ingredientName, gPerMl: row.gPerMl }) : null
    const conversionError = crossDim && density === null

    let lineTotal = 0
    if (!conversionError) {
      const baseQty = convertToBaseUnitsWithDensity(qty, row.unit, row.baseUnit, density)
      lineTotal = baseQty * pricePerBase
      ingredientTotal += lineTotal
    }

    return {
      ingredientName: row.ingredientName,
      scaledQty: qty,
      unit: row.unit,
      lineTotal,
      conversionError,
      section: row.section,
    }
  })

  return (
    <RecipeDetail
      recipe={recipe}
      lineItems={lineItems}
      ingredientTotal={ingredientTotal}
    />
  )
}
