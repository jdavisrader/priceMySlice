'use server'

import { db } from '@/db'
import { recipes, recipeIngredients } from '@/db/schema'
import { eq, asc, isNotNull } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export type RecipeForCopy = {
  id: number
  name: string
  sections: {
    name: string
    ingredients: { ingredientId: number; quantity: string; unit: string }[]
  }[]
}

export async function getRecipesForCopy(excludeId?: number): Promise<RecipeForCopy[]> {
  const rows = await db
    .select({
      recipeId: recipes.id,
      recipeName: recipes.name,
      ingredientId: recipeIngredients.ingredientId,
      quantity: recipeIngredients.quantity,
      unit: recipeIngredients.unit,
      section: recipeIngredients.section,
      sortOrder: recipeIngredients.sortOrder,
    })
    .from(recipes)
    .innerJoin(recipeIngredients, eq(recipeIngredients.recipeId, recipes.id))
    .where(isNotNull(recipeIngredients.section))
    .orderBy(asc(recipes.name), asc(recipeIngredients.sortOrder))

  const filtered = excludeId ? rows.filter((r) => r.recipeId !== excludeId) : rows

  const recipeMap = new Map<number, RecipeForCopy>()
  for (const row of filtered) {
    if (!recipeMap.has(row.recipeId)) {
      recipeMap.set(row.recipeId, { id: row.recipeId, name: row.recipeName, sections: [] })
    }
    const recipe = recipeMap.get(row.recipeId)!
    const sectionName = row.section!
    let section = recipe.sections.find((s) => s.name === sectionName)
    if (!section) {
      section = { name: sectionName, ingredients: [] }
      recipe.sections.push(section)
    }
    section.ingredients.push({ ingredientId: row.ingredientId, quantity: row.quantity, unit: row.unit })
  }

  return Array.from(recipeMap.values())
}

export type RecipeFullCopy = {
  name: string
  description: string | null
  servings: number
  notes: string | null
  ingredients: { ingredientId: number; quantity: string; unit: string; section: string | null; sortOrder: number }[]
}

export async function getRecipeFullCopy(id: number): Promise<RecipeFullCopy | null> {
  const recipeRows = await db
    .select({ name: recipes.name, description: recipes.description, servings: recipes.servings, notes: recipes.notes })
    .from(recipes)
    .where(eq(recipes.id, id))
    .limit(1)

  if (recipeRows.length === 0) return null
  const recipe = recipeRows[0]

  const ingredients = await db
    .select({
      ingredientId: recipeIngredients.ingredientId,
      quantity: recipeIngredients.quantity,
      unit: recipeIngredients.unit,
      section: recipeIngredients.section,
      sortOrder: recipeIngredients.sortOrder,
    })
    .from(recipeIngredients)
    .where(eq(recipeIngredients.recipeId, id))
    .orderBy(asc(recipeIngredients.sortOrder))

  return { ...recipe, ingredients }
}

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
