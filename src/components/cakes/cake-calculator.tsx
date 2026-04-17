'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { convertToBaseUnits } from '@/lib/units'
import { saveCake } from '@/server/actions/cakes'

export type RecipeOption = {
  id: number
  name: string
  servings: number
  ingredients: {
    ingredientName: string
    quantity: string
    unit: string
    pricePerBaseUnit: string
    baseUnit: string
  }[]
}

export function CakeCalculator({ recipeOptions }: { recipeOptions: RecipeOption[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState('')
  const [recipeId, setRecipeId] = useState('')
  const [servings, setServings] = useState('')
  const [labor, setLabor] = useState('')
  const [packaging, setPackaging] = useState('')
  const [markup, setMarkup] = useState('3')
  const [finalPrice, setFinalPrice] = useState('')
  const [notes, setNotes] = useState('')

  const recipe = recipeOptions.find((r) => r.id.toString() === recipeId)
  const servingsNum = parseFloat(servings) || 0
  const scaleFactor = recipe && servingsNum > 0 ? servingsNum / recipe.servings : 1

  const lineItems = recipe?.ingredients.map((ing) => {
    const scaledQty = parseFloat(ing.quantity) * scaleFactor
    const baseQty = convertToBaseUnits(scaledQty, ing.unit)
    const lineTotal = baseQty * parseFloat(ing.pricePerBaseUnit)
    return { ...ing, scaledQty, lineTotal }
  }) ?? []

  const ingredientTotal = lineItems.reduce((sum, i) => sum + i.lineTotal, 0)
  const laborNum = parseFloat(labor) || 0
  const packagingNum = parseFloat(packaging) || 0
  const totalCost = ingredientTotal + laborNum + packagingNum
  const markupNum = parseFloat(markup) || 3
  const suggestedPrice = totalCost * markupNum

  function handleRecipeChange(id: string | null) {
    const r = recipeOptions.find((r) => r.id.toString() === id)
    setRecipeId(id ?? '')
    setServings(r ? r.servings.toString() : '')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const id = await saveCake({
        name,
        recipeId: recipe?.id,
        servings: servingsNum || recipe?.servings || 1,
        laborCost: laborNum,
        packagingCost: packagingNum,
        totalIngredientCost: ingredientTotal,
        totalCost,
        markupMultiplier: markupNum,
        suggestedPrice,
        finalPrice: parseFloat(finalPrice) || suggestedPrice,
        notes: notes || undefined,
        ingredientSnapshots: lineItems.map((i) => ({
          ingredientName: i.ingredientName,
          quantity: i.scaledQty,
          unit: i.unit,
          pricePerBaseUnit: parseFloat(i.pricePerBaseUnit),
          lineTotal: i.lineTotal,
        })),
      })
      router.push(`/cakes/${id}`)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="space-y-1.5">
        <Label htmlFor="name">Cake name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sarah's Birthday Cake" required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Recipe</Label>
          <Select value={recipeId} onValueChange={handleRecipeChange}>
            <SelectTrigger><SelectValue placeholder="Select a recipe…" /></SelectTrigger>
            <SelectContent>
              {recipeOptions.map((r) => (
                <SelectItem key={r.id} value={r.id.toString()}>{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="servings">Servings</Label>
          <Input id="servings" type="number" min="1" value={servings} onChange={(e) => setServings(e.target.value)} placeholder="—" disabled={!recipe} />
        </div>
      </div>

      {recipe && (
        <>
          <Separator />
          <div className="space-y-1">
            <p className="text-sm font-medium mb-3">Ingredient cost</p>
            <div className="divide-y rounded-md border bg-white text-sm">
              {lineItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2">
                  <span className="font-medium">{item.ingredientName}</span>
                  <span className="text-muted-foreground">{item.scaledQty % 1 === 0 ? item.scaledQty : item.scaledQty.toFixed(2)} {item.unit}</span>
                  <span>${item.lineTotal.toFixed(4)}</span>
                </div>
              ))}
              <div className="flex justify-between px-3 py-2 font-medium bg-zinc-50">
                <span>Ingredient total</span>
                <span>${ingredientTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </>
      )}

      <Separator />

      <div className="space-y-3">
        <p className="text-sm font-medium">Overhead</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="labor">Labor ($)</Label>
            <Input id="labor" type="number" min="0" step="0.01" value={labor} onChange={(e) => setLabor(e.target.value)} placeholder="0.00" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="packaging">Packaging ($)</Label>
            <Input id="packaging" type="number" min="0" step="0.01" value={packaging} onChange={(e) => setPackaging(e.target.value)} placeholder="0.00" />
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <p className="text-sm font-medium">Pricing</p>
        <div className="rounded-md border bg-white divide-y text-sm">
          <div className="flex justify-between px-3 py-2">
            <span className="text-muted-foreground">Total cost</span>
            <span className="font-medium">${totalCost.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between px-3 py-2 gap-4">
            <span className="text-muted-foreground shrink-0">Markup</span>
            <div className="flex items-center gap-2 ml-auto">
              <Input type="number" min="1" step="0.5" value={markup} onChange={(e) => setMarkup(e.target.value)} className="w-20 text-right" />
              <span className="text-muted-foreground">×</span>
            </div>
          </div>
          <div className="flex justify-between px-3 py-2">
            <span className="text-muted-foreground">Suggested price</span>
            <span className="font-medium">${suggestedPrice.toFixed(2)}</span>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="finalPrice">Final price ($)</Label>
          <div className="flex gap-2">
            <Input id="finalPrice" type="number" min="0" step="0.01" value={finalPrice} onChange={(e) => setFinalPrice(e.target.value)} placeholder={suggestedPrice > 0 ? suggestedPrice.toFixed(2) : '0.00'} />
            {suggestedPrice > 0 && (
              <Button type="button" variant="outline" onClick={() => setFinalPrice(suggestedPrice.toFixed(2))}>
                Use suggested
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Customer name, special requests…" rows={2} />
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={() => router.push('/cakes')} disabled={isPending}>Cancel</Button>
        <Button type="submit" disabled={isPending || !recipe}>{isPending ? 'Saving…' : 'Save pricing'}</Button>
      </div>
    </form>
  )
}
