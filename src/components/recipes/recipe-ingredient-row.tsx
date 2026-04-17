'use client'

import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UNITS } from '@/lib/units'

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
}

type Props = {
  row: RowData
  ingredientOptions: IngredientOption[]
  onChange: (updated: RowData) => void
  onRemove: () => void
}

export function RecipeIngredientRow({ row, ingredientOptions, onChange, onRemove }: Props) {
  const selected = ingredientOptions.find((i) => i.id.toString() === row.ingredientId)

  const compatibleUnits = selected
    ? UNITS.filter((u) => {
        const baseDim = UNITS.find((u2) => u2.value === selected.baseUnit)?.dimension
        return u.dimension === baseDim
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
          <SelectValue placeholder="Select ingredient…" />
        </SelectTrigger>
        <SelectContent>
          {ingredientOptions.map((i) => (
            <SelectItem key={i.id} value={i.id.toString()}>
              {i.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        type="number"
        min="0"
        step="any"
        placeholder="Qty"
        value={row.quantity}
        onChange={(e) => onChange({ ...row, quantity: e.target.value })}
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
