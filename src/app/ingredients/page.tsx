import { db } from '@/db'
import { ingredients } from '@/db/schema'
import { desc } from 'drizzle-orm'
import { IngredientsClient } from '@/components/ingredients/ingredients-client'

export default async function IngredientsPage() {
  const data = await db.select().from(ingredients).orderBy(desc(ingredients.updatedAt))
  return <IngredientsClient ingredients={data} />
}
