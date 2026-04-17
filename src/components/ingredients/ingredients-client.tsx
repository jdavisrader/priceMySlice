'use client'

import { useState, useTransition } from 'react'
import type { InferSelectModel } from 'drizzle-orm'
import type { ingredients } from '@/db/schema'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { IngredientForm } from './ingredient-form'
import { deleteIngredient } from '@/server/actions/ingredients'
import { formatPricePerUnit } from '@/lib/units'

type Ingredient = InferSelectModel<typeof ingredients>

export function IngredientsClient({ ingredients }: { ingredients: Ingredient[] }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Ingredient | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Ingredient | null>(null)
  const [isPending, startTransition] = useTransition()

  function openAdd() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(ingredient: Ingredient) {
    setEditing(ingredient)
    setDialogOpen(true)
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return
    startTransition(async () => {
      await deleteIngredient(deleteTarget.id)
      setDeleteTarget(null)
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Ingredients</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your ingredients and their current prices.
          </p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add ingredient
        </Button>
      </div>

      {ingredients.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">No ingredients yet.</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={openAdd}>
            Add your first ingredient
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Package size</TableHead>
                <TableHead>Purchase price</TableHead>
                <TableHead>Cost per unit</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {ingredients.map((ingredient) => (
                <TableRow key={ingredient.id}>
                  <TableCell className="font-medium">{ingredient.name}</TableCell>
                  <TableCell>
                    {parseFloat(ingredient.purchaseQuantity).toString()} {ingredient.purchaseUnit}
                  </TableCell>
                  <TableCell>${parseFloat(ingredient.purchasePrice).toFixed(2)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatPricePerUnit(parseFloat(ingredient.pricePerBaseUnit), ingredient.baseUnit)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(ingredient.updatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(ingredient)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(ingredient)}
                        disabled={isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit ingredient' : 'Add ingredient'}</DialogTitle>
          </DialogHeader>
          <IngredientForm
            ingredient={editing ?? undefined}
            onSuccess={() => setDialogOpen(false)}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this ingredient. Any recipes using it will be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-white hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
