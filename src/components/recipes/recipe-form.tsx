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
import { SectionBlock } from './section-block'
import { createRecipe, updateRecipe } from '@/server/actions/recipes'

type SectionData = { uid: string; name: string }

type ExistingIngredient = {
  ingredientId: number
  quantity: string
  unit: string
  section: string | null
  sortOrder: number
}

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

  const [sections, setSections] = useState<SectionData[]>(() => {
    if (!existingIngredients) return []
    const seen = new Map<string, SectionData>()
    ;[...existingIngredients]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .forEach((ei) => {
        if (ei.section && !seen.has(ei.section)) {
          seen.set(ei.section, { uid: crypto.randomUUID(), name: ei.section })
        }
      })
    return Array.from(seen.values())
  })

  const [rows, setRows] = useState<RowData[]>(
    existingIngredients
      ?.slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((ei) => ({
        uid: crypto.randomUUID(),
        ingredientId: ei.ingredientId.toString(),
        quantity: parseFloat(ei.quantity).toString(),
        unit: ei.unit,
        section: ei.section ?? null,
      })) ?? []
  )

  function updateRow(uid: string, updated: RowData) {
    setRows((prev) => prev.map((r) => (r.uid === uid ? updated : r)))
  }

  function removeRow(uid: string) {
    setRows((prev) => prev.filter((r) => r.uid !== uid))
  }

  function addRowToSection(sectionName: string | null) {
    setRows((prev) => [...prev, { uid: crypto.randomUUID(), ingredientId: '', quantity: '', unit: '', section: sectionName }])
  }

  function addSection() {
    setSections((prev) => [...prev, { uid: crypto.randomUUID(), name: 'New section' }])
  }

  function updateSectionName(uid: string, newName: string) {
    const section = sections.find((s) => s.uid === uid)
    if (!section) return
    const oldName = section.name
    setSections((prev) => prev.map((s) => (s.uid === uid ? { ...s, name: newName } : s)))
    setRows((prev) => prev.map((r) => (r.section === oldName ? { ...r, section: newName } : r)))
  }

  function removeSection(uid: string) {
    const section = sections.find((s) => s.uid === uid)
    if (!section) return
    setSections((prev) => prev.filter((s) => s.uid !== uid))
    setRows((prev) => prev.filter((r) => r.section !== section.name))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const unsectionedRows = rows.filter((r) => r.section === null)
    const allRows: RowData[] = [...unsectionedRows]
    sections.forEach((s) => {
      allRows.push(...rows.filter((r) => r.section === s.name))
    })
    const validRows = allRows.filter((r) => r.ingredientId && r.quantity && r.unit)
    startTransition(async () => {
      const data = {
        name,
        description: description || undefined,
        servings: parseInt(servings),
        notes: notes || undefined,
        ingredients: validRows.map((r, idx) => ({
          ingredientId: parseInt(r.ingredientId),
          quantity: parseFloat(r.quantity),
          unit: r.unit,
          section: r.section ?? null,
          sortOrder: idx,
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

  const unsectionedRows = rows.filter((r) => r.section === null)

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
            {unsectionedRows.length === 0 && sections.length === 0 && (
              <p className="text-sm text-muted-foreground">No ingredients added yet.</p>
            )}
            {unsectionedRows.map((row) => (
              <RecipeIngredientRow
                key={row.uid}
                row={row}
                ingredientOptions={ingredientOptions}
                onChange={(updated) => updateRow(row.uid, updated)}
                onRemove={() => removeRow(row.uid)}
              />
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => addRowToSection(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add ingredient
            </Button>

            {sections.map((section) => (
              <SectionBlock
                key={section.uid}
                section={section}
                rows={rows.filter((r) => r.section === section.name)}
                ingredientOptions={ingredientOptions}
                onNameChange={updateSectionName}
                onRemove={removeSection}
                onAddRow={addRowToSection}
                onUpdateRow={updateRow}
                onRemoveRow={removeRow}
              />
            ))}

            <Button type="button" variant="outline" size="sm" onClick={addSection}>
              <Plus className="h-4 w-4 mr-2" />
              Add section
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
