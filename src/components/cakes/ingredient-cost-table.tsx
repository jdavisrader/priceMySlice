import { formatQuantity } from '@/lib/fractions'

type LineItem = {
  ingredientName: string
  scaledQty: number
  unit: string
  lineTotal: number
  conversionError: boolean
  section: string | null
}

type Props = {
  lineItems: LineItem[]
  ingredientTotal: number
}

export function IngredientCostTable({ lineItems, ingredientTotal }: Props) {
  const unsectioned = lineItems.filter((i) => !i.section)
  const sectionNames = [...new Set(lineItems.filter((i) => i.section).map((i) => i.section!))]

  function renderRow(item: LineItem, key: string) {
    const qtyLabel = `${formatQuantity(item.scaledQty, item.unit)} ${item.unit}`
    const priceLabel = item.conversionError ? 'No density data' : `$${item.lineTotal.toFixed(2)}`
    return (
      <div key={key} className="flex items-center gap-3 px-3 py-2">
        <span className="font-medium flex-1 min-w-0 truncate" title={item.ingredientName}>{item.ingredientName}</span>
        <span className="text-muted-foreground w-28 shrink-0 truncate text-right" title={qtyLabel}>{qtyLabel}</span>
        {item.conversionError
          ? <span className="text-destructive text-xs w-24 shrink-0 text-right">{priceLabel}</span>
          : <span className="w-24 shrink-0 text-right tabular-nums">{priceLabel}</span>
        }
      </div>
    )
  }

  return (
    <div className="divide-y rounded-md border bg-white text-sm">
      {unsectioned.map((item, i) => renderRow(item, `u-${i}`))}
      {sectionNames.map((sectionName) => (
        <div key={sectionName}>
          <div className="px-3 py-1.5 bg-zinc-50 text-xs font-medium text-muted-foreground">
            {sectionName}
          </div>
          {lineItems.filter((i) => i.section === sectionName).map((item, i) =>
            renderRow(item, `${sectionName}-${i}`)
          )}
        </div>
      ))}
      <div className="flex justify-between px-3 py-2 font-medium bg-zinc-50">
        <span>Ingredient total</span>
        <span>${ingredientTotal.toFixed(2)}</span>
      </div>
    </div>
  )
}
