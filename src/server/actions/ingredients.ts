'use server'

import { db } from '@/db'
import { ingredients } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { computePricePerBaseUnit } from '@/lib/units'

type IngredientInput = {
  name: string
  purchasePrice: number
  purchaseQuantity: number
  purchaseUnit: string
  notes?: string
  gPerMl?: number | null
}

export async function createIngredient(data: IngredientInput) {
  const { pricePerBaseUnit, baseUnit } = computePricePerBaseUnit(
    data.purchasePrice,
    data.purchaseQuantity,
    data.purchaseUnit
  )

  await db.insert(ingredients).values({
    name: data.name,
    purchasePrice: data.purchasePrice.toString(),
    purchaseQuantity: data.purchaseQuantity.toString(),
    purchaseUnit: data.purchaseUnit,
    pricePerBaseUnit: pricePerBaseUnit.toString(),
    baseUnit,
    notes: data.notes ?? null,
    gPerMl: data.gPerMl != null ? data.gPerMl.toString() : null,
  })

  revalidatePath('/ingredients')
}

export async function updateIngredient(id: number, data: IngredientInput) {
  const { pricePerBaseUnit, baseUnit } = computePricePerBaseUnit(
    data.purchasePrice,
    data.purchaseQuantity,
    data.purchaseUnit
  )

  await db
    .update(ingredients)
    .set({
      name: data.name,
      purchasePrice: data.purchasePrice.toString(),
      purchaseQuantity: data.purchaseQuantity.toString(),
      purchaseUnit: data.purchaseUnit,
      pricePerBaseUnit: pricePerBaseUnit.toString(),
      baseUnit,
      notes: data.notes ?? null,
      gPerMl: data.gPerMl != null ? data.gPerMl.toString() : null,
      updatedAt: new Date(),
    })
    .where(eq(ingredients.id, id))

  revalidatePath('/ingredients')
}

export async function deleteIngredient(id: number) {
  await db.delete(ingredients).where(eq(ingredients.id, id))
  revalidatePath('/ingredients')
}
