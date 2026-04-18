'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, ChevronLeft } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { IngredientCostTable } from '@/components/cakes/ingredient-cost-table'
import { deleteRecipe } from '@/server/actions/recipes'

type LineItem = {
  ingredientName: string
  scaledQty: number
  unit: string
  lineTotal: number
  conversionError: boolean
  section: string | null
}

type Props = {
  recipe: {
    id: number
    name: string
    description: string | null
    servings: number
    notes: string | null
  }
  lineItems: LineItem[]
  ingredientTotal: number
}

export function RecipeDetail({ recipe, lineItems, ingredientTotal }: Props) {
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleDeleteConfirm() {
    startTransition(async () => {
      await deleteRecipe(recipe.id)
      router.push('/recipes')
    })
  }

  const perServing = recipe.servings > 0 ? ingredientTotal / recipe.servings : 0

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link
            href="/recipes"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-3"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Recipes
          </Link>
          <h2 className="text-2xl font-semibold tracking-tight">{recipe.name}</h2>
          {recipe.description && (
            <p className="text-muted-foreground mt-1">{recipe.description}</p>
          )}
        </div>
        <div className="flex gap-2 mt-1">
          <Link
            href={`/recipes/${recipe.id}/edit`}
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            disabled={isPending}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 max-w-2xl">
        <div className="flex gap-6 text-sm">
          <div>
            <span className="text-muted-foreground">Servings</span>
            <p className="font-medium mt-0.5">{recipe.servings}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Ingredient cost</span>
            <p className="font-medium mt-0.5">${ingredientTotal.toFixed(2)}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Per serving</span>
            <p className="font-medium mt-0.5">${perServing.toFixed(2)}</p>
          </div>
        </div>

        {recipe.notes && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Notes</p>
            <p className="text-sm whitespace-pre-wrap">{recipe.notes}</p>
          </div>
        )}

        {lineItems.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Ingredients</p>
            <IngredientCostTable
              lineItems={lineItems}
              ingredientTotal={ingredientTotal}
            />
          </div>
        )}

        {lineItems.length === 0 && (
          <p className="text-sm text-muted-foreground">No ingredients added to this recipe yet.</p>
        )}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={(open) => !open && setShowDeleteDialog(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {recipe.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this recipe and all its ingredient associations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
