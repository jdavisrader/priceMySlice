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
  salesTaxAmount?: number
  salesTaxPct?: number
  sectionScales?: Record<string, string>
  onSectionScaleChange?: (section: string, value: string) => void
}

export function IngredientCostTable({ lineItems, ingredientTotal, salesTaxAmount, salesTaxPct, sectionScales, onSectionScaleChange }: Props) {
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
          <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-50">
            <span className="text-xs font-medium text-muted-foreground">{sectionName}</span>
            {onSectionScaleChange && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">Scale</span>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={sectionScales?.[sectionName] ?? '1'}
                  onChange={(e) => onSectionScaleChange(sectionName, e.target.value)}
                  className="w-16 text-right text-xs border rounded px-1.5 py-0.5 bg-white"
                />
                <span className="text-xs text-muted-foreground">×</span>
              </div>
            )}
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
      {salesTaxAmount !== undefined && salesTaxPct !== undefined && salesTaxPct > 0 && (
        <div className="flex justify-between px-3 py-2 text-muted-foreground bg-zinc-50">
          <span>Sales tax ({salesTaxPct.toFixed(2)}%)</span>
          <span>${salesTaxAmount.toFixed(2)}</span>
        </div>
      )}
    </div>
  )
}
