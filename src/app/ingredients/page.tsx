import { db } from '@/db'
import { ingredients } from '@/db/schema'
import { IngredientsClient } from '@/components/ingredients/ingredients-client'

export default async function IngredientsPage() {
  const data = await db.select().from(ingredients)
  return <IngredientsClient ingredients={data} />
}
