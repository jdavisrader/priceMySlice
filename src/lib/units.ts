export type UnitOption = {
  value: string
  label: string
  dimension: 'weight' | 'volume' | 'count'
  baseUnit: string
  toBase: number
}

export const UNITS: UnitOption[] = [
  { value: 'g',     label: 'g — grams',          dimension: 'weight', baseUnit: 'g',    toBase: 1 },
  { value: 'kg',    label: 'kg — kilograms',      dimension: 'weight', baseUnit: 'g',    toBase: 1000 },
  { value: 'oz',    label: 'oz — ounces',         dimension: 'weight', baseUnit: 'g',    toBase: 28.3495 },
  { value: 'lb',    label: 'lb — pounds',         dimension: 'weight', baseUnit: 'g',    toBase: 453.592 },
  { value: 'ml',    label: 'ml — milliliters',    dimension: 'volume', baseUnit: 'ml',   toBase: 1 },
  { value: 'l',     label: 'l — liters',          dimension: 'volume', baseUnit: 'ml',   toBase: 1000 },
  { value: 'tsp',   label: 'tsp — teaspoons',     dimension: 'volume', baseUnit: 'ml',   toBase: 4.92892 },
  { value: 'tbsp',  label: 'tbsp — tablespoons',  dimension: 'volume', baseUnit: 'ml',   toBase: 14.7868 },
  { value: 'cup',   label: 'cup',                 dimension: 'volume', baseUnit: 'ml',   toBase: 236.588 },
  { value: 'fl oz', label: 'fl oz',               dimension: 'volume', baseUnit: 'ml',   toBase: 29.5735 },
  { value: 'each',  label: 'each — per item',     dimension: 'count',  baseUnit: 'each', toBase: 1 },
]

export function computePricePerBaseUnit(
  purchasePrice: number,
  purchaseQuantity: number,
  purchaseUnit: string
): { pricePerBaseUnit: number; baseUnit: string } {
  const unit = UNITS.find((u) => u.value === purchaseUnit)
  if (!unit) throw new Error(`Unknown unit: ${purchaseUnit}`)
  const totalBaseUnits = purchaseQuantity * unit.toBase
  return { pricePerBaseUnit: purchasePrice / totalBaseUnits, baseUnit: unit.baseUnit }
}

export function formatPricePerUnit(pricePerBaseUnit: number, baseUnit: string): string {
  let formatted: string
  if (pricePerBaseUnit < 0.001) {
    formatted = pricePerBaseUnit.toFixed(6)
  } else if (pricePerBaseUnit < 0.1) {
    formatted = pricePerBaseUnit.toFixed(4)
  } else if (pricePerBaseUnit < 1) {
    formatted = pricePerBaseUnit.toFixed(3)
  } else {
    formatted = pricePerBaseUnit.toFixed(2)
  }
  return `$${formatted}/${baseUnit}`
}

export function convertToBaseUnits(quantity: number, unit: string): number {
  const u = UNITS.find((u) => u.value === unit)
  if (!u) throw new Error(`Unknown unit: ${unit}`)
  return quantity * u.toBase
}

export function getBaseUnit(unit: string): string {
  const u = UNITS.find((u) => u.value === unit)
  if (!u) throw new Error(`Unknown unit: ${unit}`)
  return u.baseUnit
}
