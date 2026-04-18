'use client'

import { X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RecipeIngredientRow, type IngredientOption, type RowData } from './recipe-ingredient-row'

type SectionData = { uid: string; name: string }

type Props = {
  section: SectionData
  rows: RowData[]
  ingredientOptions: IngredientOption[]
  onNameChange: (uid: string, newName: string) => void
  onRemove: (uid: string) => void
  onAddRow: (sectionName: string) => void
  onUpdateRow: (rowUid: string, updated: RowData) => void
  onRemoveRow: (rowUid: string) => void
}

export function SectionBlock({
  section,
  rows,
  ingredientOptions,
  onNameChange,
  onRemove,
  onAddRow,
  onUpdateRow,
  onRemoveRow,
}: Props) {
  return (
    <div className="rounded-md border border-border p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Input
          value={section.name}
          onChange={(e) => onNameChange(section.uid, e.target.value)}
          className="font-medium h-7 text-sm border-0 shadow-none px-0 focus-visible:ring-0 w-auto flex-1"
          placeholder="Section name…"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground shrink-0"
          onClick={() => onRemove(section.uid)}
        >
          <X className="h-4 w-4 mr-1" />
          Remove section
        </Button>
      </div>

      {rows.map((row) => (
        <RecipeIngredientRow
          key={row.uid}
          row={row}
          ingredientOptions={ingredientOptions}
          onChange={(updated) => onUpdateRow(row.uid, updated)}
          onRemove={() => onRemoveRow(row.uid)}
        />
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onAddRow(section.name)}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add ingredient
      </Button>
    </div>
  )
}
