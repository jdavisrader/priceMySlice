'use client'

import { useState, useTransition } from 'react'
import type { InferSelectModel } from 'drizzle-orm'
import type { ingredients } from '@/db/schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { UNITS, computePricePerBaseUnit, formatPricePerUnit } from '@/lib/units'
import { createIngredient, updateIngredient } from '@/server/actions/ingredients'

type Ingredient = InferSelectModel<typeof ingredients>

type Props = {
  ingredient?: Ingredient
  onSuccess: () => void
  onCancel: () => void
}

export function IngredientForm({ ingredient, onSuccess, onCancel }: Props) {
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState(ingredient?.name ?? '')
  const [price, setPrice] = useState(ingredient ? parseFloat(ingredient.purchasePrice).toString() : '')
  const [quantity, setQuantity] = useState(ingredient ? parseFloat(ingredient.purchaseQuantity).toString() : '')
  const [unit, setUnit] = useState(ingredient?.purchaseUnit ?? '')
  const [notes, setNotes] = useState(ingredient?.notes ?? '')

  const priceNum = parseFloat(price)
  const qtyNum = parseFloat(quantity)
  let preview: { pricePerBaseUnit: number; baseUnit: string } | null = null
  if (unit && !isNaN(priceNum) && !isNaN(qtyNum) && priceNum > 0 && qtyNum > 0) {
    try {
      preview = computePricePerBaseUnit(priceNum, qtyNum, unit)
    } catch {}
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const data = {
        name,
        purchasePrice: priceNum,
        purchaseQuantity: qtyNum,
        purchaseUnit: unit,
        notes: notes || undefined,
      }
      if (ingredient) {
        await updateIngredient(ingredient.id, data)
      } else {
        await createIngredient(data)
      }
      onSuccess()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. All-purpose flour"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="price">Purchase price ($)</Label>
          <Input
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="3.50"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="quantity">Package size</Label>
          <div className="flex gap-2">
            <Input
              id="quantity"
              type="number"
              min="0"
              step="any"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="2"
              required
            />
            <Select value={unit} onValueChange={(v) => setUnit(v ?? '')} required>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Unit" />
              </SelectTrigger>
              <SelectContent>
                {UNITS.map((u) => (
                  <SelectItem key={u.value} value={u.value}>
                    {u.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Brand, store, any details..."
          rows={2}
        />
      </div>

      {preview && (
        <div className="rounded-md bg-zinc-50 border px-4 py-3 text-sm">
          <span className="text-muted-foreground">Cost per {preview.baseUnit}: </span>
          <span className="font-medium">{formatPricePerUnit(preview.pricePerBaseUnit, preview.baseUnit)}</span>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending || !unit}>
          {isPending ? 'Saving…' : ingredient ? 'Save changes' : 'Add ingredient'}
        </Button>
      </div>
    </form>
  )
}
