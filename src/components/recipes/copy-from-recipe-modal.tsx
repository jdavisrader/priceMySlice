'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { RecipeForCopy } from '@/server/actions/recipes'

export type CopiedIngredient = { ingredientId: string; quantity: string; unit: string }

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  recipes: RecipeForCopy[]
  onCopy: (sectionName: string, ingredients: CopiedIngredient[]) => void
}

export function CopyFromRecipeModal({ open, onOpenChange, recipes, onCopy }: Props) {
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>('')
  const [selectedSection, setSelectedSection] = useState<string>('')

  const selectedRecipe = recipes.find((r) => r.id.toString() === selectedRecipeId)

  function handleRecipeChange(value: string) {
    setSelectedRecipeId(value)
    setSelectedSection('')
  }

  function handleConfirm() {
    if (!selectedRecipe || !selectedSection) return
    const section = selectedRecipe.sections.find((s) => s.name === selectedSection)
    if (!section) return
    const ingredients: CopiedIngredient[] = section.ingredients.map((ing) => ({
      ingredientId: ing.ingredientId.toString(),
      quantity: parseFloat(ing.quantity).toString(),
      unit: ing.unit,
    }))
    onCopy(selectedSection, ingredients)
    setSelectedRecipeId('')
    setSelectedSection('')
    onOpenChange(false)
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      setSelectedRecipeId('')
      setSelectedSection('')
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Copy section from recipe</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2 min-w-0">
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Recipe</p>
            <Select value={selectedRecipeId} onValueChange={(v) => handleRecipeChange(v ?? '')}>
              <SelectTrigger className="w-full min-w-0">
                <SelectValue className="min-w-0" placeholder="Select a recipe…">
                  {selectedRecipe?.name ?? null}
                </SelectValue>
              </SelectTrigger>
              <SelectContent align="start" alignItemWithTrigger={false}>
                {recipes.map((r) => (
                  <SelectItem key={r.id} value={r.id.toString()} title={r.name}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedRecipe && (
            <div className="space-y-1.5">
              <p className="text-sm font-medium">Section</p>
              <div className="space-y-1.5">
                {selectedRecipe.sections.map((s) => (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => setSelectedSection(s.name)}
                    className={`w-full text-left px-3 py-2 rounded-md border text-sm transition-colors ${
                      selectedSection === s.name
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted'
                    }`}
                  >
                    <div className="font-medium truncate" title={s.name}>{s.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {s.ingredients.length} ingredient{s.ingredients.length !== 1 ? 's' : ''}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" type="button" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={!selectedRecipeId || !selectedSection}>
            Copy section
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
