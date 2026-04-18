'use server'

import { db } from '@/db'
import { recipes, recipeIngredients } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

type RecipeIngredientInput = {
  ingredientId: number
  quantity: number
  unit: string
  section: string | null
  sortOrder: number
}

type RecipeInput = {
  name: string
  description?: string
  servings: number
  notes?: string
  ingredients: RecipeIngredientInput[]
}

export async function createRecipe(data: RecipeInput): Promise<number> {
  const [recipe] = await db
    .insert(recipes)
    .values({
      name: data.name,
      description: data.description ?? null,
      servings: data.servings,
      notes: data.notes ?? null,
    })
    .returning({ id: recipes.id })

  if (data.ingredients.length > 0) {
    await db.insert(recipeIngredients).values(
      data.ingredients.map((i) => ({
        recipeId: recipe.id,
        ingredientId: i.ingredientId,
        quantity: i.quantity.toString(),
        unit: i.unit,
        section: i.section ?? null,
        sortOrder: i.sortOrder,
      }))
    )
  }

  revalidatePath('/recipes')
  return recipe.id
}

export async function updateRecipe(id: number, data: RecipeInput): Promise<void> {
  await db
    .update(recipes)
    .set({
      name: data.name,
      description: data.description ?? null,
      servings: data.servings,
      notes: data.notes ?? null,
      updatedAt: new Date(),
    })
    .where(eq(recipes.id, id))

  await db.delete(recipeIngredients).where(eq(recipeIngredients.recipeId, id))

  if (data.ingredients.length > 0) {
    await db.insert(recipeIngredients).values(
      data.ingredients.map((i) => ({
        recipeId: id,
        ingredientId: i.ingredientId,
        quantity: i.quantity.toString(),
        unit: i.unit,
        section: i.section ?? null,
        sortOrder: i.sortOrder,
      }))
    )
  }

  revalidatePath('/recipes')
  revalidatePath(`/recipes/${id}`)
}

export async function deleteRecipe(id: number): Promise<void> {
  await db.delete(recipes).where(eq(recipes.id, id))
  revalidatePath('/recipes')
}
