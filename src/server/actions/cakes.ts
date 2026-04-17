'use server'

import { db } from '@/db'
import { cakes, cakeIngredientSnapshots } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

type IngredientSnapshot = {
  ingredientName: string
  quantity: number
  unit: string
  pricePerBaseUnit: number
  lineTotal: number
}

type SaveCakeInput = {
  name: string
  recipeId?: number
  servings: number
  laborCost: number
  packagingCost: number
  totalIngredientCost: number
  totalCost: number
  markupMultiplier: number
  suggestedPrice: number
  finalPrice: number
  notes?: string
  ingredientSnapshots: IngredientSnapshot[]
}

export async function saveCake(data: SaveCakeInput): Promise<number> {
  const [cake] = await db
    .insert(cakes)
    .values({
      name: data.name,
      recipeId: data.recipeId ?? null,
      servings: data.servings,
      laborCost: data.laborCost.toFixed(2),
      packagingCost: data.packagingCost.toFixed(2),
      totalIngredientCost: data.totalIngredientCost.toFixed(4),
      totalCost: data.totalCost.toFixed(4),
      markupMultiplier: data.markupMultiplier.toString(),
      suggestedPrice: data.suggestedPrice.toFixed(2),
      finalPrice: data.finalPrice.toFixed(2),
      notes: data.notes ?? null,
    })
    .returning({ id: cakes.id })

  if (data.ingredientSnapshots.length > 0) {
    await db.insert(cakeIngredientSnapshots).values(
      data.ingredientSnapshots.map((s) => ({
        cakeId: cake.id,
        ingredientName: s.ingredientName,
        quantity: s.quantity.toString(),
        unit: s.unit,
        pricePerBaseUnit: s.pricePerBaseUnit.toString(),
        lineTotal: s.lineTotal.toFixed(4),
      }))
    )
  }

  revalidatePath('/cakes')
  return cake.id
}

export async function deleteCake(id: number): Promise<void> {
  await db.delete(cakes).where(eq(cakes.id, id))
  revalidatePath('/cakes')
}
