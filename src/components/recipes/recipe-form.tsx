'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { RecipeIngredientRow, type IngredientOption, type RowData } from './recipe-ingredient-row'
import { createRecipe, updateRecipe } from '@/server/actions/recipes'

type ExistingIngredient = { ingredientId: number; quantity: string; unit: string }

type Props = {
  ingredientOptions: IngredientOption[]
  recipe?: { id: number; name: string; description: string | null; servings: number; notes: string | null }
  existingIngredients?: ExistingIngredient[]
}

export function RecipeForm({ ingredientOptions, recipe, existingIngredients }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState(recipe?.name ?? '')
  const [description, setDescription] = useState(recipe?.description ?? '')
  const [servings, setServings] = useState(recipe?.servings?.toString() ?? '1')
  const [notes, setNotes] = useState(recipe?.notes ?? '')
  const [rows, setRows] = useState<RowData[]>(
    existingIngredients?.map((ei) => ({
      uid: crypto.randomUUID(),
      ingredientId: ei.ingredientId.toString(),
      quantity: parseFloat(ei.quantity).toString(),
      unit: ei.unit,
    })) ?? []
  )

  function addRow() {
    setRows((prev) => [...prev, { uid: crypto.randomUUID(), ingredientId: '', quantity: '', unit: '' }])
  }

  function updateRow(uid: string, updated: RowData) {
    setRows((prev) => prev.map((r) => (r.uid === uid ? updated : r)))
  }

  function removeRow(uid: string) {
    setRows((prev) => prev.filter((r) => r.uid !== uid))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validRows = rows.filter((r) => r.ingredientId && r.quantity && r.unit)
    startTransition(async () => {
      const data = {
        name,
        description: description || undefined,
        servings: parseInt(servings),
        notes: notes || undefined,
        ingredients: validRows.map((r) => ({
          ingredientId: parseInt(r.ingredientId),
          quantity: parseFloat(r.quantity),
          unit: r.unit,
        })),
      }
      if (recipe) {
        await updateRecipe(recipe.id, data)
      } else {
        await createRecipe(data)
      }
      router.push('/recipes')
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      <div className="space-y-1.5">
        <Label htmlFor="name">Recipe name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Classic Vanilla Cake"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A brief description of the cake…"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="servings">Servings</Label>
          <Input
            id="servings"
            type="number"
            min="1"
            value={servings}
            onChange={(e) => setServings(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="notes">Notes (optional)</Label>
          <Input
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Baking tips, variations…"
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <Label>Ingredients</Label>
        {ingredientOptions.length === 0 ? (
          <div className="rounded-md border border-dashed px-4 py-5 text-sm text-muted-foreground">
            No ingredients in your library yet.{' '}
            <Link href="/ingredients" className="text-foreground underline underline-offset-4">
              Add ingredients first
            </Link>{' '}
            before building a recipe.
          </div>
        ) : (
          <>
            {rows.length === 0 && (
              <p className="text-sm text-muted-foreground">No ingredients added yet.</p>
            )}
            {rows.map((row) => (
              <RecipeIngredientRow
                key={row.uid}
                row={row}
                ingredientOptions={ingredientOptions}
                onChange={(updated) => updateRow(row.uid, updated)}
                onRemove={() => removeRow(row.uid)}
              />
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addRow}>
              <Plus className="h-4 w-4 mr-2" />
              Add ingredient
            </Button>
          </>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" onClick={() => router.push('/recipes')} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving…' : recipe ? 'Save changes' : 'Create recipe'}
        </Button>
      </div>
    </form>
  )
}
