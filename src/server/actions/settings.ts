'use server'

import { db } from '@/db'
import { appSettings } from '@/db/schema'

export async function getSettings() {
  const rows = await db.select().from(appSettings).limit(1)
  if (rows.length > 0) return rows[0]
  const [row] = await db.insert(appSettings).values({}).returning()
  return row
}

export async function updateDefaultSalesTaxRate(rate: number): Promise<void> {
  const rows = await db.select().from(appSettings).limit(1)
  if (rows.length > 0) {
    await db
      .update(appSettings)
      .set({ defaultSalesTaxRate: rate.toString(), updatedAt: new Date() })
  } else {
    await db.insert(appSettings).values({ defaultSalesTaxRate: rate.toString() })
  }
}
