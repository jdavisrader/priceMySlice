'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { type IngredientOption } from './recipe-ingredient-row'
import { SectionBlock } from './section-block'
import { CopyFromRecipeModal } from './copy-from-recipe-modal'
import { useRecipeSections, toOrderedIngredients } from './use-recipe-sections'
import { validateSections } from '@/lib/recipe-validation'
import { createRecipe, updateRecipe, type RecipeForCopy } from '@/server/actions/recipes'

type ExistingIngredient = {
  ingredientId: number
  quantity: string
  unit: string
  section: string
  sortOrder: number
}

type InitialValues = {
  name: string
  description: string | null
  servings: number
  notes: string | null
  ingredients: ExistingIngredient[]
}

type Props = {
  ingredientOptions: IngredientOption[]
  recipesForCopy: RecipeForCopy[]
  recipe?: { id: number; name: string; description: string | null; servings: number; notes: string | null }
  existingIngredients?: ExistingIngredient[]
  initialValues?: InitialValues
}

export function RecipeForm({ ingredientOptions, recipesForCopy, recipe, existingIngredients, initialValues }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const sourceIngredients = existingIngredients ?? initialValues?.ingredients

  const [name, setName] = useState(() => {
    if (recipe) return recipe.name
    if (initialValues) return `Copy of ${initialValues.name}`
    return ''
  })
  const [description, setDescription] = useState(recipe?.description ?? initialValues?.description ?? '')
  const [servings, setServings] = useState((recipe?.servings ?? initialValues?.servings)?.toString() ?? '1')
  const [notes, setNotes] = useState(recipe?.notes ?? initialValues?.notes ?? '')

  const {
    sections,
    rows,
    addSection,
    addCopiedSection,
    updateSectionName,
    removeSection,
    addRow,
    updateRow,
    removeRow,
  } = useRecipeSections(sourceIngredients)

  const [copyModalOpen, setCopyModalOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const problem = validateSections(sections, rows)
    setError(problem)
    if (problem) return

    startTransition(async () => {
      const data = {
        name,
        description: description || undefined,
        servings: parseInt(servings),
        notes: notes || undefined,
        ingredients: toOrderedIngredients(sections, rows),
      }
      if (recipe) {
        await updateRecipe(recipe.id, data)
        router.push(`/recipes/${recipe.id}`)
      } else {
        await createRecipe(data)
        router.push('/recipes')
      }
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
        <div className="space-y-1">
          <Label>Ingredients</Label>
          <p className="text-xs text-muted-foreground">
            Ingredients live in sections — like &ldquo;Chocolate Cake&rdquo; or &ldquo;Buttercream&rdquo; — so you can
            reuse a section when pricing a cake.
          </p>
        </div>

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
            {sections.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No sections yet. Add a section to start building this recipe.
              </p>
            )}

            {sections.map((section) => (
              <SectionBlock
                key={section.uid}
                section={section}
                rows={rows.filter((r) => r.sectionUid === section.uid)}
                ingredientOptions={ingredientOptions}
                onNameChange={updateSectionName}
                onRemove={removeSection}
                onAddRow={addRow}
                onUpdateRow={updateRow}
                onRemoveRow={removeRow}
              />
            ))}

            <DropdownMenu>
              <DropdownMenuTrigger className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                <Plus className="h-4 w-4" />
                Add section
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={addSection}>New section</DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setCopyModalOpen(true)}
                  disabled={recipesForCopy.length === 0}
                >
                  Copy from recipe
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <CopyFromRecipeModal
              open={copyModalOpen}
              onOpenChange={setCopyModalOpen}
              recipes={recipesForCopy}
              onCopy={addCopiedSection}
            />
          </>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" onClick={() => router.push(recipe ? `/recipes/${recipe.id}` : '/recipes')} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving…' : recipe ? 'Save changes' : 'Create recipe'}
        </Button>
      </div>
    </form>
  )
}
