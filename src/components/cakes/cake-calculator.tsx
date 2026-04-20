'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { convertToBaseUnitsWithDensity, needsCrossDimension } from '@/lib/units'
import { resolveIngredientDensity } from '@/lib/densities'
import { saveCake } from '@/server/actions/cakes'
import { updateDefaultSalesTaxRate } from '@/server/actions/settings'
import { IngredientCostTable } from './ingredient-cost-table'

export type RecipeOption = {
  id: number
  name: string
  servings: number
  ingredients: {
    ingredientName: string
    gPerMl: string | null
    quantity: string
    unit: string
    pricePerBaseUnit: string
    baseUnit: string
    section: string | null
    sortOrder: number
  }[]
}

export function CakeCalculator({ recipeOptions, defaultSalesTaxRate }: { recipeOptions: RecipeOption[], defaultSalesTaxRate: number }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState('')
  const [recipeId, setRecipeId] = useState('')
  const [servings, setServings] = useState('')
  const [labor, setLabor] = useState('')
  const [packaging, setPackaging] = useState('')
  const [supplies, setSupplies] = useState('')
  const [salesTaxPct, setSalesTaxPct] = useState(defaultSalesTaxRate > 0 ? (defaultSalesTaxRate * 100).toString() : '')
  const [markup, setMarkup] = useState('3')
  const [finalPrice, setFinalPrice] = useState('')
  const [notes, setNotes] = useState('')
  const [sectionScales, setSectionScales] = useState<Record<string, string>>({})

  const recipe = recipeOptions.find((r) => r.id.toString() === recipeId)
  const servingsNum = parseFloat(servings) || 0
  const scaleFactor = recipe && servingsNum > 0 ? servingsNum / recipe.servings : 1

  const lineItems = recipe?.ingredients.map((ing) => {
    const sectionScale = parseFloat(sectionScales[ing.section ?? ''] || '1') || 1
    const scaledQty = parseFloat(ing.quantity) * scaleFactor * sectionScale
    const isCrossDimension = needsCrossDimension(ing.unit, ing.baseUnit)
    const density = isCrossDimension ? resolveIngredientDensity({ name: ing.ingredientName, gPerMl: ing.gPerMl }) : null
    try {
      const baseQty = convertToBaseUnitsWithDensity(scaledQty, ing.unit, ing.baseUnit, density)
      const lineTotal = baseQty * parseFloat(ing.pricePerBaseUnit)
      return { ...ing, scaledQty, lineTotal, conversionError: false }
    } catch {
      return { ...ing, scaledQty, lineTotal: NaN, conversionError: true }
    }
  }) ?? []

  const hasConversionError = lineItems.some((i) => i.conversionError)

  const ingredientTotal = lineItems.reduce((sum, i) => sum + i.lineTotal, 0)
  const laborNum = parseFloat(labor) || 0
  const packagingNum = parseFloat(packaging) || 0
  const suppliesNum = parseFloat(supplies) || 0
  const salesTaxRate = (parseFloat(salesTaxPct) || 0) / 100
  const salesTaxAmount = ingredientTotal * salesTaxRate
  const totalCost = ingredientTotal + salesTaxAmount + laborNum + packagingNum + suppliesNum
  const markupNum = parseFloat(markup) || 3
  const suggestedPrice = totalCost * markupNum

  function handleRecipeChange(id: string | null) {
    const r = recipeOptions.find((r) => r.id.toString() === id)
    setRecipeId(id ?? '')
    setServings(r ? r.servings.toString() : '')
    setSectionScales({})
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      await updateDefaultSalesTaxRate(salesTaxRate)
      const id = await saveCake({
        name,
        recipeId: recipe?.id,
        servings: servingsNum || recipe?.servings || 1,
        laborCost: laborNum,
        packagingCost: packagingNum,
        suppliesCost: suppliesNum,
        salesTaxRate,
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
          section: i.section ?? null,
          sortOrder: i.sortOrder ?? 0,
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
            <SelectTrigger><SelectValue placeholder="Select a recipe…">{recipe?.name}</SelectValue></SelectTrigger>
            <SelectContent>
              {recipeOptions.map((r) => (
                <SelectItem key={r.id} value={r.id.toString()}>{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="servings">Servings</Label>
          <Input id="servings" type="number" min="1" value={servings} onChange={(e) => { setServings(e.target.value); setSectionScales({}) }} placeholder="—" disabled={!recipe} />
        </div>
      </div>

      {recipe && (
        <>
          <Separator />
          <div className="space-y-1">
            <p className="text-sm font-medium mb-3">Ingredient cost</p>
            <IngredientCostTable
              lineItems={lineItems}
              ingredientTotal={ingredientTotal}
              salesTaxAmount={salesTaxAmount}
              salesTaxPct={parseFloat(salesTaxPct) || 0}
              sectionScales={sectionScales}
              onSectionScaleChange={(section, value) => setSectionScales((prev) => ({ ...prev, [section]: value }))}
            />
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
          <div className="space-y-1.5">
            <Label htmlFor="supplies">Supplies ($)</Label>
            <Input id="supplies" type="number" min="0" step="0.01" value={supplies} onChange={(e) => setSupplies(e.target.value)} placeholder="0.00" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="salesTax">Sales tax (%)</Label>
            <Input id="salesTax" type="number" min="0" step="0.01" value={salesTaxPct} onChange={(e) => setSalesTaxPct(e.target.value)} placeholder="0.00" />
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
        <Button type="submit" disabled={isPending || !recipe || hasConversionError}>{isPending ? 'Saving…' : 'Save pricing'}</Button>
      </div>
    </form>
  )
}
