'use client'

import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FractionInput } from '@/components/ui/fraction-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UNITS } from '@/lib/units'
import { getDensity } from '@/lib/densities'

export type IngredientOption = {
  id: number
  name: string
  baseUnit: string
}

export type RowData = {
  uid: string
  ingredientId: string
  quantity: string
  unit: string
  section: string | null
}

type Props = {
  row: RowData
  ingredientOptions: IngredientOption[]
  onChange: (updated: RowData) => void
  onRemove: () => void
}

export function RecipeIngredientRow({ row, ingredientOptions, onChange, onRemove }: Props) {
  const selected = ingredientOptions.find((i) => i.id.toString() === row.ingredientId)

  const hasDensity = selected ? getDensity(selected.name) !== null : false

  const compatibleUnits = selected
    ? UNITS.filter((u) => {
        const baseDim = UNITS.find((u2) => u2.value === selected.baseUnit)?.dimension
        if (u.dimension === baseDim) return true   // same dimension: always allowed
        if (u.dimension === 'count') return false  // count never bridges
        return hasDensity                          // cross-dimension: only if density known
      })
    : UNITS

  function handleIngredientChange(ingredientId: string | null) {
    const ing = ingredientOptions.find((i) => i.id.toString() === ingredientId)
    onChange({ ...row, ingredientId: ingredientId ?? '', unit: ing?.baseUnit ?? '' })
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={row.ingredientId} onValueChange={handleIngredientChange}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="Select ingredient…">{selected?.name}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {ingredientOptions.map((i) => (
            <SelectItem key={i.id} value={i.id.toString()}>
              {i.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <FractionInput
        value={row.quantity}
        unit={row.unit}
        onChange={(num) => onChange({ ...row, quantity: num.toString() })}
        className="w-24"
      />

      <Select
        value={row.unit}
        onValueChange={(v) => onChange({ ...row, unit: v ?? '' })}
        disabled={!selected}
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Unit" />
        </SelectTrigger>
        <SelectContent>
          {compatibleUnits.map((u) => (
            <SelectItem key={u.value} value={u.value}>
              {u.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  )
}
